import React from "react";
import {
  Command_1,
  DisburseResponse,
  MakeProposalResponse,
  NeuronCommandResponse,
  SpawnResponse,
} from "../../declarations/Axon/Axon.did";
import { KeysOfUnion } from "../../lib/types";
import {
  errorToString,
  governanceErrorToString,
  stringify,
} from "../../lib/utils";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import { CommandError, CommandSuccess } from "./CommandResponseSummary";

const renderSuccess = (result: Command_1) => {
  const key = Object.keys(result)[0] as KeysOfUnion<Command_1>;
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

const Result = ({ id, result }: { id: string; result: Command_1 }) => {
  const label = (
    <IdentifierLabelWithButtons id={id} type="Neuron" showButtons={false} />
  );
  if ("Error" in result) {
    return (
      <CommandError label={label}>
        {governanceErrorToString(result.Error)}
      </CommandError>
    );
  }

  return <CommandSuccess label={label}>{renderSuccess(result)}</CommandSuccess>;
};

export default function NeuronCommandResponseList({
  responses,
}: {
  responses: NeuronCommandResponse[];
}) {
  return (
    <ul className="flex flex-col gap-2">
      {responses.flatMap(([neuronId, responsesOrProposals]) =>
        responsesOrProposals.map((res) => {
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
          }
          return <li key={id}>{display}</li>;
        })
      )}
    </ul>
  );
}
