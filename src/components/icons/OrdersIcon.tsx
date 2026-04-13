import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={1.5}
      d="M3 4h.606a2 2 0 0 1 1.989 1.783l.81 7.434A2 2 0 0 0 8.394 15h8.652a2 2 0 0 0 1.938-1.506l1.402-7.31a.5.5 0 0 0-.491-.595H5.564m1.06 13.036h.75m-.75.75h.75m10.25-.75h.75m-.75.75h.75M8 19a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm11 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
    />
  </svg>
)
export default SvgComponent

