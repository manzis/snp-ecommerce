import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" {...props}>
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth={1.2}
            d="M2.5 17.5h.833m14.167 0h-.833m-13.334 0V5.7c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874c.428-.218.988-.218 2.108-.218h1.934c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874c.218.428.218.988.218 2.108v.967M3.333 17.5h8.334m0 0V6.667m0 10.833h5m-5-10.833h3.4c.56 0 .84 0 1.054.109a1 1 0 0 1 .437.437c.109.214.109.494.109 1.054V17.5m-2.5-7.508V10m0 4.167v.008M6.667 5.833h1.667M6.667 10h1.667m-1.667 4.167h1.667"
        />
    </svg>
)
export default SvgComponent
