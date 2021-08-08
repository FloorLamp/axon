import React, { useEffect, useState } from "react";
import {
  IncreaseDissolveDelay,
  Operation,
} from "../../declarations/Axon/Axon.did";
import DissolveDelayInput from "../Inputs/DissolveDelayInput";
import ErrorAlert from "../Labels/ErrorAlert";

export function IncreaseDissolveDelayForm({
  makeOperation,
  defaults,
}: {
  makeOperation: (cmd: Operation | null) => void;
  defaults?: IncreaseDissolveDelay;
}) {
  const [dissolveDelay, setDissolveDelay] = useState(
    defaults ? defaults.additional_dissolve_delay_seconds.toString() : ""
  );
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");

    if (!dissolveDelay) {
      return makeOperation(null);
    }

    makeOperation({
      IncreaseDissolveDelay: {
        additional_dissolve_delay_seconds: Number(dissolveDelay),
      },
    });
  }, [dissolveDelay]);

  return (
    <div>
      <div>
        <label>Additional Dissolve Delay</label>
        <DissolveDelayInput
          value={dissolveDelay}
          onChange={setDissolveDelay}
          required
        />
      </div>

      {!!error && <ErrorAlert>{error}</ErrorAlert>}
    </div>
  );
}
