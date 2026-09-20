import React, { useEffect, useRef } from "react";
import type { LogEntry } from "../../hooks/useLiveCCSessions";
import LogEntryRow from "./LogEntryRow";

/** Scrollable log list that auto-scrolls to the bottom as new entries arrive. */
const LogList: React.FC<{ entries: LogEntry[] }> = ({ entries }) => {
  const logRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(0);

  useEffect(() => {
    if (entries.length > prevCount.current && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
    prevCount.current = entries.length;
  }, [entries.length]);

  return (
    <div
      ref={logRef}
      style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 460, overflowY: "auto", paddingRight: 4 }}
    >
      {entries.map(entry => <LogEntryRow key={entry.id} entry={entry} />)}
    </div>
  );
};

export default LogList;
