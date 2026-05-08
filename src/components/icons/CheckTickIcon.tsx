import React from 'react';

const CheckTickIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="141"
      height="141"
      viewBox="0 0 141 141"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_i_1408_449)">
        <path d="M66 129C95.8234 129 120 104.823 120 75C120 45.1766 95.8234 21 66 21C36.1766 21 12 45.1766 12 75C12 104.823 36.1766 129 66 129Z" fill="url(#paint0_linear_1408_449)" />
      </g>
      <path d="M66 26C93.062 26 115 47.938 115 75C115 102.062 93.062 124 66 124C38.938 124 17 102.062 17 75C17 47.938 38.938 26 66 26Z" stroke="#8BFF84" strokeWidth="10" />
      <path d="M46 77.3097L59.5685 90.9787L86.4035 63.9424" stroke="#27AE60" strokeWidth="10" />
      <path d="M46 73.3673L59.5685 87.0363L86.4035 60" stroke="white" strokeWidth="10" />
      <defs>
        <filter id="filter0_i_1408_449" x="11" y="21" width="109" height="109" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dx="-11" dy="8" />
          <feGaussianBlur stdDeviation="0.5" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.152941 0 0 0 0 0.682353 0 0 0 0 0.376471 0 0 0 1 0" />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_1408_449" />
        </filter>
        <linearGradient id="paint0_linear_1408_449" x1="148.723" y1="-21.0511" x2="29.234" y2="46.966" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00FF6C" />
          <stop offset="1" stopColor="#00D720" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default CheckTickIcon;
