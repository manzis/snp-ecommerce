import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    {...props}
  >
    <path
      fill="#252525ff"
      d="M12.75 4v6.5a.75.75 0 1 1-1.5 0V5.812l-6.72 6.719a.751.751 0 1 1-1.062-1.063l6.72-6.718H5.5a.75.75 0 0 1 0-1.5H12a.75.75 0 0 1 .75.75Z"
    />
  </svg>
)
export default SvgComponent
