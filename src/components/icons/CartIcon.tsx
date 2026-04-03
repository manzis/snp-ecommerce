import * as React from "react";
import { SVGProps } from "react";

/**
 * CartIcon Component
 * Optimized for dynamic scaling and styling:
 * - Color: Controlled via 'text-{color}' (currentColor)
 * - Size: Controlled via 'w-{px}' and 'h-{px}'
 */
const CartIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 22 20" // Crucial for maintaining aspect ratio while resizing
    fill="none"
    {...props}
  >
    <path
      fill="currentColor"
      d="M9 18a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm8.25-1.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm4.473-11.8-2.404 8.652A2.256 2.256 0 0 1 17.156 15H7.89a2.255 2.255 0 0 1-2.171-1.648L2.43 1.5H.75a.75.75 0 0 1 0-1.5H3a.75.75 0 0 1 .723.55l.889 3.2H21a.75.75 0 0 1 .723.95Zm-1.71.55H5.029l2.138 7.7a.75.75 0 0 0 .723.55h9.266a.75.75 0 0 0 .723-.55l2.134-7.7Z"
    />
  </svg>
);

export default CartIcon;