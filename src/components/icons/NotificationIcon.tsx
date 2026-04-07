import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" {...props}>
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={1.2}
            d="M12.905 17.5a5.006 5.006 0 0 1-5.53 0M2.5 5a8.363 8.363 0 0 1 2.64-3.333m10 0A8.363 8.363 0 0 1 17.78 5M4.307 8.333a5.833 5.833 0 1 1 11.666 0v2.149c0 1.316.39 2.603 1.12 3.698l.115.172a.417.417 0 0 1-.347.648H3.418a.417.417 0 0 1-.346-.648l.115-.172a6.667 6.667 0 0 0 1.12-3.698V8.333Z"
        />
    </svg>
)
export default SvgComponent
