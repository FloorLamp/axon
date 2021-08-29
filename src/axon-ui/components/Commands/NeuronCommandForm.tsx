import React, { useEffect, useState } from "react";
import {
  Command,
  NeuronCommand,
  NeuronCommandRequest,
  ProposalType,
} from "../../declarations/Axon/Axon.did";
import {
  NeuronWithRelationships,
  useNeuronRelationships,
} from "../../lib/hooks/Axon/useNeuronRelationships";
import CommandForm from "./CommandForm";
import NeuronSelectionForm, {
  ControlType,
  ControlTypes,
} from "./NeuronSelectionForm";

const parseDelegated = ({
  defaultNeuronIds,
  defaultCommand,
  neurons,
}: {
  defaultNeuronIds?: string[];
  defaultCommand?: NeuronCommandRequest;
  neurons: NeuronWithRelationships[];
}) => {
  let targetNeuronIds =
    defaultCommand?.neuronIds.map(String) ?? defaultNeuronIds ?? [];

  let managed: string;
  let parsedCommand: Command = defaultCommand?.command;
  if (
    defaultCommand &&
    "MakeProposal" in defaultCommand.command &&
    "ManageNeuron" in defaultCommand.command.MakeProposal.action[0]
  ) {
    managed =
      defaultCommand.command.MakeProposal.action[0].ManageNeuron.id[0].id.toString();
    targetNeuronIds = [managed];
    parsedCommand =
      defaultCommand.command.MakeProposal.action[0].ManageNeuron.command[0];
  } else if (targetNeuronIds.length === 1) {
    managed = targetNeuronIds[0];
  }

  return {
    targetNeuronIds,
    isDelegated: managed
      ? neurons.find(({ _id }) => _id === managed)._managedBy?.length > 0
      : false,
    parsedCommand,
  };
};

export default function NeuronCommandForm({
  setProposal,
  defaultNeuronIds,
  defaultCommand,
}: {
  setProposal: (arg: ProposalType) => void;
  defaultNeuronIds?: string[];
  defaultCommand?: NeuronCommandRequest;
}) {
  const neurons = useNeuronRelationships();

  const { targetNeuronIds, isDelegated, parsedCommand } = parseDelegated({
    defaultNeuronIds,
    defaultCommand,
    neurons,
  });

  const [neuronIds, setNeuronIds] = useState(targetNeuronIds);
  const [controlType, setControlType] = useState<ControlType>(
    isDelegated ? ControlTypes[1] : ControlTypes[0]
  );

  const [command, setCommand] = useState(parsedCommand);

  useEffect(() => {
    let proposal = null;

    if (command) {
      let neuronCommand: NeuronCommand;
      if (controlType === "Delegated") {
        const neuron =
          neuronIds?.length === 1
            ? neurons.find(({ _id }) => _id === neuronIds[0])
            : null;
        const manager = neuron
          ? neuron._managedBy
            ? neuron._managedBy[0]
            : null
          : null;

        if (manager) {
          neuronCommand = [
            {
              command: {
                MakeProposal: {
                  url: "",
                  summary: "",
                  action: [
                    {
                      ManageNeuron: {
                        id: [{ id: BigInt(neuronIds[0]) }],
                        command: [command],
                      },
                    },
                  ],
                },
              },
              neuronIds: [[BigInt(manager)]],
            },
            [],
          ];
        }
      } else {
        neuronCommand = [
          {
            command,
            neuronIds: neuronIds.length > 0 ? [neuronIds.map(BigInt)] : [],
          },
          [],
        ];
      }

      proposal = {
        NeuronCommand: neuronCommand,
      };
    }

    setProposal(proposal);
  }, [command, controlType, neuronIds]);

  return (
    <div className="flex flex-col divide-y sm:flex-row sm:divide-y-0 sm:divide-x divide-gray-300">
      <div className="flex-1 py-4 sm:pr-4 flex flex-col">
        <NeuronSelectionForm
          neuronIds={neuronIds}
          setNeuronIds={setNeuronIds}
          controlType={controlType}
          setControlType={setControlType}
        />
      </div>
      <div className="flex-1 py-4 sm:pl-4">
        <CommandForm
          setCommand={setCommand}
          defaultCommand={parsedCommand}
          neuronIds={neuronIds}
        />
      </div>
    </div>
  );
}
