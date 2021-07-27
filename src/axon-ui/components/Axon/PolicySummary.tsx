import React from "react";
import { Policy } from "../../declarations/Axon/Axon.did";
import { formatNumber, formatPercent } from "../../lib/utils";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import { DataRow, DataTable } from "../Proposal/DataTable";

export default function PolicySummary({
  label,
  policy: { proposeThreshold, proposers, acceptanceThreshold },
}: {
  label?: string;
  policy: Policy;
}) {
  let owners;
  if ("Open" in proposers) {
    owners = "All token holders";
  } else {
    owners = (
      <ul>
        {proposers.Closed.map((owner) => (
          <li key={owner.toText()}>
            <IdentifierLabelWithButtons type="Principal" id={owner} />
          </li>
        ))}
      </ul>
    );
  }

  let threshold;
  if ("Percent" in acceptanceThreshold) {
    const percent = formatPercent(
      Number(acceptanceThreshold.Percent.percent) / 1e8
    );
    const quorum = acceptanceThreshold.Percent.quorum[0]
      ? formatPercent(Number(acceptanceThreshold.Percent.quorum[0]) / 1e8)
      : null;
    threshold = (
      <DataRow labelClassName="w-40" label="Acceptance Threshold">
        <div>{percent} of Votes</div>
        {quorum && <div>{quorum} Quorum Required</div>}
      </DataRow>
    );
  } else {
    threshold = (
      <DataRow labelClassName="w-40" label="Acceptance Threshold">
        {formatNumber(acceptanceThreshold.Absolute)} Total Votes
      </DataRow>
    );
  }
  return (
    <DataTable label={label}>
      <DataRow labelClassName="w-40" label="Eligible Proposers">
        {owners}
      </DataRow>
      <DataRow labelClassName="w-40" label="Propose Threshold">
        {formatNumber(proposeThreshold)}
      </DataRow>
      {threshold}
    </DataTable>
  );
}
