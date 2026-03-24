import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={15}
    height={15}
    fill="none"
    {...props}
  >
    <path
      fill="#242424"
      d="M13.106 3.876 7.95 1.055a.93.93 0 0 0-.9 0L1.894 3.877a.938.938 0 0 0-.488.82v5.605a.938.938 0 0 0 .488.82l5.156 2.822a.93.93 0 0 0 .9 0l5.156-2.822a.938.938 0 0 0 .488-.82V4.698a.938.938 0 0 0-.488-.822Zm-5.606-2 4.707 2.577-1.744.955L5.755 2.83 7.5 1.875Zm0 5.155L2.793 4.453l1.986-1.087 4.707 2.578L7.5 7.03ZM2.344 5.274 7.03 7.839v5.027l-4.687-2.564V5.274ZM12.656 10.3 7.97 12.866V7.84l1.875-1.026v2.091a.469.469 0 0 0 .937 0V6.302l1.875-1.028v5.025Z"
    />
  </svg>
)
export default SvgComponent
