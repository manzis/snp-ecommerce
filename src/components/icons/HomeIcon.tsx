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
      fill="#242424"
      d="M15 13h-1V8.5l.146.146a.5.5 0 0 0 .708-.709L8.707 1.792a1 1 0 0 0-1.414 0L1.146 7.937a.5.5 0 1 0 .708.707L2 8.5V13H1a.5.5 0 0 0 0 1h14a.5.5 0 0 0 0-1ZM3 7.5l5-5 5 5V13h-3V9.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5V13H3V7.5ZM9 13H7v-3h2v3Z"
    />
  </svg>
)
export default SvgComponent
