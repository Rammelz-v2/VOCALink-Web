import React from "react";
import { D } from "./theme";

const StageEmptyState: React.FC<{ heading: string; sub: string }> = ({ heading, sub }) => (
  <div style={{
    position: "absolute", top: 0, right: 0, bottom: 0, left: 0,
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", gap: 8, padding: "0 32px", textAlign: "center",
  }}>
    <div style={{ fontSize: 26, fontWeight: 500 }}>{heading}</div>
    <div style={{ fontSize: 15, color: D.dim }}>{sub}</div>
  </div>
);

export default StageEmptyState;
