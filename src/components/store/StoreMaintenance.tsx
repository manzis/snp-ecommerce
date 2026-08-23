import React from 'react';
import StoreIcon from '@/components/icons/StoreIcon';

export default function StoreMaintenance({ message }: { message: string }) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#081908] pointer-events-auto overflow-hidden min-h-[100dvh]"
    >
      {/* Abstract Background Illustration (Hand-drawn Doodles) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Playful Squiggly Doodle Pattern (Hardware Accelerated CSS Background) */}
        <div 
          className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] opacity-[0.06] rotate-[5deg] pointer-events-none" 
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cg stroke='%23ffffff' stroke-width='6' stroke-linecap='round' stroke-linejoin='round' fill='none'%3E%3Cpath d='M 0,75 Q 50,25 100,75 T 200,75'/%3E%3Crect x='130' y='120' width='28' height='60' rx='14' transform='rotate(30 144 150)'/%3E%3Cline x1='130' y1='150' x2='158' y2='150' transform='rotate(30 144 150)'/%3E%3Crect x='70' y='10' width='50' height='24' rx='12' transform='rotate(-15 95 22)'/%3E%3Cline x1='95' y1='10' x2='95' y2='34' transform='rotate(-15 95 22)'/%3E%3Ccircle cx='40' cy='160' r='20'/%3E%3Cpath d='M 35,160 h 10 M 40,155 v 10' stroke-width='4'/%3E%3Ccircle cx='180' cy='40' r='4' fill='%23ffffff' stroke='none'/%3E%3Ccircle cx='10' cy='30' r='4' fill='%23ffffff' stroke='none'/%3E%3Cpath d='M 160,170 C 140,195 190,195 180,170'/%3E%3C/g%3E%3C/svg%3E")`, 
            backgroundSize: '260px 260px',
            willChange: 'transform'
          }} 
        />
        {/* Radial Mask to fade out edges */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,#081908_90%)]"></div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center gap-6 z-10 p-6 max-w-lg text-center animate-fade-in-up">
        {/* Brand Logo & Spinner */}
        <div className="relative flex items-center justify-center w-20 h-20 mb-2">
          <div className="absolute inset-0 border-4 border-[#308026]/30 border-t-[#95FF00] rounded-full animate-spin"></div>
          <img src="/images/logo.png" alt="Supplyment Nepal" className="w-[60px] h-[60px] object-cover rounded-full drop-shadow-md z-10 relative" />
        </div>

        {/* Maintenance Text */}
        <div className="flex flex-col items-center">
          <h1 className="text-[#95FF00] font-rajdhani text-[32px] md:text-[40px] font-bold tracking-tight uppercase leading-none">
            Store Offline
          </h1>
          <p className="text-[#ffffff]/80 font-inter text-[14px] md:text-[16px] font-medium tracking-normal mt-4">
            {message || 'The store is currently not available!'}
          </p>
        </div>

      </div>
    </div>
  );
}
