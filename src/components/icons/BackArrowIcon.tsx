import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <path
      stroke="#1D1D1D"
      strokeLinecap="round"
      strokeWidth={2}
      d="M19 12H6m5-6-5.293 5.293a1 1 0 0 0 0 1.414L11 18"
    />
  </svg>
)
export default SvgComponent
