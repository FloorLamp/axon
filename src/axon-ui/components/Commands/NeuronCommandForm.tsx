import React, { useEffect, useState } from "react";
import {
  NeuronCommand,
  NeuronCommandRequest,
  ProposalType,
} from "../../declarations/Axon/Axon.did";
import { useManagedNeurons } from "../../lib/hooks/Axon/useControllerType";
import CommandForm from "./CommandForm";
import NeuronSelectionForm, {
  ControlType,
  ControlTypes,
} from "./NeuronSelectionForm";

export default function NeuronCommandForm({
  setProposal,
  defaultNeuronIds,
  defaultCommand,
}: {
  setProposal: (arg: ProposalType) => void;
  defaultNeuronIds?: string[];
  defaultCommand?: NeuronCommandRequest;
}) {
  const defaultNeuronIdsState =
    defaultCommand?.neuronIds.map(String) ?? defaultNeuronIds ?? [];
  const [neuronIds, setNeuronIds] = useState(defaultNeuronIdsState);
  const managedNeurons = useManagedNeurons();
  const [controlType, setControlType] = useState<ControlType>(
    defaultNeuronIdsState.length === 1 &&
      managedNeurons[defaultNeuronIdsState[0]]
      ? ControlTypes[1]
      : ControlTypes[0]
  );

  const [command, setCommand] = useState(defaultCommand?.command);

  useEffect(() => {
    if (command) {
      let neuronCommand: NeuronCommand;
      if (controlType === "Delegated") {
        const manager =
          neuronIds?.length === 1
            ? managedNeurons[neuronIds[0]]
              ? managedNeurons[neuronIds[0]][0]
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
        } else {
          return setProposal(null);
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

      setProposal({
        NeuronCommand: neuronCommand,
      });
    } else {
      setProposal(null);
    }
  }, [command, controlType, neuronIds]);

  return (
    <div className="flex flex-col divide-y sm:flex-row sm:divide-y-0 sm:divide-x divide-gray-300">
      <div className="flex-1 py-4 sm:pr-4">
        <NeuronSelectionForm
          neuronIds={neuronIds}
          setNeuronIds={setNeuronIds}
          controlType={controlType}
          setControlType={setControlType}
          managedNeurons={managedNeurons}
        />
      </div>
      <div className="flex-1 py-4 sm:pl-4">
        <CommandForm
          setCommand={setCommand}
          defaultCommand={defaultCommand?.command}
          neuronIds={neuronIds}
        />
      </div>
    </div>
  );
}
