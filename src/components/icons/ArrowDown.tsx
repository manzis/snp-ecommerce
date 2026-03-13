import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <path
      fill="#fff"
      d="m16.692 7.942-6.25 6.25a.623.623 0 0 1-.884 0l-6.25-6.25a.625.625 0 0 1 .884-.884L10 12.866l5.808-5.808a.626.626 0 0 1 .884.884Z"
    />
  </svg>
)
export default SvgComponent
