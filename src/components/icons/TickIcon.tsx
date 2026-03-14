import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={10}
    height={10}
    fill="none"
    {...props}
  >
    <g clipPath="url(#a)">
      <path
        stroke="#fff"
        strokeLinecap="round"
        strokeWidth={2}
        d="m8.333 2.917-4.23 4.23a.5.5 0 0 1-.706 0l-1.73-1.73"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h10v10H0z" />
      </clipPath>
    </defs>
  </svg>
)
export default SvgComponent
