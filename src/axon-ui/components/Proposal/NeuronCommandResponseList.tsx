import React from "react";
import {
  Command_1,
  NeuronCommandResponse,
} from "../../declarations/Axon/Axon.did";
import { KeysOfUnion } from "../../lib/types";
import { errorToString, governanceErrorToString } from "../../lib/utils";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import { CommandError, CommandSuccess } from "./CommandResponseSummary";

const renderSuccess = (result: Command_1) => {
  const key = Object.keys(result)[0] as KeysOfUnion<Command_1>;
  switch (key) {
    case "Follow":
      return "Successfully set followees";
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
      {responses.map(([neuronId, res]) => {
        const id = neuronId.toString();
        let display: JSX.Element;
        if ("err" in res) {
          display = (
            <CommandError label={id}>{errorToString(res.err)}</CommandError>
          );
        } else {
          display = <Result id={id} result={res.ok.command[0]} />;
        }
        return <li key={id}>{display}</li>;
      })}
    </ul>
  );
}
