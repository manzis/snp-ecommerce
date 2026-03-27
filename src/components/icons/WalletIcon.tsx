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
      d="M16.875 5h-12.5a.625.625 0 0 1 0-1.25H15a.625.625 0 1 0 0-1.25H4.375A1.875 1.875 0 0 0 2.5 4.375v10a1.875 1.875 0 0 0 1.875 1.875h12.5a1.25 1.25 0 0 0 1.25-1.25V6.25A1.25 1.25 0 0 0 16.875 5Zm0 10h-12.5a.625.625 0 0 1-.625-.625V6.143c.2.071.412.107.625.107h12.5V15Zm-3.75-4.688a.938.938 0 1 1 1.875 0 .938.938 0 0 1-1.875 0Z"
    />
  </svg>
)
export default SvgComponent
