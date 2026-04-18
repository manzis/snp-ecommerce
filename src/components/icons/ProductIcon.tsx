import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" {...props}>
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={1.5}
            d="M12 12v6m0-6 5-3.333M12 12 7 8.667M4.34 6.423 11 2.578a2 2 0 0 1 2 0l6.66 3.845a2 2 0 0 1 1 1.732v7.69a2 2 0 0 1-1 1.732L13 21.424a2 2 0 0 1-2 0l-6.66-3.845a2 2 0 0 1-1-1.732V8.154a2 2 0 0 1 1-1.732Z"
        />
    </svg>
)
export default SvgComponent
