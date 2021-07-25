import React, { useEffect, useState } from "react";
import { Command, Disburse } from "../../declarations/Axon/Axon.did";
import { isAccount } from "../../lib/account";
import useDebounce from "../../lib/hooks/useDebounce";
import ErrorAlert from "../Labels/ErrorAlert";

export function DisburseForm({
  makeCommand,
  stake,
}: {
  makeCommand: (cmd: Command | null) => void;
  stake?: bigint;
}) {
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const debouncedAccount = useDebounce(account);
  const debouncedAmount = useDebounce(amount);

  useEffect(() => {
    let to_account = [];
    setError("");
    if (account) {
      if (isAccount(account)) {
        to_account = [{ hash: Array.from(Buffer.from(account, "hex")) }];
      } else {
        setError("Invalid account");
        return makeCommand(null);
      }
    }

    let maybeAmount = [];
    if (amount) {
      try {
        maybeAmount = [{ e8s: BigInt(Number(amount) * 1e8) }];
      } catch (err) {
        setError("Invalid amount");
        return makeCommand(null);
      }
    }

    makeCommand({
      Disburse: {
        to_account,
        amount: maybeAmount,
      } as Disburse,
    });
  }, [debouncedAccount, debouncedAmount]);

  return (
    <div className="flex flex-col gap-2">
      <div>
        <div className="flex justify-between">
          <span>Account</span>
          <span className="text-gray-400">Optional</span>
        </div>
        <input
          type="text"
          placeholder="Account"
          className="w-full mt-1"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          maxLength={64}
        />
      </div>

      <div>
        <div className="flex justify-between">
          <span>Amount</span>
          <span className="text-gray-400">Optional</span>
        </div>
        <input
          type="text"
          placeholder="Amount"
          className="w-full mt-1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={0}
          max={stake !== undefined ? Number(stake / BigInt(1e8)) : undefined}
        />
      </div>

      {!!error && <ErrorAlert>{error}</ErrorAlert>}
    </div>
  );
}
