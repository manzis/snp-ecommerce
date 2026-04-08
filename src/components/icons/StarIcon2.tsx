import * as React from "react"
import { SVGProps } from "react"

const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24" // Prevents clipping at the edges
        fill="none"
        width={props.width || "1em"} // Inherits font-size or utility class sizing
        height={props.height || "1em"}
        {...props}
    >
        <path
            stroke="currentColor"
            strokeOpacity={0.4}
            strokeWidth={2}
            d="M11.552 1.909a.5.5 0 0 1 .896 0l2.668 5.406a.5.5 0 0 0 .377.273l5.966.867a.5.5 0 0 1 .277.853l-4.317 4.208a.5.5 0 0 0-.144.443l1.02 5.942a.5.5 0 0 1-.726.527l-5.336-2.806a.5.5 0 0 0-.466 0l-5.336 2.806a.5.5 0 0 1-.725-.527l1.019-5.942a.5.5 0 0 0-.144-.443L2.264 9.308a.5.5 0 0 1 .277-.853l5.966-.867a.5.5 0 0 0 .377-.273l2.668-5.406Z"
        />
    </svg>
)

export default SvgComponent