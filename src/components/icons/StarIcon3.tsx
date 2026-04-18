import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" {...props}>
        <path
            fill="#F8C600"
            d="M9.62 6.667 8 1.333 6.38 6.667H1.333l4.12 2.94-1.567 5.06L8 11.54l4.12 3.127-1.567-5.06 4.113-2.94H9.62Z"
        />
    </svg>
)
export default SvgComponent
