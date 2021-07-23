import React from "react";
import {
  Command_1,
  NeuronCommandResponse,
} from "../../declarations/Axon/Axon.did";
import { errorToString, governanceErrorToString } from "../../lib/utils";
import { ActionError, ActionSuccess } from "./ActionResponseSummary";

const Result = ({
  neuronId,
  result,
}: {
  neuronId: string;
  result: Command_1;
}) => {
  if ("Error" in result) {
    return (
      <ActionError label={neuronId}>
        {governanceErrorToString(result.Error)}
      </ActionError>
    );
  }

  let message;
  if ("Follow" in result) {
    message = "Successfully set followees";
  }

  return <ActionSuccess label={neuronId}>{message}</ActionSuccess>;
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
          display = <Result neuronId={id} result={res.ok.command[0]} />;
        }
        return <li key={id}>{display}</li>;
      })}
    </ul>
  );
}
