import * as React from "react";
import { SVGProps } from "react";

interface HeartIconProps extends SVGProps<SVGSVGElement> {
  filled?: boolean;
}

const HeartIcon = ({ filled = false, className = "", fill, ...props }: HeartIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={18}
    height={18}
    viewBox="0 0 18 18"
    fill="none"
    className={className}
    {...props}
  >
    {filled ? (
      <path
        fill="#ef4444"
        d="M15.68 4.008A4.083 4.083 0 0 0 9.92 4L9 4.855l-.92-.857a4.078 4.078 0 1 0-5.76 5.776l6.283 6.374a.562.562 0 0 0 .802 0l6.275-6.374a4.078 4.078 0 0 0 0-5.766Z"
      />
    ) : (
      <path
        fill={fill || "currentColor"}
        d="M15.68 4.008A4.083 4.083 0 0 0 9.92 4L9 4.855l-.92-.857a4.078 4.078 0 1 0-5.76 5.776l6.283 6.374a.562.562 0 0 0 .802 0l6.275-6.374a4.078 4.078 0 0 0 0-5.766Zm-.798 4.975L9 14.948l-5.885-5.97A2.953 2.953 0 0 1 7.292 4.8l.014.014 1.311 1.22a.563.563 0 0 0 .766 0l1.312-1.22.014-.014a2.953 2.953 0 1 1 4.174 4.18l-.001.002Z"
      />
    )}
  </svg>
);

export default HeartIcon;
