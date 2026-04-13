import ProductImage from '@/components/product/ProductImage';
import ProductHeader from '@/components/product/ProductHeader';
import ProductCTA from '@/components/product/ProductCTA';
import ProductOptions from '@/components/product/ProductOptions';
import Availability from '@/components/product/Availability';
import ServiceHighlights from '@/components/product/ServiceHighlight';
import ProductHighlights from '@/components/product/ProductHighlight';
import ProductDetails from '@/components/product/ProductDetails';
import ReviewsSection from '@/components/product/ReviewsSection';
import QuestionsAndAnswers from '@/components/product/QuestionsAndAnswers';
import WhyChooseUs from '@/components/product/WhyChooseUs';
import Link from 'next/link';

// Essential Storefront Context Providers for preview interoperability
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { AuthModalProvider } from '@/context/AuthModalContext';
import { ToastProvider } from '@/components/ui/ToastProvider';

import { fetchProductBySlug, fetchProductReviews, fetchProductQA } from '@/services/productService';
import { notFound } from 'next/navigation';

interface AdminProductPreviewProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminProductPreviewPage({ params }: AdminProductPreviewProps) {
  const { slug } = await params;
  // Bypassing the strict is_published requirement for the Admin Preview specifically
  const product = await fetchProductBySlug(slug, { requirePublished: false });

  if (!product) {
    notFound();
  }

  const [reviews, qaPairs] = await Promise.all([
    fetchProductReviews(product.id),
    fetchProductQA(product.id)
  ]);

  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <AuthModalProvider>
            <article className="relative h-full w-full overflow-y-auto bg-white custom-scrollbar flex flex-col pt-[50px] pb-[80px] font-titillium">
              {/* ADMIN PREVIEW BANNER */}
              <div className="absolute top-0 left-0 right-0 z-[60] bg-indigo-600 text-white px-4 py-3 flex items-center justify-between text-[13px] font-medium font-rubik shadow-md">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-white animate-pulse"></span>
                  ADMIN PREVIEW MODE
                </div>
                <div className="flex items-center gap-4">
                  <span className="opacity-80 font-regular hidden md:block">Viewing: {product.is_published ? 'Published (Live)' : 'Draft (Unpublished)'}</span>
                  <Link href="/admin/products" className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-[6px] transition-colors">
                    Exit Preview
                  </Link>
                </div>
              </div>

              {/* MAIN CONTENT AREA */}
              <main className="mx-auto w-full max-w-[1440px] lg:px-[36px] pt-[20px] pb-[32px] px-0 ">
                <div className="flex flex-row flex-wrap justify-center lg:justify-between lg:items-start items-start gap-y-[32px] lg:mt-[20px] lg:px-[24px]">

                  {/* LEFT COLUMN: IMAGERY & HIGHLIGHTS */}
                  <div className="w-full max-w-[700px] lg:max-w-[1000px] lg:w-[58%] lg:sticky lg:top-[20px] px-[24px] lg:px-[0] flex flex-col gap-y-[32px] lg:gap-y-[60px]">
                    <ProductImage
                      images={product.images || []}
                      rating={product.rating}
                      reviewsCount={product.reviews_count}
                      productName={product.name}
                      stockStatus={product.stock_status}
                      flavours={product.product_flavours || []}
                    />

                    <div className="hidden lg:block">
                      <ProductHighlights highlights={product.highlights || []} />
                    </div>
                  </div>

                  {/* RIGHT COLUMN: DETAILS & MOBILE HIGHLIGHTS */}
                  <div className="w-full max-w-[700px] lg:max-w-none lg:w-[38%] flex flex-col lg:px-[0] ">
                    <ProductHeader
                      brand={product.brands?.name || ''}
                      title={product.title}
                      originalPrice={product.original_price}
                      discountedPrice={product.discounted_price}
                      discountPercentage={product.discount_percentage}
                    />

                    {/* SPACED COMPONENTS */}
                    <div className="mt-[24px] flex flex-col gap-y-[30px] lg:gap-y-[40px] bg-white">
                      <ProductOptions product={product} sizes={product.product_sizes || []} flavours={product.product_flavours || []} seller={product.sellers || null} />
                      <Availability stockStatus={product.stock_status || 'in_stock'} />
                      <ServiceHighlights />

                      <div className="lg:hidden">
                        <ProductHighlights highlights={product.highlights || []} />
                      </div>
                      <div className="lg:hidden">
                        <ProductDetails product={product} />
                      </div>
                      <div className="lg:hidden">
                        <ReviewsSection reviews={reviews} />
                      </div>
                      <div className="lg:hidden">
                        <QuestionsAndAnswers qaPairs={qaPairs} />
                      </div>
                      <div className="lg:hidden">
                        <WhyChooseUs />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block lg:mt-[28px] lg:px-[24px]">
                  <ProductDetails product={product} />
                </div>
                <div className="hidden lg:block lg:mt-[28px] lg:px-[24px]">
                  <ReviewsSection reviews={reviews} />
                </div>
                <div className="hidden lg:block lg:mt-[28px] lg:px-[24px]">
                  <QuestionsAndAnswers qaPairs={qaPairs} />
                </div>
                <div className="hidden lg:block lg:mt-[28px] ">
                  <WhyChooseUs />
                </div>
              </main>

              <ProductCTA stockStatus={product.stock_status} isPreview />
            </article>
          </AuthModalProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
