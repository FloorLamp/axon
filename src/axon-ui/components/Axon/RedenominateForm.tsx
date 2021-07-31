import React, { useEffect, useState } from "react";
import { AxonCommandRequest } from "../../declarations/Axon/Axon.did";
import { useInfo } from "../../lib/hooks/Axon/useInfo";
import useDebounce from "../../lib/hooks/useDebounce";
import { formatNumber } from "../../lib/utils";
import ErrorAlert from "../Labels/ErrorAlert";

export function RedenominateForm({
  makeCommand,
}: {
  makeCommand: (cmd: AxonCommandRequest | null) => void;
}) {
  const { data } = useInfo();
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [error, setError] = useState("");
  const debouncedFromAmount = useDebounce(fromAmount);
  const debouncedToAmount = useDebounce(toAmount);

  const newSupply =
    data && fromAmount && toAmount
      ? (data.supply * BigInt(toAmount)) / BigInt(fromAmount)
      : null;

  useEffect(() => {
    if (!debouncedFromAmount || !debouncedToAmount) return makeCommand(null);

    setError("");

    makeCommand({
      Redenominate: {
        from: BigInt(debouncedFromAmount),
        to: BigInt(debouncedToAmount),
      },
    });
  }, [debouncedFromAmount, debouncedToAmount]);

  return (
    <div className="flex flex-col gap-2">
      <label className="block">
        From
        <input
          type="number"
          placeholder="From"
          className="w-full mt-1"
          value={fromAmount}
          onChange={(e) => setFromAmount(e.target.value)}
          min={0}
          required
        />
      </label>

      <label className="block">
        To
        <input
          type="number"
          placeholder="To"
          className="w-full mt-1"
          value={toAmount}
          onChange={(e) => setToAmount(e.target.value)}
          min={0}
          required
        />
      </label>

      <p>
        Estimated new supply:{" "}
        {formatNumber(newSupply ? newSupply : data.supply)}
      </p>

      {!!error && <ErrorAlert>{error}</ErrorAlert>}
    </div>
  );
}
