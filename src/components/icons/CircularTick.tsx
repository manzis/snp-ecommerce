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
    <path
      fill="#3F9733"
      d="M10.854 6.146a.502.502 0 0 1 0 .708l-3.5 3.5a.502.502 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 9.293l3.146-3.147a.5.5 0 0 1 .708 0ZM14.5 8A6.5 6.5 0 1 1 8 1.5 6.507 6.507 0 0 1 14.5 8Zm-1 0A5.5 5.5 0 1 0 8 13.5 5.506 5.506 0 0 0 13.5 8Z"
    />
  </svg>
)
export default SvgComponent
