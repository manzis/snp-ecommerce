import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={1.5}
            d="M15 7h2.138a2 2 0 0 1 1.995 1.857l.714 10A2 2 0 0 1 17.852 21H6.148a2 2 0 0 1-1.995-2.142l.714-10A2 2 0 0 1 6.862 7H9m6 0H9m6 0V5a3 3 0 1 0-6 0v2m0 8.5c.25.5 1.2 1.5 3 1.5s2.75-1 3-1.5m-5.766-4.266h.282m-.282.282h.282m4.968-.282h.281m-.28.282h.28m-5.015-.141a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm5.25 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
        />
    </svg>
)
export default SvgComponent
