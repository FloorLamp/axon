import React, { useEffect, useState } from "react";
import { Command } from "../../declarations/Axon/Axon.did";

export function SplitForm({
  makeCommand,
  stake,
}: {
  makeCommand: (cmd: Command | null) => void;
  stake?: bigint;
}) {
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!amount) return makeCommand(null);

    makeCommand({
      Split: {
        amount_e8s: BigInt(amount) * BigInt(1e8),
      },
    });
  }, [amount]);

  return (
    <div className="flex flex-col py-4 gap-2">
      <div>
        <label>Amount</label>
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
      </div>
    </div>
  );
}
