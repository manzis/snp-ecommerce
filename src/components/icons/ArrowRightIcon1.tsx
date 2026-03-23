
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
      stroke="#68727D"
      strokeLinecap="round"
      strokeWidth={1.67}
      d="M3.333 8H12M8.667 4l3.528 3.529c.26.26.26.682 0 .942L8.667 12"
    />
  </svg>
)
export default SvgComponent
