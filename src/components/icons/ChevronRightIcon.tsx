import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={12}
    height={12}
    fill="none"
    {...props}
  >
    <path
      fill="#A4A4A4"
      d="m8.515 6.265-3.75 3.75a.375.375 0 0 1-.53-.53L7.72 6 4.235 2.515a.375.375 0 0 1 .53-.53l3.75 3.75a.375.375 0 0 1 0 .53Z"
    />
  </svg>
)
export default SvgComponent


