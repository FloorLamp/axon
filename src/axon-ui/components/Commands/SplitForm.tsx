import React, { useEffect, useState } from "react";
import { Command, Split } from "../../declarations/Axon/Axon.did";
import ErrorAlert from "../Labels/ErrorAlert";

export function SplitForm({
  makeCommand,
  stake,
  defaults,
}: {
  makeCommand: (cmd: Command | null) => void;
  stake?: bigint;
  defaults?: Split;
}) {
  const [amount, setAmount] = useState(
    defaults ? (Number(defaults.amount_e8s) / 1e8).toString() : ""
  );
  const [error, setError] = useState();

  useEffect(() => {
    if (!amount) return makeCommand(null);

    let command: Command;
    try {
      command = {
        Split: {
          amount_e8s: BigInt(amount) * BigInt(1e8),
        },
      };
    } catch (error) {
      setError(error.message);
      return makeCommand(null);
    }

    makeCommand(command);
  }, [amount]);

  return (
    <div className="flex flex-col gap-2">
      <label className="block">
        <input
          type="number"
          placeholder="Amount"
          className="w-full mt-1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={0}
          max={stake !== undefined ? Number(stake / BigInt(1e8)) : undefined}
          required
        />
      </label>

      {!!error && <ErrorAlert>{error}</ErrorAlert>}
    </div>
  );
}
