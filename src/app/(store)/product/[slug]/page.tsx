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
import ReviewsSection from '@/components/product/ReviewsSection';
import QuestionsAndAnswers from '@/components/product/QuestionsAndAnswers';
import WhyChooseUs from '@/components/product/WhyChooseUs';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function getProductData(slug: string) {
  return {
    name: "Atom Whey Protein",
    slug: slug,
    category: { name: "Proteins", slug: "protein" },
    brand: { name: "ASITIS NUTRITION", slug: "asitis-nutrition" },
    title: "Asitis atom whey protein concentrate - 27g protein 1 bcaa etc",
    images: ["/images/atom-whey.jpg", "/images/atom-whey-2.jpg", "/images/atom-whey-3.jpg", "/images/atom-whey-4.jpg"],
    rating: 4.3,
    reviewsCount: "24.5K+",
    originalPrice: "RS. 5000",
    discountedPrice: "RS. 4290",
    discountPercentage: "20%",
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductData(slug);

  const breadcrumbPath = [
    { name: "Supplements", href: "/supplements" },
    { name: product.category.name, href: `/category/${product.category.slug}` },
    { name: product.brand.name, href: `/brand/${product.brand.slug}` },
    { name: product.name, href: `/product/${product.slug}` }
  ];

  return (
    <article className="relative min-h-screen ">
      {/* FIXED HEADER SECTION */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFFFFF]/90 backdrop-blur-md w-full border-b border-[#F5F5F5] shadow-[0_1px_2px_0_rgba(16,24,40,0.04) ">
        <div className="mx-auto w-full">
          <ProductNav />
          <div className="px-0">
            <Breadcrumbs path={breadcrumbPath} />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="mx-auto w-full max-w-[1440px] lg:px-[36px] pt-[150px] pb-[32px] px-0 ">

        <div className="flex flex-row flex-wrap justify-center lg:justify-between lg:items-start items-start gap-y-[32px] lg:mt-[20px] lg:px-[24px]">

          {/* LEFT COLUMN: IMAGERY & HIGHLIGHTS (Desktop Only for Highlights) */}
          <div className="w-full max-w-[700px] lg:max-w-[1000] lg:w-[58%] lg:sticky lg:top-[160px] px-[24px] lg:px-[0] flex flex-col gap-y-[32px] lg:gap-y-[60px]">
            <ProductImage
              images={product.images}
              rating={product.rating}
              reviewsCount={product.reviewsCount}
              productName={product.name}
            />

            {/* 
                DESKTOP EXCLUSIVE: Product Highlights 
                - hidden: Hidden on mobile/tablet
                - lg:block: Visible only on desktop laptops
            */}
            <div className="hidden lg:block">
              <ProductHighlights />
            </div>
          </div>

          {/* RIGHT COLUMN: DETAILS & MOBILE HIGHLIGHTS */}
          <div className="w-full max-w-[700px] lg:max-w-none lg:w-[38%] flex flex-col px-[24px] lg:px-[0] ">
            <ProductHeader
              brand={product.brand.name}
              title={product.title}
              originalPrice={product.originalPrice}
              discountedPrice={product.discountedPrice}
              discountPercentage={product.discountPercentage}
            />

            {/* SPACED COMPONENTS */}
            <div className="mt-[30px] flex flex-col gap-y-[30px] lg:gap-y-[40px] bg-white">
              <ProductOptions />
              <Availability />
              <ServiceHighlights />

              {/* 
                   MOBILE/TABLET EXCLUSIVE: Product Highlights
                   - block: Visible on mobile (maintaining vertical order)
                   - lg:hidden: Removed from DOM flow on desktop
               */}
              <div className="lg:hidden">
                <ProductHighlights />
              </div>
              <div className="lg:hidden ">
                <ProductDetails />
              </div>
              <div className="lg:hidden ">
                <ReviewsSection />
              </div>
              <div className="lg:hidden ">
                <QuestionsAndAnswers />
              </div>
              <div className="lg:hidden ">
                <WhyChooseUs />
              </div>
              <div className="lg:hidden ">
              </div>
            </div>

          </div>
        </div>

        <div className="hidden lg:block lg:mt-[28px] lg:px-[24px]">
          <ProductDetails />
        </div>
        <div className="hidden lg:block lg:mt-[28px] lg:px-[24px]">
          <ReviewsSection />
        </div>
        <div className="hidden lg:block lg:mt-[28px] lg:px-[24px]">
          <QuestionsAndAnswers />
        </div>
        <div className="hidden lg:block lg:mt-[28px] ">
          <WhyChooseUs />
        </div>
      </main>

      <ProductCTA />
    </article>
  );
}








