import React from "react";
import { Colors as C, FontSize, Radius } from "../../styles/tokens";
import { Card, CardTitle } from "../ui";

interface AppearanceTabProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const AppearanceTab: React.FC<AppearanceTabProps> = ({ isDark, toggleTheme }) => (
  <div style={{ display: "flex", justifyContent: "center" }}>
    <Card style={{ width: "100%", maxWidth: 520 }}>
      <CardTitle>Appearance</CardTitle>
      <p style={{ fontSize: FontSize.sm, color: C.text3, marginBottom: 20, lineHeight: 1.5 }}>
        Customize how VocaLink looks for you.
      </p>

      <div
        onClick={toggleTheme}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 18px", borderRadius: Radius.md, cursor: "pointer",
          border: `1.5px solid ${C.gray2}`, background: C.gray,
          transition: "background 0.15s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: Radius.md,
            background: isDark ? "#1E293B" : "#E2E8F0",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, flexShrink: 0,
            border: `1px solid ${C.gray2}`,
          }}>
            {isDark ? "🌙" : "☀️"}
          </div>
          <div>
            <div style={{ fontSize: FontSize.base, fontWeight: 600, color: C.text }}>
              {isDark ? "Dark mode" : "Light mode"}
            </div>
            <div style={{ fontSize: FontSize.sm, color: C.text3, marginTop: 2 }}>
              {isDark ? "Easier on the eyes in low light" : "Bright theme for well-lit spaces"}
            </div>
          </div>
        </div>

        <div style={{
          width: 46, height: 26, borderRadius: 999, flexShrink: 0,
          background: isDark ? C.teal : C.gray2,
          position: "relative", transition: "background 0.25s",
          cursor: "pointer",
        }}>
          <div style={{
            position: "absolute", top: 3,
            left: isDark ? 23 : 3,
            width: 20, height: 20, borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            transition: "left 0.25s",
          }} />
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: FontSize.sm, color: C.text3, lineHeight: 1.6 }}>
        Your preference is saved automatically and persists across sessions.
      </div>
    </Card>
  </div>
);

export default AppearanceTab;
