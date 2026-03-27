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
      fill="#242424"
      d="M1.875 8.125H3.75v5H2.5a.625.625 0 1 0 0 1.25h15a.624.624 0 1 0 0-1.25h-1.25v-5h1.875a.625.625 0 0 0 .327-1.157l-8.125-5a.625.625 0 0 0-.654 0l-8.125 5a.625.625 0 0 0 .327 1.157Zm3.125 0h2.5v5H5v-5Zm6.25 0v5h-2.5v-5h2.5Zm3.75 5h-2.5v-5H15v5Zm-5-9.891 5.917 3.641H4.083L10 3.234Zm9.375 13.016a.624.624 0 0 1-.625.625H1.25a.625.625 0 1 1 0-1.25h17.5a.624.624 0 0 1 .625.625Z"
    />
  </svg>
)
export default SvgComponent
