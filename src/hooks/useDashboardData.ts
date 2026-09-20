import { useEffect, useState } from "react";
import api from "../services/api";
import type { Student } from "../types";

const AVATAR_PALETTE = [
  { bg: "#E0F6FD", color: "#0E8DB8" },
  { bg: "#FEF3C7", color: "#B45309" },
  { bg: "#FCE7F3", color: "#9D174D" },
  { bg: "#EDE9FE", color: "#5B21B6" },
  { bg: "#D1FAE5", color: "#065F46" },
];

function avatarColor(id: number) {
  return AVATAR_PALETTE[id % AVATAR_PALETTE.length];
}

function displayName(s: { first_name: string; last_name: string; username: string }) {
  return (s.first_name || s.last_name) ? `${s.first_name} ${s.last_name}`.trim() : s.username;
}

/**
 * Fetches the teacher profile + roster for the dashboard, and formats
 * students with a stable avatar color. All Dashboard data-fetching lives
 * here so the page component only has to worry about layout.
 */
export function useDashboardData() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<any>(null);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    api.get("/users/me/").then(res => setProfile(res.data)).catch(() => {});

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await api.get("/teacher/students/");
        const data: any[] = Array.isArray(res.data) ? res.data : [];
        const formatted: Student[] = data.map((s) => {
          const av = avatarColor(s.id);
          return {
            id: s.id,
            name: displayName(s),
            status: "idle" as const,
            bg: av.bg,
            color: av.color,
          };
        });
        setStudents(formatted);
      } catch {
        setError("Could not load students.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  return { students, loading, error, profile, today };
}
