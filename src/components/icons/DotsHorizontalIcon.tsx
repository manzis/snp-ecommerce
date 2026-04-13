import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox=" 0 0 24 24" fill="none" {...props}>
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={1.5}
            d="M11.625 11.625h.75m-.75.75h.75m-7.75-.75h.75m-.75.75h.75m13.25-.75h.75m-.75.75h.75M13 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm14 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
        />
    </svg>
)
export default SvgComponent
