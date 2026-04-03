import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={24}
        height={24}
        fill="none"
        {...props}
    >
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={1.5}
            d="M13 20.608h6.276a.5.5 0 0 0 .467-.678l-.497-1.313c-.261-.69-.118-1.465.303-2.07C20.183 15.636 21 14.224 21 13m-3-2.5a7.5 7.5 0 0 1-7.5 7.5H3.724a.5.5 0 0 1-.467-.677l.64-1.692c.23-.605.136-1.276-.147-1.858A7.5 7.5 0 1 1 18 10.5Z"
        />
    </svg>
)
export default SvgComponent
