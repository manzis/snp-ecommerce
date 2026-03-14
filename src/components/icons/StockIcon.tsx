import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <path
      fill="#000"
      d="M17.475 5.168 10.6 1.406a1.24 1.24 0 0 0-1.2 0L2.525 5.17a1.25 1.25 0 0 0-.65 1.093v7.472a1.25 1.25 0 0 0 .65 1.094L9.4 18.592a1.24 1.24 0 0 0 1.2 0l6.875-3.763a1.25 1.25 0 0 0 .65-1.094v-7.47a1.25 1.25 0 0 0-.65-1.097ZM10 2.5l6.277 3.438L13.95 7.21 7.673 3.773 10 2.5Zm0 6.875L3.723 5.938l2.649-1.45 6.276 3.437L10 9.375ZM3.125 7.031l6.25 3.42v6.703l-6.25-3.418V7.031Zm13.75 6.702-6.25 3.42v-6.698l2.5-1.368v2.788a.625.625 0 1 0 1.25 0V8.402l2.5-1.37v6.7Z"
    />
  </svg>
)
export default SvgComponent
