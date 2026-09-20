import React from "react";
import { Card } from "../components/ui";
import { useLiveCCSessions } from "../hooks/useLiveCCSessions";
import LiveCCHeader from "../components/livecc/LiveCCHeader";
import SessionSelector from "../components/livecc/SessionSelector";
import SessionMetaBar from "../components/livecc/SessionMetaBar";
import LogList from "../components/livecc/LogList";
import Placeholder from "../components/livecc/Placeholder";

const LiveCC: React.FC = () => {
  const { sessions, selectedId, selectSession, sessionLog, loading, refresh } = useLiveCCSessions();

  return (
    <Card>
      <LiveCCHeader isLive={!!sessionLog?.is_active} onRefresh={refresh} />

      <SessionSelector sessions={sessions} selectedId={selectedId} onChange={selectSession} />

      {sessionLog && <SessionMetaBar sessionLog={sessionLog} />}

      {loading && <Placeholder>Loading session log…</Placeholder>}

      {!loading && sessionLog && sessionLog.entries.length === 0 && (
        <Placeholder>No activity yet in this session. Start broadcasting or wait for students to tap icons.</Placeholder>
      )}

      {!loading && sessionLog && sessionLog.entries.length > 0 && (
        <LogList entries={sessionLog.entries} />
      )}

      {!loading && !sessionLog && sessions.length > 0 && (
        <Placeholder>Select a session above to view its log.</Placeholder>
      )}
    </Card>
  );
};

export default LiveCC;
