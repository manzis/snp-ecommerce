import * as React from "react"
import { SVGProps } from "react"

const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    className="rotate-180"
    {...props}
  >
    <path
      fill="#979797"
      d="m13.354 6.354-5 5a.499.499 0 0 1-.708 0l-5-5a.5.5 0 1 1 .708-.708L8 10.293l4.646-4.647a.5.5 0 0 1 .707.708Z"
    />
  </svg>
)

export default SvgComponent
