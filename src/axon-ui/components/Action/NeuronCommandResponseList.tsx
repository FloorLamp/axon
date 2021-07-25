import React from "react";
import {
  Command_1,
  NeuronCommandResponse,
} from "../../declarations/Axon/Axon.did";
import { errorToString, governanceErrorToString } from "../../lib/utils";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import { ActionError, ActionSuccess } from "./ActionResponseSummary";

const Result = ({ id, result }: { id: string; result: Command_1 }) => {
  const label = (
    <IdentifierLabelWithButtons id={id} type="Neuron" showButtons={false} />
  );
  if ("Error" in result) {
    return (
      <ActionError label={label}>
        {governanceErrorToString(result.Error)}
      </ActionError>
    );
  }

  let message;
  if ("Follow" in result) {
    message = "Successfully set followees";
  }

  return <ActionSuccess label={label}>{message}</ActionSuccess>;
};

export default function NeuronCommandResponseList({
  responses,
}: {
  responses: NeuronCommandResponse[];
}) {
  return (
    <ul className="flex flex-col gap-2">
      {responses.map(([neuronId, res]) => {
        const id = neuronId.toString();
        let display: JSX.Element;
        if ("err" in res) {
          display = (
            <ActionError label={id}>{errorToString(res.err)}</ActionError>
          );
        } else {
          display = <Result id={id} result={res.ok.command[0]} />;
        }
        return <li key={id}>{display}</li>;
      })}
    </ul>
  );
}
