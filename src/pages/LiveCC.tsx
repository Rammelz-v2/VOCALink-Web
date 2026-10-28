import React from "react";
import { Card } from "../components/ui";
import { useLiveCCSessions } from "../hooks/useLiveCCSessions";
import LiveCCHeader from "../components/livecc/LiveCCHeader";
import SessionSelector from "../components/livecc/SessionSelector";
import SessionMetaBar from "../components/livecc/SessionMetaBar";
import LogList from "../components/livecc/LogList";
import Placeholder from "../components/livecc/Placeholder";

const LiveCC: React.FC = () => {
  const { sessions, selectedId, selectSession, sessionLog, loading, sessionsLoading, refresh, mergedEntries } = useLiveCCSessions();

  return (
    <Card>
      <LiveCCHeader
        isLive={!sessionsLoading && !!sessionLog?.is_active}
        loading={sessionsLoading}
        onRefresh={refresh}
      />

      <SessionSelector
        sessions={sessions}
        selectedId={selectedId}
        onChange={selectSession}
        loading={sessionsLoading}
      />

      {sessionLog && <SessionMetaBar sessionLog={sessionLog} />}

      {loading && <Placeholder>Loading session log…</Placeholder>}

      {!loading && sessionLog && mergedEntries.length === 0 && (
        <Placeholder>No activity yet in this session. Start broadcasting or wait for students to tap icons.</Placeholder>
      )}

      {!loading && sessionLog && mergedEntries.length > 0 && (
        <LogList entries={mergedEntries} />
      )}

      {!loading && !sessionLog && sessions.length > 0 && (
        <Placeholder>Select a session above to view its log.</Placeholder>
      )}

      {!sessionsLoading && !loading && sessions.length === 0 && (
        <Placeholder>No sessions yet. Start a class from the Broadcast page.</Placeholder>
      )}
    </Card>
  );
};

export default LiveCC;
