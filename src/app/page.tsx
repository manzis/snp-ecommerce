import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9F9F9] font-titillium px-[24px]">
      
      {/* 410px Design Lock Wrapper for the Demo Card */}
      <main className="relative w-full max-w-[410px] rounded-[24px] bg-white p-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#EAEBF0] text-center overflow-hidden">
        
        {/* Subtle Background Accent */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#EAFFCD]/50 blur-3xl" />
        
        <div className="relative z-10 flex flex-col items-center">
          {/* Logo Placeholder */}
          <div className="mb-[24px] flex h-[60px] w-[60px] items-center justify-center rounded-[16px] bg-[#242424] text-white text-[24px] font-bold">
            SNP
          </div>

          <h1 className="mb-[12px] text-[28px] font-bold leading-[34px] tracking-[-0.8px] text-[#242424]">
            Building the Future of Fitness in Nepal
          </h1>

          <p className="mb-[28px] text-[16px] leading-[24px] text-[#787878] font-normal">
            We are currently engineering a pixel-perfect, high-performance supplement store. 
            Experience the best UI/UX in the industry, built with Next.js and high-end design tokens.
          </p>

          <div className="relative mb-[32px] h-[180px] w-full overflow-hidden rounded-[12px] border border-[#F0F0F0]">
            <Image
              src="/images/highlight-2.png" // Using one of your existing assets
              alt="SNP Store Project"
              fill
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px]">
               <span className="rounded-full bg-white/90 px-4 py-1 text-[12px] font-semibold text-[#242424] shadow-sm">
                 Architecting UI...
               </span>
            </div>
          </div>

          {/* CTA: REDIRECT TO PRODUCT PROTOTYPE */}
          <Link 
            href="/product/atom-whey-protein"
            className="group relative flex h-[52px] w-full items-center justify-center overflow-hidden rounded-[12px] bg-[#3F9733] transition-all hover:bg-[#35822b] active:scale-[0.98]"
          >
            <span className="font-titillium text-[16px] font-semibold text-white">
              View Product Prototype
            </span>
            {/* Hover arrow effect */}
            <span className="ml-2 transform transition-transform group-hover:translate-x-1 text-white">
              →
            </span>
          </Link>
          
          <p className="mt-[16px] text-[12px] font-light text-[#A0A0A0]">
            SNP Store v1.0.0-alpha • Kathmandu, Nepal
          </p>
        </div>
      </main>

      {/* Floating Theme/Helper Button */}
      <button className="fixed bottom-8 right-8 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg border border-[#EAEBF0] text-[20px] transition-transform active:scale-90">
        🌙
      </button>
    </div>
  );
}