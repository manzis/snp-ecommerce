import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={1.5}
            d="m6 9 5.293-5.293a1 1 0 0 1 1.414 0L18 9M6 15l5.293 5.293a1 1 0 0 0 1.414 0L18 15"
        />
    </svg>
)
export default SvgComponent
