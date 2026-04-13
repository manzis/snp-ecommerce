import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...props}>
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={1.5}
            d="M14.885 21a6.007 6.007 0 0 1-6.637 0M4.567 10a7 7 0 0 1 14 0v2.578a8 8 0 0 0 1.343 4.437l.138.208a.5.5 0 0 1-.416.777H3.501a.5.5 0 0 1-.416-.777l.138-.208a8 8 0 0 0 1.344-4.437V10Z"
        />
    </svg>
)
export default SvgComponent
