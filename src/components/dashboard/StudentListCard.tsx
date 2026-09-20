import React from "react";
import { Colors as C, FontSize, Radius, Shadow } from "../../styles/tokens";
import { Button } from "../ui";
import type { Student } from "../../types";
import StudentRow from "./StudentRow";

interface StudentListCardProps {
  students: Student[];
  loading: boolean;
  error: string;
  onBroadcast: () => void;
  onAddStudents: () => void;
  onSelectStudent: () => void;
}

const StudentListCard: React.FC<StudentListCardProps> = ({
  students, loading, error, onBroadcast, onAddStudents, onSelectStudent,
}) => (
  <div style={{
    flex: 1, background: C.white, borderRadius: Radius.lg,
    border: `1px solid ${C.gray2}`, boxShadow: Shadow.sm, overflow: "hidden",
  }}>
    <div style={{
      padding: "16px 20px", borderBottom: `1px solid ${C.gray2}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "linear-gradient(to right, #FAFAFA, #F8FAFC)",
    }}>
      <div>
        <div style={{ fontSize: FontSize.md, fontWeight: 700, color: C.text, letterSpacing: "-0.3px" }}>
          Active Students
        </div>
        <div style={{ fontSize: FontSize.xs, color: C.text3, marginTop: 2 }}>
          {loading ? "Loading..." : `${students.length} students in your class`}
        </div>
      </div>
      <Button variant="primary" size="sm" onClick={onBroadcast}>
        📡 Broadcast
      </Button>
    </div>

    {error && (
      <div style={{ margin: 16, padding: "10px 14px", borderRadius: Radius.md, background: "#FEF2F2", border: "1px solid #FCA5A5", color: C.red, fontSize: FontSize.sm }}>
        ⚠ {error}
      </div>
    )}

    {!loading && students.length === 0 && !error && (
      <div style={{ padding: "48px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
        <div style={{ fontSize: FontSize.md, fontWeight: 600, color: C.text2 }}>No students yet</div>
        <div style={{ fontSize: FontSize.sm, color: C.text3, marginTop: 4 }}>Go to Students to add some</div>
        <Button variant="primary" size="sm" style={{ marginTop: 16 }} onClick={onAddStudents}>
          Add Students
        </Button>
      </div>
    )}

    <div style={{ padding: "8px 0" }}>
      {students.map((s, i) => (
        <StudentRow key={s.id} student={s} isLast={i === students.length - 1} onClick={onSelectStudent} />
      ))}
    </div>
  </div>
);

export default StudentListCard;
