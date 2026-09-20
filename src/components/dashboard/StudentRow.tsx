import React from "react";
import { Colors as C, FontSize } from "../../styles/tokens";
import { Avatar } from "../ui";
import type { Student } from "../../types";

interface StudentRowProps {
  student: Student;
  isLast: boolean;
  onClick: () => void;
}

const StudentRow: React.FC<StudentRowProps> = ({ student, isLast, onClick }) => (
  <div
    onClick={onClick}
    style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "12px 20px", cursor: "pointer",
      borderBottom: isLast ? "none" : `1px solid ${C.gray}`,
      transition: "background 0.12s",
    }}
    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#F8FAFC"}
    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
  >
    <div style={{ position: "relative", flexShrink: 0 }}>
      <Avatar name={student.name} bg={student.bg} color={student.color} size={40} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: FontSize.base, fontWeight: 600, color: C.text }}>{student.name}</div>
    </div>
  </div>
);

export default StudentRow;
