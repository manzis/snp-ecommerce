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
      stroke="#000"
      strokeLinecap="round"
      strokeWidth={1.5}
      d="m13.5 7.5-3.97 3.97a.75.75 0 0 1-1.06 0L4.5 7.5"
    />
  </svg>
)
export default SvgComponent
