import ProductNav from '@/components/product/ProductNav';
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
import ReviewsSection from '@/components/product/ReviewsSection';
import QuestionsAndAnswers from '@/components/product/QuestionsAndAnswers';
import WhyChooseUs from '@/components/product/WhyChooseUs';
import FeaturedProductsSection from '@/components/product/FeaturedProductsSection';

import { fetchProductBySlug, fetchProductReviews, fetchProductQA } from '@/services/productService.server';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
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

const SectionSkeleton = ({ height = "200px" }: { height?: string }) => (
  <div className="w-full px-[24px] py-4 animate-pulse">
    <div className={`w-full bg-gray-50 rounded-[12px]`} style={{ height }} />
  </div>
);

const ProductPageSkeleton = () => (
  <div className="mx-auto w-full max-w-[1440px] lg:px-[36px] pt-[140px] pb-[32px] px-0 animate-pulse">
    <div className="flex flex-row flex-wrap justify-center lg:justify-between lg:items-start items-start gap-y-[32px] lg:mt-[20px] lg:px-[24px]">
      <div className="w-full max-w-[700px] lg:w-[58%] aspect-square bg-gray-50 rounded-[20px]" />
      <div className="w-full max-w-[700px] lg:w-[38%] flex flex-col gap-6">
        <div className="h-10 w-3/4 bg-gray-50 rounded" />
        <div className="h-6 w-1/4 bg-gray-50 rounded" />
        <div className="h-[200px] w-full bg-gray-50 rounded" />
      </div>
    </div>
  </div>
);

async function ProductContent({ slug }: { slug: string }) {
  const product = await fetchProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const breadcrumbPath = [
    { name: "Supplements", href: "/supplements" },
    { name: product.categories?.name || "Category", href: `/category/${product.categories?.slug || ''}` },
    { name: product.brands?.name || "Brand", href: `/brand/${product.brands?.slug || ''}` },
    { name: product.name, href: `/product/${product.slug}` }
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFFFFF]/90 backdrop-blur-md w-full border-b border-[#F5F5F5] shadow-[0_1px_2px_0_rgba(16,24,40,0.04) ">
        <div className="mx-auto w-full">
          <ProductNav />
          <div className="px-0">
            <Breadcrumbs path={breadcrumbPath} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] lg:px-[36px] pt-[140px] pb-[32px] px-0 ">
        <div className="flex flex-row flex-wrap justify-center lg:justify-between lg:items-start items-start gap-y-[32px] lg:mt-[20px] lg:px-[24px]">
          {/* LEFT COLUMN: IMAGERY & HIGHLIGHTS */}
          <div className="w-full max-w-[700px] lg:max-w-[1000] lg:w-[58%] lg:sticky lg:top-[160px] px-[24px] lg:px-[0] flex flex-col gap-y-[32px] lg:gap-y-[60px]">
            <ProductImage
              images={product.images || []}
              rating={product.rating}
              reviewsCount={product.reviews_count}
              productName={product.name}
              stockStatus={product.stock_status}
              flavours={product.product_flavours || []}
            />
            {product.highlights && product.highlights.length > 0 && (
              <div className="hidden lg:block">
                <ProductHighlights highlights={product.highlights} />
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: DETAILS */}
          <div className="w-full max-w-[700px] lg:max-w-none lg:w-[38%] flex flex-col lg:px-[0] ">
            <ProductHeader
              brand={{
                name: product.brands?.name || '',
                slug: product.brands?.slug || '',
                image_url: product.brands?.image_url
              }}
              title={product.title}
              originalPrice={product.original_price}
              discountedPrice={product.discounted_price}
              discountPercentage={product.discount_percentage}
            />
            <div className="mt-[24px] flex flex-col gap-y-[30px] lg:gap-y-[40px] bg-white">
              <ProductOptions product={product} sizes={product.product_sizes || []} flavours={product.product_flavours || []} seller={product.sellers || null} />
              <Availability stockStatus={product.stock_status || 'in_stock'} />
              <ServiceHighlights />
              {product.highlights && product.highlights.length > 0 && (
                <div className="lg:hidden">
                  <ProductHighlights highlights={product.highlights} />
                </div>
              )}
              <div className="lg:hidden ">
                <ProductDetails product={product} />
              </div>
              <div className="lg:hidden">
                <ProductBanners 
                  banners={[
                    product.banner_image1, 
                    product.banner_image2,
                    product.banner_image3,
                    product.banner_image4
                  ]} 
                />
              </div>
              <div className="lg:hidden ">
                <Suspense fallback={<SectionSkeleton height="200px" />}>
                  <ReviewsWrapper productId={product.id} />
                </Suspense>
              </div>
              <div className="lg:hidden ">
                <Suspense fallback={<SectionSkeleton height="150px" />}>
                  <QAWrapper productId={product.id} />
                </Suspense>
              </div>
              <div className="lg:hidden ">
                <WhyChooseUs />
              </div>
              <div className="lg:hidden pb-[10px]">
                <Suspense fallback={<SectionSkeleton height="300px" />}>
                  <FeaturedProductsSection productId={product.id} categoryId={product.category_id} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block lg:mt-[28px] lg:px-[24px]">
          <ProductDetails product={product} />
        </div>
        <div className="hidden lg:block">
          <ProductBanners 
            banners={[
              product.banner_image1, 
              product.banner_image2,
              product.banner_image3,
              product.banner_image4
            ]} 
          />
        </div>
        <div className="hidden lg:block lg:mt-[28px] lg:px-[24px]">
          <Suspense fallback={<SectionSkeleton height="300px" />}>
            <ReviewsWrapper productId={product.id} />
          </Suspense>
        </div>
        <div className="hidden lg:block lg:mt-[28px] lg:px-[24px]">
          <Suspense fallback={<SectionSkeleton height="200px" />}>
            <QAWrapper productId={product.id} />
          </Suspense>
        </div>
        <div className="hidden lg:block lg:mt-[28px] ">
          <WhyChooseUs />
        </div>
        <div className="hidden lg:block lg:mt-[28px] lg:mb-[40px]">
          <Suspense fallback={<SectionSkeleton height="400px" />}>
            <FeaturedProductsSection productId={product.id} categoryId={product.category_id} />
          </Suspense>
        </div>
      </main>
      <ProductCTA stockStatus={product.stock_status} />
    </>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  return (
    <article className="relative min-h-screen ">
      <Suspense fallback={
        <>
          <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFFFFF]/90 backdrop-blur-md w-full border-b border-[#F5F5F5]">
            <ProductNav />
          </header>
          <ProductPageSkeleton />
        </>
      }>
        <ProductContent slug={slug} />
      </Suspense>
    </article>
  );
}








