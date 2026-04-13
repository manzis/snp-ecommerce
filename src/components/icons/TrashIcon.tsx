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
      d="M15.188 3.375h-2.813v-.563a1.687 1.687 0 0 0-1.688-1.687H7.313a1.687 1.687 0 0 0-1.688 1.688v.562H2.812a.563.563 0 1 0 0 1.125h.563v10.125A1.125 1.125 0 0 0 4.5 15.75h9a1.125 1.125 0 0 0 1.125-1.125V4.5h.563a.562.562 0 1 0 0-1.125ZM6.75 2.812a.563.563 0 0 1 .563-.562h3.375a.562.562 0 0 1 .562.563v.562h-4.5v-.563Zm6.75 11.813h-9V4.5h9v10.125ZM7.875 7.312v4.5a.562.562 0 1 1-1.125 0v-4.5a.563.563 0 1 1 1.125 0Zm3.375 0v4.5a.562.562 0 1 1-1.125 0v-4.5a.563.563 0 0 1 1.125 0Z"
    />
  </svg>
)
export default SvgComponent
