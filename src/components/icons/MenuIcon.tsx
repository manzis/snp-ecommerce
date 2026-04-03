import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        {...props}
    >
        <path
            stroke="#242424"
            strokeLinecap="round"
            strokeWidth={2}
            d="M2 3h16M2 10h8m-8 7h16"
        />
    </svg>
)
export default SvgComponent
