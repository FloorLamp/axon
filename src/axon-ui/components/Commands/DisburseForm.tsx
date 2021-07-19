import React, { useState } from "react";
import { Command, Disburse } from "../../declarations/Axon/Axon.did";
import { isAccount } from "../../lib/account";
import CommandForm from "./CommandForm";

export function DisburseForm({ stake }: { stake?: bigint }) {
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");

  const makeCommand = (): Command | null => {
    let to_account = [];
    if (isAccount(account)) {
      to_account = [{ hash: Array.from(Buffer.from(account, "hex")) }];
    }

    return {
      Disburse: {
        to_account,
        amount: amount ? [{ e8s: BigInt(amount) * BigInt(1e8) }] : [],
      } as Disburse,
    };
  };

  return (
    <CommandForm makeCommand={makeCommand}>
      <div>
        <label>Account</label>
        <input
          type="text"
          placeholder="Account"
          className="w-full px-2 py-1 bg-gray-200 dark:bg-gray-700 text-sm"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          maxLength={64}
        />
      </div>

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
