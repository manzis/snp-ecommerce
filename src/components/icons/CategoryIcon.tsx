import * as React from "react"
import { SVGProps } from "react"

const CategoryIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24" // Added for scaling
        fill="none"
        {...props}
    >
        <rect
            width={9}
            height={9}
            x={12}
            y={12}
            stroke="currentColor" // Changed to currentColor
            strokeWidth={1.5}
            rx={2}
        />
        <rect
            width={9}
            height={9}
            x={3}
            y={12}
            stroke="currentColor" // Changed to currentColor
            strokeWidth={1.5}
            rx={2}
        />
        <rect
            width={10}
            height={9}
            x={7}
            y={3}
            stroke="currentColor" // Changed to currentColor
            strokeWidth={1.5}
            rx={2}
        />
        <path
            stroke="currentColor" // Changed to currentColor
            strokeLinecap="round"
            strokeWidth={2}
            d="M7 15h1M16 15h1M11 6h2"
        />
    </svg>
)

export default CategoryIcon;
