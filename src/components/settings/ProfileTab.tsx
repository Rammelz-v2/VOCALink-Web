import React from "react";
import { Colors as C, FontSize, Radius } from "../../styles/tokens";
import { Card, CardTitle, Divider, Button } from "../ui";
import Icon from "../ui/Icon";
import { FieldLabel, TextInput, SelectInput, SaveRow } from "./SettingsFormHelpers";

interface ProfileTabProps {
  pendingPhoto: string | null;
  setPendingPhoto: (url: string | null) => void;
  fileRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  username: string;
  savedDisplayName: string;
  savedDepartment: string;
  firstName: string;    setFirstName:    (v: string) => void;
  lastName: string;     setLastName:     (v: string) => void;
  displayName: string;  setDisplayName:  (v: string) => void;
  email: string;        setEmail:        (v: string) => void;
  phone: string;        setPhone:        (v: string) => void;
  room: string;         setRoom:         (v: string) => void;
  department: string;   setDepartment:   (v: string) => void;
  grade: string;        setGrade:        (v: string) => void;
  organization: string; setOrganization: (v: string) => void;
  bio: string;          setBio:          (v: string) => void;
  saving: boolean;
  onSave: () => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({
  pendingPhoto, setPendingPhoto, fileRef, onFileChange,
  username, savedDisplayName, savedDepartment,
  firstName, setFirstName, lastName, setLastName,
  displayName, setDisplayName, email, setEmail,
  phone, setPhone, room, setRoom,
  department, setDepartment, grade, setGrade,
  organization, setOrganization, bio, setBio,
  saving, onSave,
}) => {
  const initials = (firstName[0] ?? "").toUpperCase() + (lastName[0] ?? "").toUpperCase();

  return (
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

          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFileChange} />

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
        <SaveRow onSave={onSave} saving={saving} />
      </Card>
    </div>
  );
};

export default ProfileTab;
