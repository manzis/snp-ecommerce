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
      d="M10 1.875A8.125 8.125 0 1 0 18.125 10 8.133 8.133 0 0 0 10 1.875Zm0 15A6.875 6.875 0 1 1 16.875 10 6.883 6.883 0 0 1 10 16.875ZM7.5 10a2.5 2.5 0 0 0 4.5 1.5.625.625 0 0 1 1 .75 3.75 3.75 0 1 1 0-4.5.625.625 0 1 1-1 .75A2.5 2.5 0 0 0 7.5 10Z"
    />
  </svg>
)
export default SvgComponent
