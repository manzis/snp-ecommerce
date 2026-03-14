import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={18}
    height={18}
    fill="none"
    {...props}
  >
    <g clipPath="url(#a)">
      <path
        fill="#242424"
        d="m17.96 8.227-.985-2.461a1.12 1.12 0 0 0-1.044-.704H13.5V4.5a.563.563 0 0 0-.563-.563H2.25a1.125 1.125 0 0 0-1.125 1.126v7.875a1.125 1.125 0 0 0 1.125 1.124h1.195a2.25 2.25 0 0 0 4.36 0h3.515a2.25 2.25 0 0 0 4.36 0h1.195A1.125 1.125 0 0 0 18 12.938v-4.5a.559.559 0 0 0-.04-.211Zm-4.46-2.04h2.431l.675 1.688H13.5V6.187ZM2.25 5.063h10.125v4.5H2.25v-4.5Zm3.375 9.563a1.125 1.125 0 1 1 0-2.25 1.125 1.125 0 0 1 0 2.25Zm5.695-1.688H7.805a2.25 2.25 0 0 0-4.36 0H2.25v-2.25h10.125v.866a2.257 2.257 0 0 0-1.055 1.384Zm2.18 1.688a1.125 1.125 0 1 1 0-2.25 1.125 1.125 0 0 1 0 2.25Zm3.375-1.688H15.68a2.254 2.254 0 0 0-2.18-1.687V9h3.375v3.938Z"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h18v18H0z" />
      </clipPath>
    </defs>
  </svg>
)
export default SvgComponent
