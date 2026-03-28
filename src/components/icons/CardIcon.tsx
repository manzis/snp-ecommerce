import * as React from "react"
import { SVGProps } from "react"

const CardIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 20 20" // Increased viewBox to prevent clipping the 18.75px path
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full" // Scaling to fit the parent container
    {...props}
  >
    <path
      fill="currentColor" // Allows parent to control color via text-[#242424]
      d="M17.5 3.75h-15A1.25 1.25 0 0 0 1.25 5v10a1.25 1.25 0 0 0 1.25 1.25h15A1.25 1.25 0 0 0 18.75 15V5a1.25 1.25 0 0 0-1.25-1.25Zm0 1.25v1.875h-15V5h15Zm0 10h-15V8.125h15V15Zm-1.25-1.875a.624.624 0 0 1-.625.625h-2.5a.624.624 0 1 1 0-1.25h2.5a.624.624 0 0 1 .625.625Zm-5 0a.624.624 0 0 1-.625.625h-1.25a.625.625 0 1 1 0-1.25h1.25a.624.624 0 0 1 .625.625Z"
    />
  </svg>
)

export default CardIcon