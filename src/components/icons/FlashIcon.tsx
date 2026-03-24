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
      fill="#6A6C6E"
      d="M15.173 8.309a.563.563 0 0 0-.351-.398l-4.051-1.52 1.03-5.155a.562.562 0 0 0-.962-.493L2.964 9.181a.562.562 0 0 0 .211.914l4.052 1.52-1.028 5.15a.562.562 0 0 0 .963.492l7.875-8.438a.563.563 0 0 0 .136-.51ZM7.69 15.047l.737-3.683a.563.563 0 0 0-.352-.637L4.36 9.331l5.95-6.374-.736 3.683a.562.562 0 0 0 .352.637l3.712 1.392-5.948 6.378Z"
    />
  </svg>
)
export default SvgComponent
