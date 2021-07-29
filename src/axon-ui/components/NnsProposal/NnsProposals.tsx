import React from "react";
import { BiListUl } from "react-icons/bi";
import { ProposalInfo } from "../../declarations/Governance/Governance.did.d";
import { Action, Topic } from "../../lib/governance";
import { useIsProposer } from "../../lib/hooks/Axon/useIsProposer";
import { useNnsPendingProposals } from "../../lib/hooks/Governance/useNnsPendingProposals";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import { RefreshButton } from "../Buttons/RefreshButton";
import Panel from "../Containers/Panel";
import ResponseError from "../Labels/ResponseError";
import AcceptRejectButtons from "./AcceptRejectButtons";

const NnsProposal = ({ proposal }: { proposal: ProposalInfo }) => {
  const id = proposal.id[0].id;
  const actionKey = Object.keys(proposal.proposal[0].action[0])[0];
  const isOwner = useIsProposer();

  return (
    <div className="flex flex-col gap-1 sm:flex-row p-2">
      <div className="w-36">
        <IdentifierLabelWithButtons type="Proposal" id={id} />
      </div>
      <div className="flex-1">
        <div>{Topic[proposal.topic]}</div>
        <div>{Action[actionKey]}</div>
        <div className="text-xs break-all">{proposal.proposal[0].summary}</div>
      </div>
      {isOwner && (
        <div>
          <AcceptRejectButtons proposalId={id} />
        </div>
      )}
    </div>
  );
};

export default function NnsProposals() {
  const { data, error, isFetching, refetch, isSuccess } =
    useNnsPendingProposals();

  return (
    <Panel>
      <div className="flex gap-2 items-center mb-2">
        <h2 className="text-xl font-bold">Open NNS Proposals</h2>
        <RefreshButton
          isFetching={isFetching}
          onClick={refetch}
          title="Refresh proposals"
        />
      </div>
      <div>
        {error && <ResponseError>{error}</ResponseError>}
        {data && data.length > 0 ? (
          <ul className="divide-y divide-gray-300">
            {data.map((p) => (
              <li key={p.id[0].id.toString()}>
                <NnsProposal proposal={p} />
              </li>
            ))}
          </ul>
        ) : (
          isSuccess && (
            <div className="h-40 flex flex-col items-center justify-center">
              <BiListUl size={48} className="" />
              <p className="py-2">No open NNS proposals</p>
            </div>
          )
        )}
      </div>
    </Panel>
  );
}
