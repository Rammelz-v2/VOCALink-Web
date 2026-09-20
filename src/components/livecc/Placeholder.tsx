import React from "react";
import { Colors as C, FontSize } from "../../styles/tokens";

/** Centered muted note used for loading / empty states in LiveCC. */
const Placeholder: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ textAlign: "center", color: C.text3, fontSize: FontSize.sm, padding: "32px 0" }}>
    {children}
  </div>
);

export default Placeholder;
