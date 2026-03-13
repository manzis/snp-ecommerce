import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    {...props}
  >
    <g fill="#fff" clipPath="url(#a)">
      <path d="M11.233 0H4.766A4.772 4.772 0 0 0 0 4.766v6.467A4.772 4.772 0 0 0 4.766 16h6.467A4.772 4.772 0 0 0 16 11.233V4.766A4.772 4.772 0 0 0 11.233 0Zm3.157 11.233a3.157 3.157 0 0 1-3.157 3.157H4.766a3.157 3.157 0 0 1-3.156-3.157V4.766A3.157 3.157 0 0 1 4.766 1.61h6.467a3.157 3.157 0 0 1 3.157 3.156v6.467Z" />
      <path d="M8 3.862A4.143 4.143 0 0 0 3.862 8 4.143 4.143 0 0 0 8 12.138 4.143 4.143 0 0 0 12.138 8 4.143 4.143 0 0 0 8 3.862Zm0 6.667A2.529 2.529 0 1 1 8 5.47a2.529 2.529 0 0 1 0 5.058ZM12.146 4.884a.992.992 0 1 0 0-1.983.992.992 0 0 0 0 1.983Z" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
export default SvgComponent
