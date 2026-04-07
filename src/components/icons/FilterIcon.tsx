import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    fill="none"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      d="M13.057 2H2.943a.943.943 0 0 0-.667 1.61l3.138 3.138A2 2 0 0 1 6 8.162v2.602a2 2 0 0 0 1.106 1.789l2.17 1.085a.5.5 0 0 0 .724-.447v-5.03a2 2 0 0 1 .586-1.413l3.138-3.139A.943.943 0 0 0 13.057 2Z"
    />
  </svg>
)
export default SvgComponent
