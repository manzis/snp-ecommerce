import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={2}
            d="M20 7 9.354 17.646a.5.5 0 0 1-.708 0L4 13"
        />
    </svg>
)
export default SvgComponent
