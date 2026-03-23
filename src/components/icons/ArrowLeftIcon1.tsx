
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
      strokeWidth={2}
      d="M12.667 8H4m3.333-4L3.805 7.529a.667.667 0 0 0 0 .942L7.333 12"
    />
  </svg>
)
export default SvgComponent
