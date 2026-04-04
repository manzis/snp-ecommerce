import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" {...props}>
        <g clipPath="url(#a)">
            <path
                fill="#4285F4"
                d="M17.822 9.207c0-.612-.05-1.227-.155-1.829h-8.49v3.466h4.862a4.166 4.166 0 0 1-1.799 2.735v2.249h2.9c1.703-1.568 2.682-3.883 2.682-6.621Z"
            />
            <path
                fill="#34A853"
                d="M9.178 18c2.428 0 4.475-.797 5.966-2.173l-2.9-2.248c-.807.548-1.849.86-3.062.86-2.348 0-4.34-1.585-5.053-3.714H1.136v2.318A9.001 9.001 0 0 0 9.178 18Z"
            />
            <path
                fill="#FBBC04"
                d="M4.125 10.725a5.39 5.39 0 0 1 0-3.446V4.961h-2.99a9.008 9.008 0 0 0 0 8.082l2.99-2.318Z"
            />
            <path
                fill="#EA4335"
                d="M9.178 3.562a4.89 4.89 0 0 1 3.453 1.35l2.57-2.57A8.65 8.65 0 0 0 9.177 0a8.998 8.998 0 0 0-8.042 4.96l2.99 2.32c.71-2.134 2.704-3.718 5.052-3.718Z"
            />
        </g>
        <defs>
            <clipPath id="a">
                <path fill="#fff" d="M0 0h18v18H0z" />
            </clipPath>
        </defs>
    </svg>
)
export default SvgComponent
