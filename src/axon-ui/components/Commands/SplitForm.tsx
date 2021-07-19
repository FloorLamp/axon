import React, { useState } from "react";
import { Command } from "../../declarations/Axon/Axon.did";
import SpinnerButton from "../Buttons/SpinnerButton";

export function SplitForm({
  propose,
  isLoading,
  stake,
}: {
  propose: (proposal: Command) => void;
  isLoading: boolean;
  stake?: bigint;
}) {
  const [amount, setAmount] = useState("");
  function handleSubmit(e) {
    e.preventDefault();

    propose({
      Split: {
        amount_e8s: BigInt(amount) * BigInt(1e8),
      },
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4 py-4">
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

        <div className="flex gap-2">
          <SpinnerButton
            isLoading={isLoading}
            className="px-2 py-1 text-center w-20 bg-gray-200 rounded hover:shadow-md transition-shadow transition-300"
          >
            Split
          </SpinnerButton>
        </div>
      </div>
    </form>
  );
}
