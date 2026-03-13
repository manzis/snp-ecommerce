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
      fill="#fff"
      d="m17.106 4.798-1.688-1.656a1.125 1.125 0 0 0-1.588 0L7.312 9.579l-2.58-2.503a1.125 1.125 0 0 0-1.587.003L1.458 8.767a1.125 1.125 0 0 0 0 1.59l5.035 5.062a1.126 1.126 0 0 0 1.592 0l9.024-9.027a1.125 1.125 0 0 0-.003-1.594Zm-9.82 9.827L2.25 9.563l1.687-1.688a.042.042 0 0 1 .006.006l2.978 2.889a.563.563 0 0 0 .787 0l6.921-6.832 1.684 1.659-9.027 9.028Z"
    />
  </svg>
)
export default SvgComponent
