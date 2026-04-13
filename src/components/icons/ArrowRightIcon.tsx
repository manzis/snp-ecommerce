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
    <path
      fill="currentColor"
      d="m15.585 9.398-5.062 5.062a.563.563 0 0 1-.796-.796l4.103-4.102H2.812a.563.563 0 1 1 0-1.125H13.83L9.727 4.335a.563.563 0 1 1 .796-.796l5.063 5.063a.562.562 0 0 1 0 .796Z"
    />
  </svg>
)
export default SvgComponent
