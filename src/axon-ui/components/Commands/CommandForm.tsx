import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Command, Operation } from "../../declarations/Axon/Axon.did";
import { CommandKey, OperationKey } from "../../lib/types";
import { AddHotkeyForm } from "./AddHotkeyForm";
import { DisburseForm } from "./DisburseForm";
import { DisburseToNeuronForm } from "./DisburseToNeuronForm";
import FollowForm from "./FollowForm";
import { IncreaseDissolveDelayForm } from "./IncreaseDissolveDelayForm";
import MakeProposalForm from "./MakeProposalForm";
import { RegisterVoteForm } from "./RegisterVoteForm";
import { RemoveHotkeyForm } from "./RemoveHotkeyForm";
import { SetDissolveTimestampForm } from "./SetDissolveTimestampForm";
import { SpawnForm } from "./SpawnForm";
import { SplitForm } from "./SplitForm";

type CommandOrOperationKey = CommandKey | OperationKey;

const commands: { value: CommandOrOperationKey; label: string }[] = [
  { value: "Follow", label: "Follow" },
  { value: "RegisterVote", label: "Register Vote" },
  { value: "MakeProposal", label: "Make Proposal" },
  { value: "AddHotKey", label: "Add Hot Key" },
  { value: "RemoveHotKey", label: "Remove Hot Key" },
  { value: "StartDissolving", label: "Start Dissolving" },
  { value: "StopDissolving", label: "Stop Dissolving" },
  { value: "IncreaseDissolveDelay", label: "Increase Dissolve Delay" },
  { value: "SetDissolveTimestamp", label: "Set Dissolve Timestamp" },
  { value: "Spawn", label: "Spawn" },
  { value: "Split", label: "Split" },
  { value: "Disburse", label: "Disburse" },
  { value: "DisburseToNeuron", label: "Disburse To Neuron" },
];

const getDefaultKey = (defaultCommand?: Command) => {
  if (defaultCommand) {
    if ("Configure" in defaultCommand) {
      return Object.keys(
        defaultCommand.Configure.operation[0]
      )[0] as OperationKey;
    }
    return Object.keys(defaultCommand)[0] as CommandKey;
  }
  return commands[0].value;
};

export default function CommandForm({
  setCommand,
  defaultCommand,
  neuronIds,
}: {
  setCommand: (cmd: Command | null) => void;
  defaultCommand?: Command;
  neuronIds: string[];
}) {
  const [commandKey, setCommandKey] = useState<CommandOrOperationKey>(
    getDefaultKey(defaultCommand)
  );

  const [operation, setOperation] = useState<Operation>(null);
  useEffect(() => {
    if (operation) {
      setCommand({
        Configure: { operation: [operation] },
      });
    } else {
      setCommand(null);
    }
  }, [operation]);

  const renderForm = () => {
    switch (commandKey) {
      case "Follow":
        return (
          <FollowForm
            makeCommand={setCommand}
            defaults={
              defaultCommand && "Follow" in defaultCommand
                ? defaultCommand.Follow
                : undefined
            }
          />
        );
      case "Spawn":
        return (
          <SpawnForm
            makeCommand={setCommand}
            defaults={
              defaultCommand && "Spawn" in defaultCommand
                ? defaultCommand.Spawn
                : undefined
            }
          />
        );
      case "Split":
        return (
          <SplitForm
            makeCommand={setCommand}
            defaults={
              defaultCommand && "Split" in defaultCommand
                ? defaultCommand.Split
                : undefined
            }
          />
        );
      case "Disburse":
        return (
          <DisburseForm
            makeCommand={setCommand}
            defaults={
              defaultCommand && "Disburse" in defaultCommand
                ? defaultCommand.Disburse
                : undefined
            }
          />
        );
      case "DisburseToNeuron":
        return (
          <DisburseToNeuronForm
            makeCommand={setCommand}
            defaults={
              defaultCommand && "DisburseToNeuron" in defaultCommand
                ? defaultCommand.DisburseToNeuron
                : undefined
            }
          />
        );
      case "MakeProposal":
        return (
          <MakeProposalForm
            makeCommand={setCommand}
            defaults={
              defaultCommand && "MakeProposal" in defaultCommand
                ? defaultCommand.MakeProposal
                : undefined
            }
          />
        );
      case "RegisterVote":
        return (
          <RegisterVoteForm
            makeCommand={setCommand}
            defaults={
              defaultCommand && "RegisterVote" in defaultCommand
                ? defaultCommand.RegisterVote
                : undefined
            }
          />
        );
      case "IncreaseDissolveDelay":
        return (
          <IncreaseDissolveDelayForm
            makeOperation={setOperation}
            defaults={
              defaultCommand &&
              "Configure" in defaultCommand &&
              "IncreaseDissolveDelay" in defaultCommand.Configure.operation[0]
                ? defaultCommand.Configure.operation[0].IncreaseDissolveDelay
                : undefined
            }
          />
        );

      case "SetDissolveTimestamp":
        return (
          <SetDissolveTimestampForm
            makeOperation={setOperation}
            defaults={
              defaultCommand &&
              "Configure" in defaultCommand &&
              defaultCommand &&
              "SetDissolveTimestamp" in defaultCommand.Configure.operation[0]
                ? defaultCommand.Configure.operation[0].SetDissolveTimestamp
                : undefined
            }
          />
        );

      case "AddHotKey":
        return (
          <AddHotkeyForm
            makeOperation={setOperation}
            defaults={
              defaultCommand &&
              "Configure" in defaultCommand &&
              defaultCommand &&
              "AddHotKey" in defaultCommand.Configure.operation[0]
                ? defaultCommand.Configure.operation[0].AddHotKey
                : undefined
            }
          />
        );
      case "RemoveHotKey":
        return (
          <RemoveHotkeyForm
            makeOperation={setOperation}
            defaults={
              defaultCommand &&
              "Configure" in defaultCommand &&
              defaultCommand &&
              "RemoveHotKey" in defaultCommand.Configure.operation[0]
                ? defaultCommand.Configure.operation[0].RemoveHotKey
                : undefined
            }
            neuronIds={neuronIds}
          />
        );
      case "StartDissolving":
      case "StopDissolving":
      case "Configure":
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <label>Command</label>
        <Select
          className="w-full mt-1"
          onChange={({ value }) => setCommandKey(value as CommandKey)}
          options={commands}
          defaultValue={commands.find(({ value }) => value === commandKey)}
        />
      </div>

      {renderForm()}
    </div>
  );
}
