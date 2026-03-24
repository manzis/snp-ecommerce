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
      fill="#6A6C6E"
      d="m14.207 4.585-2.793-2.792a1 1 0 0 0-1.414 0L2.293 9.5a.991.991 0 0 0-.293.707V13a1 1 0 0 0 1 1h10.5a.5.5 0 0 0 0-1H7.207l7-7a.999.999 0 0 0 0-1.415ZM5.793 13H3v-2.793l5.5-5.5L11.293 7.5l-5.5 5.5ZM12 6.793 9.208 4l1.5-1.5L13.5 5.293l-1.5 1.5Z"
    />
  </svg>
)
export default SvgComponent
