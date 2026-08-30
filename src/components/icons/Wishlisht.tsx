import * as React from "react"
import { SVGProps } from "react"

interface WishlistIconProps extends SVGProps<SVGSVGElement> {
  filled?: boolean;
}

const SvgComponent = ({ filled, ...props }: WishlistIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <path
      fill={props.fill || "currentColor"}
      d={
        filled
          ? "M17.422 4.453a4.537 4.537 0 0 0-6.4-.008L10 5.395l-1.023-.953a4.531 4.531 0 1 0-6.399 6.417l6.98 7.083a.625.625 0 0 0 .891 0l6.973-7.083a4.531 4.531 0 0 0 0-6.406Z"
          : "M17.422 4.453a4.537 4.537 0 0 0-6.4-.008L10 5.395l-1.023-.953a4.531 4.531 0 1 0-6.399 6.417l6.98 7.083a.625.625 0 0 0 .891 0l6.973-7.083a4.531 4.531 0 0 0 0-6.406Zm-.887 5.528L10 16.61 3.46 9.975a3.281 3.281 0 1 1 4.641-4.64l.016.015 1.457 1.355a.625.625 0 0 0 .852 0l1.457-1.355.015-.016a3.282 3.282 0 0 1 4.638 4.644l-.001.003Z"
      }
    />
  </svg>
)
export default SvgComponent
