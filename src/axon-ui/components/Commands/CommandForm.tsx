import React, { useState } from "react";
import useProposeCommand from "../../lib/hooks/useProposeCommand";
import { stringify } from "../../lib/utils";
import SpinnerButton from "../Buttons/SpinnerButton";
import ErrorAlert from "../Labels/ErrorAlert";
import { ProposalOptionsForm } from "../ProposalOptionsForm";
import { ConfigureForm } from "./ConfigureForm";
import { DisburseForm } from "./DisburseForm";
import { DisburseToNeuronForm } from "./DisburseToNeuronForm";
import NeuronSelectionForm from "./NeuronSelectionForm";
import { SpawnForm } from "./SpawnForm";
import { SplitForm } from "./SplitForm";

const commands = [
  "Spawn",
  "Split",
  "Follow",
  "Configure",
  "Register Vote",
  "Disburse To Neuron",
  "Make Proposal",
  "Disburse",
] as const;

type CommandName = typeof commands[number];

export default function NeuronCommandForm() {
  const [neuronIds, setNeuronIds] = useState([]);
  const [options, setOptions] = useState({});
  const onChangeOptions = (opts) => setOptions(opts);

  const { mutate, error, isError, isLoading } = useProposeCommand(options);

  const [commandName, setCommandName] = useState<CommandName>(commands[0]);
  const [command, setCommand] = useState(null);

  const renderForm = () => {
    switch (commandName) {
      case "Configure":
        return <ConfigureForm makeCommand={setCommand} />;
      case "Spawn":
        return <SpawnForm makeCommand={setCommand} />;
      case "Split":
        return <SplitForm makeCommand={setCommand} />;
      case "Disburse":
        return <DisburseForm makeCommand={setCommand} />;
      case "Disburse To Neuron":
        return <DisburseToNeuronForm makeCommand={setCommand} />;
      default:
        return "TODO";
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (command) {
      mutate({
        command,
        neuronIds: neuronIds.length > 0 ? [neuronIds.map(BigInt)] : [],
      });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col divide-gray-300 divide-y">
        <div className="py-4">
          <label>Command</label>
          <select
            className="w-full mt-1"
            onChange={(e) => setCommandName(e.target.value as CommandName)}
          >
            {commands.map((command) => (
              <option key={command} value={command}>
                {command}
              </option>
            ))}
          </select>
        </div>

        {renderForm()}

        <NeuronSelectionForm
          neuronIds={neuronIds}
          setNeuronIds={setNeuronIds}
        />

        <ProposalOptionsForm onChangeOptions={onChangeOptions} />

        <div className="flex flex-col gap-2 py-4">
          <div className="flex gap-2">
            <SpinnerButton
              className="w-20"
              activeClassName="btn-cta"
              disabledClassName="btn-cta-disabled"
              isLoading={isLoading}
              isDisabled={!command}
            >
              Submit
            </SpinnerButton>
          </div>

          {isError && (
            <ErrorAlert>
              {typeof error === "string" ? error : stringify(error)}
            </ErrorAlert>
          )}
        </div>
      </div>
    </form>
  );
}
