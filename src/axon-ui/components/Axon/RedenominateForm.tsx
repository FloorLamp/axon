import React, { useEffect, useState } from "react";
import { AxonCommandRequest } from "../../declarations/Axon/Axon.did";
import { useInfo } from "../../lib/hooks/Axon/useInfo";
import useAxonId from "../../lib/hooks/useAxonId";
import useDebounce from "../../lib/hooks/useDebounce";
import { formatNumber } from "../../lib/utils";
import ErrorAlert from "../Labels/ErrorAlert";

export function RedenominateForm({
  makeCommand,
  defaults,
}: {
  makeCommand: (cmd: AxonCommandRequest | null) => void;
  defaults?: Extract<AxonCommandRequest, { Redenominate: {} }>["Redenominate"];
}) {
  const axonId = useAxonId();
  const { data } = useInfo();
  const [fromAmount, setFromAmount] = useState(defaults?.from.toString() ?? "");
  const [toAmount, setToAmount] = useState(defaults?.to.toString() ?? "");
  const [error, setError] = useState("");
  const debouncedFromAmount = useDebounce(fromAmount);
  const debouncedToAmount = useDebounce(toAmount);

  let newSupply;
  try {
    newSupply =
      data && fromAmount && toAmount
        ? (data.supply * BigInt(toAmount)) / BigInt(fromAmount)
        : null;
  } catch (error) {}

  useEffect(() => {
    if (!debouncedFromAmount || !debouncedToAmount) return makeCommand(null);

    setError("");

    let command: AxonCommandRequest;
    try {
      command = {
        Redenominate: {
          from: BigInt(debouncedFromAmount),
          to: BigInt(debouncedToAmount),
        },
      };
    } catch (error) {
      setError(error.message);
      return makeCommand(null);
    }
    makeCommand(command);
  }, [debouncedFromAmount, debouncedToAmount]);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm leading-tight">
        Modify the total supply of <strong>AXON_{axonId}</strong> tokens while
        keeping ownership percentages constant.
      </p>
      <p className="text-sm leading-tight">
        <span className="italic">From 2 to 10</span> is a 5x increase in supply.
      </p>

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
