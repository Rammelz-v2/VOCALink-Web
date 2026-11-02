import React, { useState, useRef, useEffect } from "react";
import { Colors as C, FontSize, Radius } from "../styles/tokens";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";
import { SettingsToast } from "../components/settings/SettingsFormHelpers";
import ProfileTab    from "../components/settings/ProfileTab";
import SecurityTab   from "../components/settings/SecurityTab";
import AppearanceTab from "../components/settings/AppearanceTab";

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
  const [tab,      setTab]      = useState<Tab>("profile");
  const [toast,    setToast]    = useState(false);
  const [toastMsg, setToastMsg] = useState("Changes saved!");
  const [toastErr, setToastErr] = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  const [username,      setUsername]      = useState("");
  const [firstName,     setFirstName]     = useState("");
  const [lastName,      setLastName]      = useState("");
  const [displayName,   setDisplayName]   = useState("");
  const [email,         setEmail]         = useState("");
  const [phone,         setPhone]         = useState("");
  const [room,          setRoom]          = useState("");
  const [department,    setDepartment]    = useState("");
  const [grade,         setGrade]         = useState("");
  const [organization,  setOrganization]  = useState("");
  const [bio,           setBio]           = useState("");
  const [savedDisplayName, setSavedDisplayName] = useState("");
  const [savedDepartment,  setSavedDepartment]  = useState("");
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(teacherPhoto);
  const fileRef = useRef<HTMLInputElement>(null);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving,  setPwSaving]  = useState(false);

  useEffect(() => {
    api.get("/users/me/").then(res => {
      const d = res.data;
      const dname = d.display_name || d.username || "";
      setUsername(d.username        || "");
      setFirstName(d.first_name     || "");
      setLastName(d.last_name       || "");
      setDisplayName(dname);
      setEmail(d.email              || "");
      setPhone(d.contact_number     || "");
      setRoom(d.room_section        || "");
      setDepartment(d.department    || "");
      setGrade(d.grade_handled      || "");
      setOrganization(d.organization || "");
      setBio(d.bio                  || "");
      setSavedDisplayName(dname);
      setSavedDepartment(d.department || "");
      onNameChange(dname || "Teacher");
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const showSuccess = (msg = "Changes saved!") => {
    setToastMsg(msg); setToastErr(false);
    setToast(true); setTimeout(() => setToast(false), 2500);
  };
  const showError = (msg: string) => {
    setToastMsg(msg); setToastErr(true);
    setToast(true); setTimeout(() => setToast(false), 3000);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPendingPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
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

      {tab === "profile" && (
        <ProfileTab
          pendingPhoto={pendingPhoto} setPendingPhoto={setPendingPhoto}
          fileRef={fileRef} onFileChange={handlePhoto}
          username={username} savedDisplayName={savedDisplayName} savedDepartment={savedDepartment}
          firstName={firstName}     setFirstName={setFirstName}
          lastName={lastName}       setLastName={setLastName}
          displayName={displayName} setDisplayName={setDisplayName}
          email={email}             setEmail={setEmail}
          phone={phone}             setPhone={setPhone}
          room={room}               setRoom={setRoom}
          department={department}   setDepartment={setDepartment}
          grade={grade}             setGrade={setGrade}
          organization={organization} setOrganization={setOrganization}
          bio={bio}                 setBio={setBio}
          saving={saving}           onSave={saveProfile}
        />
      )}

      {tab === "security" && (
        <SecurityTab
          currentPw={currentPw} setCurrentPw={setCurrentPw}
          newPw={newPw}         setNewPw={setNewPw}
          confirmPw={confirmPw} setConfirmPw={setConfirmPw}
          pwSaving={pwSaving}   onChangePassword={changePassword}
        />
      )}

      {tab === "appearance" && (
        <AppearanceTab isDark={isDark} toggleTheme={toggleTheme} />
      )}

      <SettingsToast visible={toast} message={toastMsg} isError={toastErr} />
    </div>
  );
};

export default Settings;
