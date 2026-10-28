import React, { useState, useRef, useEffect } from "react";
import { Colors as C, FontSize, Radius } from "../styles/tokens";
import { Card, CardTitle, Button, Divider } from "../components/ui";
import Icon from "../components/ui/Icon";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.text3, margin: "18px 0 8px" }}>
    {children}
  </div>
);

const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: FontSize.sm, color: C.text3, marginBottom: 4 }}>{children}</div>
);

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} style={{ width: "100%", fontSize: FontSize.sm, color: C.text, background: C.white, border: `1px solid ${C.gray2}`, borderRadius: Radius.md, padding: "8px 10px", outline: "none", fontFamily: "inherit", boxSizing: "border-box", ...props.style }} />
);

const SelectInput: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select {...props} style={{ width: "100%", fontSize: FontSize.sm, color: C.text, background: C.white, border: `1px solid ${C.gray2}`, borderRadius: Radius.md, padding: "8px 10px", outline: "none", fontFamily: "inherit", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", cursor: "pointer", ...props.style }} />
);

const SaveRow: React.FC<{ onSave: () => void; saving?: boolean }> = ({ onSave, saving }) => (
  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
    <Button variant="primary" onClick={onSave} style={{ minWidth: 110 }} disabled={saving}>
      {saving ? "Saving…" : "Save changes"}
    </Button>
  </div>
);

const Toast: React.FC<{ visible: boolean; message?: string; isError?: boolean }> = ({ visible, message = "Changes saved!", isError }) => (
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

type Tab = "profile" | "security" | "appearance";
const TABS: { id: Tab; label: string }[] = [
  { id: "profile",    label: "Profile"    },
  { id: "security",   label: "Security"   },
  { id: "appearance", label: "Appearance" },
];

interface SettingsProps {
  teacherName: string;
  teacherPhoto: string | null;
  onNameChange: (name: string) => void;
  onPhotoChange: (url: string | null) => void;
}

const Settings: React.FC<SettingsProps> = ({ teacherPhoto, onNameChange, onPhotoChange }) => {
  const { isDark, toggle: toggleTheme } = useTheme();
  const [tab,     setTab]     = useState<Tab>("profile");
  const [toast,   setToast]   = useState(false);
  const [toastMsg, setToastMsg] = useState("Changes saved!");
  const [toastErr, setToastErr] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  // Profile fields — exactly what TeacherProfile stores
  const [username,    setUsername]    = useState("");
  const [firstName,   setFirstName]   = useState("");
  const [lastName,    setLastName]    = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email,       setEmail]       = useState("");
  const [phone,       setPhone]       = useState("");
  const [room,        setRoom]        = useState("");
  const [department,  setDepartment]  = useState("");
  const [grade,       setGrade]       = useState("");
  const [organization, setOrganization] = useState("");
  const [bio,         setBio]         = useState("");

  const [savedDisplayName, setSavedDisplayName] = useState("");
  const [savedDepartment,  setSavedDepartment]  = useState("");

  const [pendingPhoto, setPendingPhoto] = useState<string | null>(teacherPhoto);
  const fileRef = useRef<HTMLInputElement>(null);

  // Security fields
  const [currentPw, setCurrentPw] = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving,  setPwSaving]  = useState(false);

  useEffect(() => {
    api.get("/users/me/").then(res => {
      const d = res.data;
      const dname = d.display_name || d.username || "";
      setUsername(d.username       || "");
      setFirstName(d.first_name    || "");
      setLastName(d.last_name      || "");
      setDisplayName(dname);
      setEmail(d.email             || "");
      setPhone(d.contact_number    || "");
      setRoom(d.room_section       || "");
      setDepartment(d.department   || "");
      setGrade(d.grade_handled     || "");
      setOrganization(d.organization || "");
      setBio(d.bio                 || "");
      setSavedDisplayName(dname);
      setSavedDepartment(d.department || "");
      onNameChange(dname || "Teacher");
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPendingPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const showSuccess = (msg = "Changes saved!") => {
    setToastMsg(msg); setToastErr(false);
    setToast(true); setTimeout(() => setToast(false), 2500);
  };
  const showError = (msg: string) => {
    setToastMsg(msg); setToastErr(true);
    setToast(true); setTimeout(() => setToast(false), 3000);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.patch("/users/me/", {
        username, email,
        first_name: firstName, last_name: lastName,
        display_name: displayName,
        contact_number: phone,
        room_section: room,
        department, grade_handled: grade,
        organization, bio,
      });
      const savedName = displayName.trim() || username;
      onNameChange(savedName);
      setSavedDisplayName(savedName);
      setSavedDepartment(department);
      onPhotoChange(pendingPhoto);
      showSuccess();
    } catch {
      showError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      showError("Please fill in all password fields."); return;
    }
    if (newPw !== confirmPw) {
      showError("New passwords do not match."); return;
    }
    if (newPw.length < 8) {
      showError("New password must be at least 8 characters."); return;
    }
    setPwSaving(true);
    try {
      await api.post("/auth/change-password/", {
        current_password: currentPw,
        new_password: newPw,
      });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      showSuccess("Password changed successfully!");
    } catch (err: any) {
      showError(err?.response?.data?.detail || "Failed to change password.");
    } finally {
      setPwSaving(false);
    }
  };

  const initials = (firstName[0] ?? "").toUpperCase() + (lastName[0] ?? "").toUpperCase();

  if (loading) return (
    <div style={{ padding: 20, color: C.text3, fontSize: FontSize.sm }}>Loading profile...</div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 2, background: C.gray, borderRadius: Radius.md, padding: 3, width: "fit-content" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            fontSize: FontSize.sm, padding: "6px 18px",
            borderRadius: (Radius as any).sm ?? 6, border: "none", cursor: "pointer",
            fontFamily: "inherit", fontWeight: tab === t.id ? 500 : 400,
            background: tab === t.id ? C.white : "transparent",
            color: tab === t.id ? C.text : C.text3,
            boxShadow: tab === t.id ? "0 0 0 0.5px #DDD" : "none",
            transition: "all 0.15s",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── PROFILE TAB ── */}
      {tab === "profile" && (
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

          {/* Photo card */}
          <Card style={{ width: 220, flexShrink: 0 }}>
            <CardTitle>Profile photo</CardTitle>
            <p style={{ fontSize: FontSize.sm, color: C.text3, marginBottom: 16, lineHeight: 1.5 }}>
              Visible in the live room and sidebar
            </p>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div
                onClick={() => fileRef.current?.click()}
                style={{ width: 88, height: 88, borderRadius: "50%", background: pendingPhoto ? "transparent" : C.tealLight, border: `2.5px solid ${(C as any).tealMid ?? C.teal}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", overflow: "hidden", flexShrink: 0 }}
              >
                {pendingPhoto
                  ? <img src={pendingPhoto} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: 24, fontWeight: 500, color: C.teal }}>{initials || "TR"}</span>
                }
                <div style={{ position: "absolute", bottom: 4, right: 4, width: 22, height: 22, borderRadius: "50%", background: C.teal, border: `2px solid ${C.white}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="check" size={10} color={C.white} />
                </div>
              </div>

              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />

              <div style={{ fontSize: FontSize.sm, fontWeight: 500, color: C.text, textAlign: "center" }}>{savedDisplayName || username}</div>
              <div style={{ fontSize: 11, color: C.text3, textAlign: "center" }}>SNED Teacher · {savedDepartment || "—"}</div>

              <Button onClick={() => fileRef.current?.click()} style={{ width: "100%", fontSize: FontSize.sm, justifyContent: "center" }}>
                Upload new photo
              </Button>
              <button
                onClick={() => setPendingPhoto(null)}
                style={{ width: "100%", fontSize: FontSize.sm, color: C.text3, background: "none", border: "none", cursor: "pointer", padding: "6px 0", fontFamily: "inherit" }}
              >
                Remove photo
              </button>
              <div style={{ fontSize: 11, color: C.text3, textAlign: "center", lineHeight: 1.5 }}>
                JPG, PNG or GIF · Max 2 MB
              </div>
            </div>

            <Divider />

            {/* Only real DB-backed fields */}
            {[
              { label: "Username",   value: username },
              { label: "Department", value: savedDepartment || "—" },
              { label: "Room",       value: room || "—" },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `0.5px solid ${C.gray2}` }}>
                <span style={{ fontSize: 11, color: C.text3 }}>{row.label}</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: C.text, textAlign: "right", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.value}</span>
              </div>
            ))}
          </Card>

          {/* Personal info card */}
          <Card style={{ flex: 1 }}>
            <CardTitle>Personal information</CardTitle>
            <p style={{ fontSize: FontSize.sm, color: C.text3, marginBottom: 16, lineHeight: 1.5 }}>
              Update your name, contact, and role details
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><FieldLabel>First name</FieldLabel><TextInput value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
              <div><FieldLabel>Last name</FieldLabel><TextInput value={lastName} onChange={e => setLastName(e.target.value)} /></div>
              <div style={{ gridColumn: "1 / -1" }}><FieldLabel>Display name</FieldLabel><TextInput value={displayName} onChange={e => setDisplayName(e.target.value)} /></div>
              <div style={{ gridColumn: "1 / -1" }}><FieldLabel>Email address</FieldLabel><TextInput type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div><FieldLabel>Contact number</FieldLabel><TextInput type="tel" value={phone} onChange={e => setPhone(e.target.value)} /></div>
              <div><FieldLabel>Room / Section</FieldLabel><TextInput value={room} onChange={e => setRoom(e.target.value)} /></div>
              <div>
                <FieldLabel>Department</FieldLabel>
                <SelectInput value={department} onChange={e => setDepartment(e.target.value)}>
                  <option value="">— Select —</option>
                  <option>SNED</option>
                  <option>Regular</option>
                  <option>Administration</option>
                </SelectInput>
              </div>
              <div>
                <FieldLabel>Grade handled</FieldLabel>
                <SelectInput value={grade} onChange={e => setGrade(e.target.value)}>
                  <option value="">— Select —</option>
                  <option>Grade 1</option><option>Grade 2</option><option>Grade 3</option>
                  <option>Grade 4</option><option>Grade 5</option><option>Grade 6</option>
                  <option>Grade 7</option><option>Grade 8</option><option>Grade 9</option><option>Grade 10</option>
                </SelectInput>
              </div>
              <div style={{ gridColumn: "1 / -1" }}><FieldLabel>School / Organization</FieldLabel><TextInput value={organization} onChange={e => setOrganization(e.target.value)} /></div>
              <div style={{ gridColumn: "1 / -1" }}>
                <FieldLabel>Bio / Short note</FieldLabel>
                <textarea
                  value={bio} onChange={e => setBio(e.target.value)} rows={3}
                  style={{ width: "100%", fontSize: FontSize.sm, color: C.text, background: C.white, border: `1px solid ${C.gray2}`, borderRadius: Radius.md, padding: "8px 10px", outline: "none", fontFamily: "inherit", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }}
                />
              </div>
            </div>
            <SaveRow onSave={saveProfile} saving={saving} />
          </Card>
        </div>
      )}

      {/* ── SECURITY TAB ── */}
      {tab === "security" && (
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
            <SaveRow onSave={changePassword} saving={pwSaving} />

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
      )}

      {/* ── APPEARANCE TAB ── */}
      {tab === "appearance" && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Card style={{ width: "100%", maxWidth: 520 }}>
            <CardTitle>Appearance</CardTitle>
            <p style={{ fontSize: FontSize.sm, color: C.text3, marginBottom: 20, lineHeight: 1.5 }}>
              Customize how VocaLink looks for you.
            </p>

            {/* Dark mode toggle row */}
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

              {/* Toggle pill */}
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
      )}

      <Toast visible={toast} message={toastMsg} isError={toastErr} />
    </div>
  );
};

export default Settings;
