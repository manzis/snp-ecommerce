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
      fill="#BEBEBE"
      d="M14.46 13.665a.563.563 0 1 1-.796.796L9 9.794 4.335 14.46a.563.563 0 1 1-.796-.795L8.205 9 3.539 4.336a.563.563 0 1 1 .796-.796L9 8.205l4.664-4.665a.563.563 0 1 1 .796.796L9.795 9l4.665 4.665Z"
    />
  </svg>
)
export default SvgComponent
