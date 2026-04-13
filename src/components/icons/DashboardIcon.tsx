import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
    <path
      stroke="currentColor"
      strokeWidth={1.5}
      d="M3 19a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3ZM3 8a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3ZM13.964 5.086a2 2 0 0 0 0 2.828l2.122 2.122a2 2 0 0 0 2.828 0l2.121-2.122a2 2 0 0 0 0-2.828l-2.12-2.122a2 2 0 0 0-2.83 0l-2.12 2.122ZM14 19a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-3a2 2 0 0 0-2 2v3Z"
    />
  </svg>
)
export default SvgComponent
