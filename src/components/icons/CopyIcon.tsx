import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" {...props}>
        <path
            fill="currentColor"
            d="M13.5 2h-8a.5.5 0 0 0-.5.5V5H2.5a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5V11h2.5a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5ZM10 13H3V6h7v7Zm3-3h-2V5.5a.5.5 0 0 0-.5-.5H6V3h7v7Z"
        />
    </svg>
)
export default SvgComponent
