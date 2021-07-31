import { Principal } from "@dfinity/principal";
import assert from "assert";
import React from "react";
import { AxonCommand } from "../../declarations/Axon/Axon.did";
import { useInfo } from "../../lib/hooks/Axon/useInfo";
import { AxonCommandKey } from "../../lib/types";
import { formatNumber, formatPercent } from "../../lib/utils";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import { DataRow, DataTable } from "../Proposal/DataTable";
import PolicySummary from "./PolicySummary";

export default function AxonCommandSummary({
  axonCommand: [request, response],
}: {
  axonCommand: AxonCommand;
}) {
  const { data } = useInfo();
  const key = Object.keys(request)[0] as AxonCommandKey;
  switch (key) {
    case "AddMembers":
    case "RemoveMembers": {
      const principals = request[key] as Array<Principal>;

      return (
        <DataTable
          label={`${key === "AddMembers" ? "Add" : "Remove"} Proposers`}
        >
          <DataRow labelClassName="w-20" label="Principals">
            {principals.map((principal) => (
              <IdentifierLabelWithButtons
                key={principal.toText()}
                id={principal}
                type="Principal"
              />
            ))}
          </DataRow>
        </DataTable>
      );
    }
    case "SetPolicy": {
      assert("SetPolicy" in request);
      const payload = request.SetPolicy;
      return <PolicySummary label="Set Policy" policy={payload} />;
    }
    case "SetVisibility": {
      assert("SetVisibility" in request);
      const visibility = Object.keys(request.SetVisibility)[0];
      return (
        <div>
          Set Visibility to <strong>{visibility}</strong>
        </div>
      );
    }
    case "Mint": {
      assert("Mint" in request);
      const effects = response[0]
        ? "ok" in response[0]
          ? "SupplyChanged" in response[0].ok
            ? response[0].ok.SupplyChanged
            : null
          : null
        : null;
      const supplyBefore = effects ? effects.from : data?.supply;
      const supplyAfter = effects
        ? effects.to
        : request.Mint.amount + data?.supply;
      const percent = Number(request.Mint.amount) / Number(supplyBefore);
      return (
        <DataTable label={`Mint ${formatNumber(request.Mint.amount)} tokens`}>
          <DataRow labelClassName="w-40" label="Recipient">
            {request.Mint.recipient[0] ? (
              <IdentifierLabelWithButtons
                key={request.Mint.recipient[0].toText()}
                id={request.Mint.recipient[0]}
                type="Principal"
              />
            ) : (
              "Axon"
            )}
          </DataRow>
          <DataRow labelClassName="w-40" label="Supply Before">
            {data && formatNumber(supplyBefore)}
          </DataRow>
          <DataRow labelClassName="w-40" label="Supply After">
            {data && (
              <>
                {formatNumber(supplyAfter)} (
                {formatPercent(percent, 2, "always")})
              </>
            )}
          </DataRow>
        </DataTable>
      );
    }
    case "Transfer": {
      assert("Transfer" in request);
      const effects = response[0]
        ? "ok" in response[0]
          ? "Transfer" in response[0].ok
            ? response[0].ok.Transfer
            : null
          : null
        : null;
      return (
        <DataTable
          label={`Transfer ${formatNumber(request.Transfer.amount)} tokens`}
        >
          <DataRow labelClassName="w-40" label="Recipient">
            <IdentifierLabelWithButtons
              key={request.Transfer.recipient.toText()}
              id={request.Transfer.recipient}
              type="Principal"
            />
          </DataRow>
          <DataRow labelClassName="w-40" label="Treasury Balance Before">
            {data &&
              formatNumber(
                effects
                  ? effects.senderBalanceAfter + request.Transfer.amount
                  : data.balance
              )}
          </DataRow>
          <DataRow labelClassName="w-40" label="Balance After">
            {data &&
              formatNumber(
                effects
                  ? effects.senderBalanceAfter
                  : Math.max(0, Number(data.balance - request.Transfer.amount))
              )}
          </DataRow>
        </DataTable>
      );
    }
    case "Redenominate": {
      assert("Redenominate" in request);
      const effects = response[0]
        ? "ok" in response[0]
          ? "SupplyChanged" in response[0].ok
            ? response[0].ok.SupplyChanged
            : null
          : null
        : null;
      return (
        <DataTable label={`Redenominate Token Supply`}>
          <DataRow labelClassName="w-40" label="Supply Before">
            {data && formatNumber(effects ? effects.from : data.supply)}
          </DataRow>
          <DataRow labelClassName="w-40" label="Supply After">
            {data &&
              formatNumber(
                effects
                  ? effects.to
                  : (data.supply * request.Redenominate.to) /
                      request.Redenominate.from
              )}
          </DataRow>
        </DataTable>
      );
    }
  }
}
