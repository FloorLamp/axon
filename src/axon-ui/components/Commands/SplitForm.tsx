import React, { useState } from "react";
import { Command } from "../../declarations/Axon/Axon.did";
import CommandForm from "./CommandForm";

export function SplitForm({ stake }: { stake?: bigint }) {
  const [amount, setAmount] = useState("");

  const makeCommand = (): Command | null => {
    return {
      Split: {
        amount_e8s: BigInt(amount) * BigInt(1e8),
      },
    };
  };

  return (
    <CommandForm makeCommand={makeCommand}>
      <div>
        <label>Amount</label>
        <input
          type="number"
          placeholder="Amount"
          className="w-full px-2 py-1 bg-gray-200 dark:bg-gray-700 text-sm"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={0}
          max={stake !== undefined ? Number(stake / BigInt(1e8)) : undefined}
        />
      </div>
    </CommandForm>
  );
}
