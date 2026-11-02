import React from "react";
import { Colors as C, FontSize, Radius } from "../../styles/tokens";
import { Card, CardTitle, Divider, Button } from "../ui";
import { SectionLabel, FieldLabel, TextInput, SaveRow } from "./SettingsFormHelpers";

interface SecurityTabProps {
  currentPw: string; setCurrentPw: (v: string) => void;
  newPw: string;     setNewPw:     (v: string) => void;
  confirmPw: string; setConfirmPw: (v: string) => void;
  pwSaving: boolean;
  onChangePassword: () => void;
}

const SecurityTab: React.FC<SecurityTabProps> = ({
  currentPw, setCurrentPw, newPw, setNewPw, confirmPw, setConfirmPw,
  pwSaving, onChangePassword,
}) => (
  <div style={{ display: "flex", justifyContent: "center" }}>
    <Card style={{ width: "100%", maxWidth: 520 }}>
      <CardTitle>Change password</CardTitle>
      <p style={{ fontSize: FontSize.sm, color: C.text3, marginBottom: 16, lineHeight: 1.5 }}>
        Use a strong password you don't use elsewhere
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <FieldLabel>Current password</FieldLabel>
          <TextInput type="password" placeholder="Enter current password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
        </div>
        <div>
          <FieldLabel>New password</FieldLabel>
          <TextInput type="password" placeholder="Min. 8 characters" value={newPw} onChange={e => setNewPw(e.target.value)} />
        </div>
        <div>
          <FieldLabel>Confirm new password</FieldLabel>
          <TextInput type="password" placeholder="Repeat new password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
        </div>
      </div>
      <SaveRow onSave={onChangePassword} saving={pwSaving} />

      <Divider />

      <SectionLabel>Danger zone</SectionLabel>
      <div style={{ border: `0.5px solid ${C.redLight}`, borderRadius: Radius.md, padding: "14px 16px", background: C.redLight }}>
        <div style={{ fontSize: FontSize.sm, fontWeight: 600, color: "#A32D2D", marginBottom: 4 }}>Delete account</div>
        <div style={{ fontSize: FontSize.sm, color: C.text3, marginBottom: 12, lineHeight: 1.5 }}>
          Permanently delete your account and all session data. This cannot be undone.
        </div>
        <Button style={{ fontSize: FontSize.sm, color: "#A32D2D", borderColor: "#F09595", background: "#FCEBEB" }}>
          Delete account
        </Button>
      </div>
    </Card>
  </div>
);

export default SecurityTab;
