import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"

    fill="none"
    {...props}
  >
    <path
      fill="currentColor"
      d="M11.247 10.628a.436.436 0 0 1-.31.747.438.438 0 0 1-.309-.128L7 7.619l-3.628 3.628a.438.438 0 0 1-.619-.619L6.381 7 2.753 3.372a.438.438 0 0 1 .619-.619L7 6.381l3.628-3.628a.438.438 0 1 1 .619.619L7.619 7l3.628 3.628Z"
    />
  </svg>
)
export default SvgComponent
