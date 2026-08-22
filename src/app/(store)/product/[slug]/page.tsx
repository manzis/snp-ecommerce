import ProductNav from '@/components/product/ProductNav';
import ProductPageSkeleton from '@/components/product/ProductPageSkeleton';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ProductImage from '@/components/product/ProductImage';
import ProductHeader from '@/components/product/ProductHeader';
import ProductCTA from '@/components/product/ProductCTA';
import ProductOptions from '@/components/product/ProductOptions';
import Availability from '@/components/product/Availability';
import ServiceHighlights from '@/components/product/ServiceHighlight';
import ProductHighlights from '@/components/product/ProductHighlight';
import ProductDetails from '@/components/product/ProductDetails';
import ProductBanners from '@/components/product/ProductBanners';
import LegacyProductBanners from '@/components/product/LegacyProductBanners';
import ReviewsSection from '@/components/product/ReviewsSection';
import QuestionsAndAnswers from '@/components/product/QuestionsAndAnswers';
import WhyChooseUs from '@/components/product/WhyChooseUs';
import FeaturedProductsSection from '@/components/product/FeaturedProductsSection';
import MoreByBrandSection from '@/components/product/MoreByBrandSection';
import ProductJsonLd from '@/components/seo/ProductJsonLd';

import { fetchProducts, fetchProductBySlug, fetchProductSEO, fetchRelatedProducts, fetchBrandRelatedProducts, fetchProductReviews, fetchProductQA } from '@/services/productService.server';
import { fetchActiveSaleForProductAction } from '@/app/actions/saleActions';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { preload } from 'react-dom';
import type { Metadata } from 'next';
import { getSeoProduct, getSeoGlobal, getSeoProductBySlug } from '@/lib/seo/getSeoData';
import { generateProductFallbackSeo } from '@/lib/seo/seoFallback';
import ProductViewTracker from '@/components/product/ProductViewTracker';
import { getSiteSetting } from '@/services/settingsService';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Return empty paths — products are generated on first request and cached indefinitely.
// This eliminates the massive ISR write spike from pre-rendering all products at build time.
// Cache is busted on-demand via revalidateTag('products') when admin edits a product.
// Pre-render top 50 products to ensure instant loading for best-sellers.
// Other products are generated on first request and cached indefinitely.
export async function generateStaticParams() {
  try {
    const products = await fetchProducts();
    return products.slice(0, 50).map((product) => ({
      slug: product.slug,
    }));
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [];
  }
}

// Allow dynamic params not in generateStaticParams to be rendered on-demand
export const dynamicParams = true;

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  // Parallelize ONLY the essential SEO data to unblock the page shell
  const [product, gSeo, dbOverride] = await Promise.all([
    fetchProductSEO(slug),
    getSeoGlobal(),
    getSeoProductBySlug(slug),
  ]);

  if (!product) return { title: 'Product Not Found | Supplyment Nepal' };


  const fallback = generateProductFallbackSeo(product);
  const title = dbOverride?.custom_title || fallback.title;
  const description = dbOverride?.custom_description || fallback.description;
  const canonical = `https://www.brightsupplements.store/product/${product.slug}`;
  const ogImage = product.images?.[0] || gSeo?.default_og_image || '/icon.png';
  const ogTitle = title;
  const ogDescription = description;

  return {
    title,
    description,
    keywords: fallback.keywords,
    alternates: {
      canonical,
      languages: { 'en-NP': canonical },
    },
    robots: dbOverride
      ? ((dbOverride as any).robots || gSeo?.default_robots || 'index, follow')
      : gSeo?.default_robots || 'index, follow',
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      type: 'website',
      siteName: 'Supplyment Nepal',
      locale: 'en_NP',
      images: [
        {
          url: ogImage,
          width: 1000,
          height: 1000,
          alt: title,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
    },
    other: {
      'prev-image-preload': ogImage // This helps some scanners, but we really want a link tag
    }
  };
}


// ASYNC WRAPPERS FOR STREAMING
async function ReviewsWrapper({ productId }: { productId: string }) {
  const reviews = await fetchProductReviews(productId);
  return <ReviewsSection reviews={reviews} />;
}

async function QAWrapper({ productId }: { productId: string }) {
  const qaPairs = await fetchProductQA(productId);
  return <QuestionsAndAnswers qaPairs={qaPairs} />;
}

async function MoreByBrandWrapper({ 
  productId, 
  brandId, 
  categoryId, 
  brandName, 
  brandSlug, 
  brandLogo 
}: { 
  productId: string; 
  brandId: string; 
  categoryId?: string | null;
  brandName: string;
  brandSlug: string;
  brandLogo?: string | null;
}) {
  const products = await fetchBrandRelatedProducts(productId, brandId, categoryId || null, 10);
  
  if (!products || products.length === 0) return null;

  return (
    <MoreByBrandSection 
      products={products} 
      brandName={brandName} 
      brandSlug={brandSlug} 
      brandLogo={brandLogo} 
    />
  );
}

const SectionSkeleton = ({ height = "200px" }: { height?: string }) => (
  <div className="w-full px-[24px] py-4 animate-pulse">
    <div className={`w-full bg-gray-50 rounded-[12px]`} style={{ height }} />
  </div>
);

async function ProductContent({ slug }: { slug: string }) {
  const [product, dbOverride, bannerSetting] = await Promise.all([
    fetchProductBySlug(slug),
    getSeoProductBySlug(slug),
    getSiteSetting('why_choose_us_banner'),
  ]);

  if (!product) {
    notFound();
  }

  const { data: activeSale } = await fetchActiveSaleForProductAction(product.id);

  // Preload the first image immediately for LCP
  if (product.images?.[0]) {
    preload(product.images[0], { as: 'image', fetchPriority: 'high' });
  }

  const breadcrumbPath = [
    { name: "Supplements", href: "/supplements" },
    { name: product.categories?.name || "Category", href: `/category/${product.categories?.slug || ''}` },
    { name: product.brands?.name || "Brand", href: `/brand/${product.brands?.slug || ''}` },
    { name: product.name, href: `/product/${product.slug}` }
  ];

  // Build FAQ data from admin-defined SEO overrides or DB QA
  const faqData = Array.isArray((dbOverride as any)?.faq_schema)
    ? (dbOverride as any).faq_schema.filter((f: any) => f.question && f.answer)
    : [];

  return (
    <>
      <ProductViewTracker productId={product.id} />
      {/* Rich Product JSON-LD for Google Rich Results */}
      <ProductJsonLd
        name={product.title || product.name}
        description={`Buy authentic ${product.title} by ${product.brands?.name || 'Supplyment Nepal'} in Nepal. ${product.categories?.name || 'Premium supplement'} available at the best price with fast delivery from Supplyment Nepal (brightsupplements.store).`}
        images={product.images || []}
        slug={product.slug}
        brand={product.brands?.name || 'Supplyment Nepal'}
        originalPrice={product.original_price}
        discountedPrice={product.discounted_price}
        stockStatus={product.stock_status || 'in_stock'}
        rating={product.rating}
        reviewCount={product.reviews_count}
        category={product.categories?.name}
        breadcrumbs={[
          { name: product.categories?.name || 'Category', url: `https://www.brightsupplements.store/category/${product.categories?.slug || ''}` },
          { name: product.brands?.name || 'Brand', url: `https://www.brightsupplements.store/brand/${product.brands?.slug || ''}` },
          { name: product.name, url: `https://www.brightsupplements.store/product/${product.slug}` },
        ]}
        faqs={faqData}
        priceOverride={(dbOverride as any)?.rich_snippet_data?.price ? Number((dbOverride as any).rich_snippet_data.price) : undefined}
        stockStatusOverride={(dbOverride as any)?.rich_snippet_data?.stock_status}
        ratingOverride={(dbOverride as any)?.rich_snippet_data?.rating_value ? Number((dbOverride as any).rich_snippet_data.rating_value) : undefined}
      />
      <header className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pointer-events-none w-full bg-[#FFFFFF]/90 backdrop-blur-md border-b border-black/5">
        <div className="pointer-events-auto relative w-full max-w-[410px] md:max-w-[1440px] mx-auto">
          <ProductNav />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] lg:px-[36px] pt-[80px] pb-[32px] px-0 animate-page-enter">
        <div className="w-full">
          <Breadcrumbs path={breadcrumbPath} />
        </div>
        <div className="flex flex-row flex-wrap justify-center lg:justify-between lg:items-start items-start gap-y-[32px] lg:mt-[20px] lg:px-[24px]">
          {/* LEFT COLUMN: IMAGERY & HIGHLIGHTS */}
          <div className="w-full max-w-[700px] lg:max-w-[1000] lg:w-[58%] px-[24px] lg:px-[0] flex flex-col gap-y-[32px] lg:gap-y-[60px]">
            <div className="flex flex-col gap-y-[4px] lg:gap-y-[6px]">
              <ProductImage
                images={product.images || []}
                rating={product.rating}
                reviewsCount={product.reviews_count}
                productName={product.name}
                stockStatus={product.stock_status}
                flavours={product.product_flavours || []}
              />
            </div>
            {product.highlights && product.highlights.length > 0 && (
              <div className="hidden lg:block">
                <ProductHighlights highlights={product.highlights} />
              </div>
            )}
            {/* ProductDetails: Desktop only in left column */}
            <div className="hidden lg:block">
              <ProductDetails product={product} />
            </div>
            {/* Brand & Reviews: Desktop only in left column */}
            <div className="hidden lg:block">
              {product.brands?.id && (
                <div className="mt-8">
                  <Suspense fallback={<SectionSkeleton height="250px" />}>
                    <MoreByBrandWrapper 
                      productId={product.id} 
                      brandId={product.brands.id}
                      categoryId={product.category_id}
                      brandName={product.brands.name}
                      brandSlug={product.brands.slug}
                      brandLogo={product.brands.image_url}
                    />
                  </Suspense>
                </div>
              )}
              <div className="mt-8">
                <Suspense fallback={<SectionSkeleton height="200px" />}>
                  <ReviewsWrapper productId={product.id} />
                </Suspense>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: DETAILS */}
          <div className="w-full max-w-[700px] lg:max-w-none lg:w-[38%] flex flex-col lg:px-[0] ">
            <ProductHeader
              productSlug={product.slug}
              brand={{
                name: product.brands?.name || '',
                slug: product.brands?.slug || '',
                image_url: product.brands?.image_url
              }}
              title={product.title}
              originalPrice={product.original_price}
              discountedPrice={product.discounted_price}
              discountPercentage={product.discount_percentage}
              activeSale={activeSale}
            />
            <div className="mt-[24px] flex flex-col gap-y-[30px] lg:gap-y-[40px] bg-white">
              <ProductOptions product={product} sizes={product.product_sizes || []} flavours={product.product_flavours || []} seller={product.sellers || null} />
              <Availability productSlug={product.slug} stockStatus={product.stock_status || 'in_stock'} />
              <ServiceHighlights />
              {product.highlights && product.highlights.length > 0 && (
                <div className="lg:hidden">
                  <ProductHighlights highlights={product.highlights} />
                </div>
              )}
              <div className="w-full lg:hidden">
                <ProductDetails product={product} />
              </div>
              <div className="w-full lg:hidden">
                <LegacyProductBanners
                  banners={[
                    product.banner_image1,
                    product.banner_image2,
                    product.banner_image3,
                    product.banner_image4
                  ]}
                />
                {product.brands?.id && (
                  <div className="mt-8">
                    <Suspense fallback={<SectionSkeleton height="250px" />}>
                      <MoreByBrandWrapper 
                        productId={product.id} 
                        brandId={product.brands.id}
                        categoryId={product.category_id}
                        brandName={product.brands.name}
                        brandSlug={product.brands.slug}
                        brandLogo={product.brands.image_url}
                      />
                    </Suspense>
                  </div>
                )}
                <div className="mt-6">
                  <Suspense fallback={<SectionSkeleton height="200px" />}>
                    <ReviewsWrapper productId={product.id} />
                  </Suspense>
                </div>
              </div>
              <div className="w-full">
                <Suspense fallback={<SectionSkeleton height="150px" />}>
                  <QAWrapper productId={product.id} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-full mt-[32px] lg:mt-[48px] px-[24px] lg:px-[0]">
          <LegacyProductBanners
            banners={[
              product.banner_image1,
              product.banner_image2,
              product.banner_image3,
              product.banner_image4
            ]}
          />
        </div>

        <div className="w-full mt-[32px] lg:mt-[48px]">
          <ProductBanners linkedBanners={product.product_banners} />
        </div>
        <div className="w-full mt-[32px] lg:mt-[48px]">
          <WhyChooseUs imageUrl={bannerSetting?.imageUrl} />
        </div>
        <div className="w-full mt-[32px] lg:mt-[48px] pb-[40px]">
          <Suspense fallback={<SectionSkeleton height="400px" />}>
            <FeaturedProductsSection productId={product.id} categoryId={product.category_id} />
          </Suspense>
        </div>
      </main>
      <ProductCTA productSlug={product.slug} stockStatus={product.stock_status} />
    </>
  );
}

/**
 * PRODUCT PAGE ENTRY POINT
 * This component is intentionally NOT async to allow the Suspense 
 * shell (skeleton) to be sent to the browser immediately.
 */
export default function ProductPage({ params }: ProductPageProps) {
  return (
    <article className="relative min-h-screen">
      <Suspense fallback={<ProductPageSkeleton />}>
        <ProductContentWrapper params={params} />
      </Suspense>
    </article>
  );
}

async function ProductContentWrapper({ params }: ProductPageProps) {
  const { slug } = await params;
  return <ProductContent slug={slug} />;
}








