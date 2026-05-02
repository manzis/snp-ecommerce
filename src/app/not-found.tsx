import Link from 'next/link';
import Image from 'next/image';
import FloatingNav from '@/components/layout/FloatingNav';

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-white">
      <FloatingNav showBanner={false} />
      
      <main className="flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center max-w-[600px] mx-auto">
        <div className="relative w-full max-w-[300px] aspect-square mb-8">
          <Image
            src="/images/empty-cart.png" 
            alt="404 Not Found"
            fill
            className="object-contain grayscale opacity-50"
          />
        </div>

        <h1 className="font-custom text-[48px] leading-[1.1] text-[#242424] mb-4">
          Oops! Page not found
        </h1>
        
        <p className="font-titillium text-[16px] text-[#626262] leading-[24px] mb-10">
          The page you're looking for doesn't exist or has been moved. 
          Don't worry, you can still find the best supplements in Nepal.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link
            href="/"
            className="flex-1 h-[52px] flex items-center justify-center bg-[#419f34] text-white font-custom text-[16px] rounded-[12px] hover:bg-[#358a2a] transition-all active:scale-95"
          >
            Back to Home
          </Link>
          <Link
            href="/search"
            className="flex-1 h-[52px] flex items-center justify-center border border-[#e2e8f0] text-[#242424] font-custom text-[16px] rounded-[12px] hover:bg-gray-50 transition-all active:scale-95"
          >
            Search Products
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 w-full">
          <p className="font-titillium text-[14px] text-[#94a3b8]">
            Need help? <Link href="/contact" className="text-[#419f34] font-semibold underline">Contact Support</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
