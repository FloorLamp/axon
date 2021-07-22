import React from "react";
import { formatE8s } from "../../lib/utils";

export default function BalanceLabel({
  value,
  digits,
}: {
  value: number | string | bigint;
  digits?: number;
}) {
  const num = typeof value === "bigint" ? value : BigInt(value);
  return (
    <span>
      {formatE8s(num, digits)} <span className="text-xs">ICP</span>
    </span>
  );
}
