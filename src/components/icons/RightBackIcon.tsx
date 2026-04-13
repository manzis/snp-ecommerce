import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={16} 
        height={16} 
        viewBox="0 0 16 16" 
        fill="none" 
        {...props}
    >
        <path
            fill="currentColor"
            d="m6.53 2.47 5 5a.75.75 0 0 1 0 1.062l-5 5a.751.751 0 1 1-1.062-1.063L9.938 8l-4.47-4.47A.751.751 0 0 1 6.53 2.469v.001Z"
        />
    </svg>
)
export default SvgComponent
