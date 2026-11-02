import React from "react";
import { FontSize, Radius } from "../../styles/tokens";

interface TeacherInfoCardProps {
  teacherName: string;
  teacherInitials: string;
  teacherPhoto: string | null;
  profileLoading?: boolean;
  collapsed: boolean;
}

const TeacherInfoCard: React.FC<TeacherInfoCardProps> = ({
  teacherName, teacherInitials, teacherPhoto, profileLoading, collapsed,
}) => {
  const avatar = (
    <div style={{
      width: 32, height: 32, borderRadius: "50%",
      background: teacherPhoto ? "transparent" : "linear-gradient(135deg, #1AADDC, #0DD0F5)",
      border: "2px solid rgba(26,173,220,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, overflow: "hidden",
    }}>
      {teacherPhoto
        ? <img src={teacherPhoto} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{teacherInitials || "T"}</span>
      }
    </div>
  );

  if (collapsed) {
    return (
      <div style={{ display: "flex", justifyContent: "center", paddingBottom: 10 }}>
        {avatar}
      </div>
    );
  }

  return (
    <div style={{
      margin: "0 8px 8px", padding: "10px 12px", borderRadius: Radius.md,
      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
      display: "flex", alignItems: "center", gap: 10,
    }}>
      {avatar}
      <div style={{ overflow: "hidden", flex: 1 }}>
        {profileLoading ? (
          <div style={{ height: 12, width: 80, borderRadius: 4, background: "rgba(255,255,255,0.12)" }} />
        ) : (
          <div style={{ fontSize: 12, fontWeight: 600, color: "#FFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {teacherName || "Teacher"}
          </div>
        )}
        <div style={{ fontSize: FontSize.xs, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>SNED Teacher</div>
      </div>
    </div>
  );
};

export default TeacherInfoCard;
