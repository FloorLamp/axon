import React from "react";
import {
  Command_1,
  DisburseResponse,
  MakeProposalResponse,
  NeuronCommandResponse,
  ProposalInfo,
  SpawnResponse,
} from "../../declarations/Axon/Axon.did";
import { Status } from "../../lib/governance";
import { commandToString } from "../../lib/proposalTypes";
import { CommandResponseKey } from "../../lib/types";
import {
  errorToString,
  governanceErrorToString,
  stringify,
} from "../../lib/utils";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import { CommandError, CommandSuccess } from "./CommandResponseSummary";

const renderCommandResponse = (result: Command_1) => {
  const key = Object.keys(result)[0] as CommandResponseKey;
  switch (key) {
    case "Follow":
      return "Successfully set followees";
    case "MakeProposal": {
      const { proposal_id } = result[key] as MakeProposalResponse;
      return `Created proposal ${proposal_id[0].id}`;
    }
    case "Spawn":
    case "Split":
    case "DisburseToNeuron": {
      const { created_neuron_id } = result[key] as SpawnResponse;
      return `Created neuron ${created_neuron_id[0].id}`;
    }
    case "Disburse": {
      const { transfer_block_height } = result[key] as DisburseResponse;
      return `Transferred at height ${transfer_block_height}`;
    }
    case "Configure":
      return "Successfully configured";
    case "RegisterVote":
      return "Successfully voted";
    default:
      return stringify(result);
  }
};

const Result = ({
  id,
  result,
  proposal,
}: {
  id: string;
  result?: Command_1;
  proposal?: ProposalInfo;
}) => {
  const label = (
    <IdentifierLabelWithButtons id={id} type="Neuron" showButtons={false} />
  );
  if (result) {
    if ("Error" in result) {
      return (
        <CommandError label={label}>
          {governanceErrorToString(result.Error)}
        </CommandError>
      );
    } else {
      return (
        <CommandSuccess label={label}>
          {renderCommandResponse(result)}
        </CommandSuccess>
      );
    }
  } else {
    const status = Status[proposal.status];
    const manageNeuron =
      "ManageNeuron" in proposal.proposal[0].action[0]
        ? proposal.proposal[0].action[0].ManageNeuron
        : null;
    const delegatedId = manageNeuron?.id[0].id.toString() ?? label;
    if (proposal.status === Status.Executed) {
      return (
        <CommandSuccess label={delegatedId}>
          <strong>{status}: </strong>
          {commandToString(manageNeuron.command[0])}
        </CommandSuccess>
      );
    } else if (proposal.status === Status.Failed) {
      return (
        <CommandError label={delegatedId}>
          {governanceErrorToString(proposal.failure_reason[0])}
        </CommandError>
      );
    } else {
      return (
        <CommandSuccess label={delegatedId}>
          <div>{status}</div>
          <pre className="text-xs">{stringify(proposal)}</pre>
        </CommandSuccess>
      );
    }
  }
};

export default function NeuronCommandResponseList({
  responses,
}: {
  responses: NeuronCommandResponse[];
}) {
  return (
    <ul className="flex flex-col gap-2">
      {responses.flatMap(([neuronId, responsesOrProposals]) =>
        responsesOrProposals.map((res, i) => {
          const id = neuronId.toString();
          let display: JSX.Element;
          if ("ManageNeuronResponse" in res) {
            if ("err" in res.ManageNeuronResponse) {
              display = (
                <CommandError label={id}>
                  {errorToString(res.ManageNeuronResponse.err)}
                </CommandError>
              );
            } else {
              display = (
                <Result
                  id={id}
                  result={res.ManageNeuronResponse.ok.command[0]}
                />
              );
            }
          } else {
            if ("err" in res.ProposalInfo) {
              display = (
                <CommandError label={id}>
                  {errorToString(res.ProposalInfo.err)}
                </CommandError>
              );
            } else {
              display = <Result id={id} proposal={res.ProposalInfo.ok[0]} />;
            }
          }
          return <li key={`${id}-${i}`}>{display}</li>;
        })
      )}
    </ul>
  );
}
