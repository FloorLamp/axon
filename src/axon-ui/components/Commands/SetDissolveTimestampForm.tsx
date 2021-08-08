import { DateTime } from "luxon";
import React, { useEffect, useState } from "react";
import {
  Operation,
  SetDissolveTimestamp,
} from "../../declarations/Axon/Axon.did";
import ErrorAlert from "../Labels/ErrorAlert";

export function SetDissolveTimestampForm({
  makeOperation,
  defaults,
}: {
  makeOperation: (cmd: Operation | null) => void;
  defaults?: SetDissolveTimestamp;
}) {
  const [timestamp, setTimestamp] = useState(
    defaults ? defaults.dissolve_timestamp_seconds.toString() : ""
  );
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");

    if (!timestamp) {
      return makeOperation(null);
    }

    let dissolve_timestamp_seconds;
    try {
      dissolve_timestamp_seconds = BigInt(
        DateTime.fromISO(timestamp).toSeconds()
      );
    } catch (err) {
      setError("Invalid dissolve date");
      return makeOperation(null);
    }
    makeOperation({
      SetDissolveTimestamp: {
        dissolve_timestamp_seconds,
      },
    });
  }, [timestamp]);

  return (
    <div>
      <div>
        <label>Dissolve Timestamp</label>
        <input
          type="datetime-local"
          placeholder="Dissolve Timestamp"
          className="w-full mt-1"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          maxLength={20}
          required
        />
      </div>

      {!!error && <ErrorAlert>{error}</ErrorAlert>}
    </div>
  );
}
