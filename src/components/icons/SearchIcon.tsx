import * as React from "react";
import { SVGProps } from "react";


const SearchIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 22 22" // Maintains internal coordinate system for scaling
    fill="none"
    {...props}
  >
    <path
      fill="currentColor"
      d="m19.736 18.764-4.303-4.302a7.572 7.572 0 1 0-.972.972l4.303 4.302a.687.687 0 0 0 .972-.972ZM3.437 9.625a6.188 6.188 0 1 1 6.188 6.188 6.194 6.194 0 0 1-6.188-6.188Z"
    />
  </svg>
);

export default SearchIcon;