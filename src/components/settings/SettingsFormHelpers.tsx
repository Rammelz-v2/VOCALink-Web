import React from "react";
import { Colors as C, FontSize, Radius } from "../../styles/tokens";
import { Button } from "../ui";
import Icon from "../ui/Icon";

export const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.text3, margin: "18px 0 8px" }}>
    {children}
  </div>
);

export const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: FontSize.sm, color: C.text3, marginBottom: 4 }}>{children}</div>
);

export const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} style={{ width: "100%", fontSize: FontSize.sm, color: C.text, background: C.white, border: `1px solid ${C.gray2}`, borderRadius: Radius.md, padding: "8px 10px", outline: "none", fontFamily: "inherit", boxSizing: "border-box", ...props.style }} />
);

export const SelectInput: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select {...props} style={{ width: "100%", fontSize: FontSize.sm, color: C.text, background: C.white, border: `1px solid ${C.gray2}`, borderRadius: Radius.md, padding: "8px 10px", outline: "none", fontFamily: "inherit", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", cursor: "pointer", ...props.style }} />
);

export const SaveRow: React.FC<{ onSave: () => void; saving?: boolean }> = ({ onSave, saving }) => (
  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
    <Button variant="primary" onClick={onSave} style={{ minWidth: 110 }} disabled={saving}>
      {saving ? "Saving…" : "Save changes"}
    </Button>
  </div>
);

export const SettingsToast: React.FC<{ visible: boolean; message?: string; isError?: boolean }> = ({ visible, message = "Changes saved!", isError }) => (
  <div style={{
    position: "fixed", bottom: 24, right: 24,
    background: isError ? "#DC2626" : C.teal,
    color: C.white, fontSize: FontSize.sm, fontWeight: 500,
    padding: "10px 18px", borderRadius: Radius.md,
    opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(6px)",
    transition: "opacity 0.25s, transform 0.25s", pointerEvents: "none", zIndex: 100,
    display: "flex", alignItems: "center", gap: 8,
  }}>
    <Icon name="check" size={13} color={C.white} />
    {message}
  </div>
);
