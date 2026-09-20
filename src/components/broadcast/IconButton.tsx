import React from "react";
import { btnBase } from "./theme";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number;
  radius?: number | string;
  background?: string;
}

/**
 * Shared circular/pill button used throughout Broadcast (close, fullscreen,
 * panel toggle, dismiss...). Cuts the repeated `{...btnBase, width, height,
 * borderRadius, background}` blocks down to one line per usage.
 */
const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = 40, radius = "50%", background = "transparent", style, className, children, ...rest }, ref) => (
    <button
      ref={ref}
      className={`bc-btn ${className || ""}`.trim()}
      style={{ ...btnBase, width: size, height: size, borderRadius: radius, background, ...style }}
      {...rest}
    >
      {children}
    </button>
  )
);
IconButton.displayName = "IconButton";

export default IconButton;
