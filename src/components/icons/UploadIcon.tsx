import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox=" 0 0 24 24" {...props}>
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={1.2}
            d="M10 11.667A3.333 3.333 0 1 0 10 5H5a3.333 3.333 0 0 0-.833 6.562M10 8.333A3.333 3.333 0 0 0 10 15h5a3.333 3.333 0 0 0 .834-6.562"
        />
    </svg>
)
export default SvgComponent
