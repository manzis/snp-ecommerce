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
      fill="currentColor"
      d="m7.942 3.308 6.25 6.25a.626.626 0 0 1 0 .884l-6.25 6.25a.625.625 0 0 1-.884-.884L12.867 10l-5.81-5.808a.625.625 0 1 1 .885-.884Z"
    />
  </svg>
)
export default SvgComponent
