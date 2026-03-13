import ProductNav from '@/components/product/ProductNav';
import Breadcrumbs from '@/components/product/Breadcrumbs';
import ProductImage from '@/components/product/ProductImage';
import ProductHeader from '@/components/product/ProductHeader';
import ProductCTA from '@/components/product/ProductCTA';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getProductData(slug: string) {
  return {
    name: "Atom Whey Protein",
    slug: slug,
    category: { name: "Proteins", slug: "proteins" },
    brand: { name: "ASITIS NUTRITION", slug: "asitis-nutrition" },
    title: "Asitis atom whey protein concerntrate - 27g protein 1 bcaa etc",
    images: [
      "/images/atom-whey.jpg",
      "/images/atom-whey-2.jpg", 
      "/images/atom-whey-3.jpg",
      "/images/atom-whey-4.jpg"
    ],
    rating: 4.3,
    reviewsCount: "24.5K+",
    originalPrice: "RS. 5000",
    discountedPrice: "rS. 4290",
    discountPercentage: "20%",
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const product = await getProductData(slug);

  const breadcrumbPath = [
    { name: "Supplements", href: "/supplements" },
    { name: product.category.name, href: `/category/${product.category.slug}` },
    { name: product.brand.name, href: `/brand/${product.brand.slug}` },
    { name: product.name, href: `/product/${product.slug}` }
  ];

  return (
    <div className="relative min-h-screen bg-[#FFFFFF]">
      {/* 
          FIXED HEADER SECTION 
          Locked at top-0. Covers Nav and Breadcrumbs.
      */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFFFFF] w-full">
        <ProductNav />
        <Breadcrumbs path={breadcrumbPath} />
      </header>

      {/* 
          SCROLLABLE CONTENT 
          - pt-[130px]: Clears the fixed top header.
          - pb-[88px]: Clears the 72px fixed bottom CTA + 16px extra spacing.
      */}
      <main className="mx-auto w-full md:max-w-7xl pt-[130px] pb-[100px]">
        
        {/* Image Gallery Section */}
        <section className="mt-[24px] px-[24px]">
          <ProductImage
            images={product.images}
            rating={product.rating}
            reviewsCount={product.reviewsCount}
            productName={product.name}
          />
        </section>

        {/* Product Title and Pricing Section */}
        <section className="mt-[24px]">
          <ProductHeader 
            brand={product.brand.name}
            title={product.title}
            originalPrice={product.originalPrice}
            discountedPrice={product.discountedPrice}
            discountPercentage={product.discountPercentage}
          />
        </section>

        {/* Product Selection Placeholders */}
        <div className="mt-10 px-[24px] space-y-8">
           <div className="h-[200px] bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 font-titillium">
             Flavor & Size Selection (Next)
           </div>
           <div className="h-[500px] bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 font-titillium">
             Specifications
           </div>
        </div>
      </main>

      {/* 
          FIXED BOTTOM CTA 
          Locked at bottom-0. Always visible on mobile/desktop.
      */}
    <ProductCTA />
    </div>
  );
}