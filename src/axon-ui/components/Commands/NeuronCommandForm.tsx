import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { NeuronCommand, ProposalType } from "../../declarations/Axon/Axon.did";
import { useManagedNeurons } from "../../lib/hooks/Axon/useControllerType";
import CommandForm from "./CommandForm";
import NeuronSelectionForm from "./NeuronSelectionForm";

const ControlTypes = ["Direct", "Delegated"] as const;

export default function NeuronCommandForm({
  setProposal,
  defaultNeuronIds,
}: {
  setProposal: (at: ProposalType) => void;
  defaultNeuronIds?: string[];
}) {
  const [neuronIds, setNeuronIds] = useState(defaultNeuronIds);
  const [command, setCommand] = useState(null);
  const [controlType, setControlType] = useState<typeof ControlTypes[number]>(
    ControlTypes[0]
  );
  const managedNeurons = useManagedNeurons();
  const managedBy =
    defaultNeuronIds?.length === 1
      ? managedNeurons[defaultNeuronIds[0]]
        ? managedNeurons[defaultNeuronIds[0]][0]
        : null
      : null;

  useEffect(() => {
    if (command) {
      let neuronCommand: NeuronCommand;
      if (controlType === "Delegated" && managedBy) {
        neuronCommand = [
          {
            command: {
              MakeProposal: {
                url: "",
                summary: "",
                action: [
                  {
                    ManageNeuron: {
                      id: [{ id: BigInt(defaultNeuronIds[0]) }],
                      command: [command],
                    },
                  },
                ],
              },
            },
            neuronIds: [[BigInt(managedBy)]],
          },
          [],
        ];
      } else {
        neuronCommand = [
          {
            command,
            neuronIds: neuronIds.length > 0 ? [neuronIds.map(BigInt)] : [],
          },
          [],
        ];
      }
      console.log(neuronCommand);

      setProposal({
        NeuronCommand: neuronCommand,
      });
    } else {
      setProposal(null);
    }
  }, [command, neuronIds]);

  return (
    <div className="flex flex-col divide-y divide-gray-300">
      <div className="py-4">
        {defaultNeuronIds?.length === 1 ? (
          <>
            <div className="flex rounded-md overflow-hidden">
              {ControlTypes.map((ct) => (
                <button
                  key={ct}
                  className={classNames("rounded-none p-1 flex-1", {
                    "bg-indigo-500 text-white cursor-default":
                      ct === controlType,
                    "bg-indigo-200 cursor-pointer":
                      ct !== controlType &&
                      (ct === "Delegated" ? !!managedBy : true),
                    "bg-indigo-100 text-gray-400 cursor-not-allowed":
                      ct === "Delegated" && !managedBy,
                  })}
                  disabled={ct === "Delegated" && !managedBy}
                  onClick={(e) => {
                    e.preventDefault();
                    setControlType(ct);
                  }}
                >
                  {ct}
                </button>
              ))}
            </div>
            <p className="pt-2 leading-tight text-sm">
              {controlType === "Direct" ? (
                "Send a command directly to this neuron."
              ) : (
                <>Use neuron {managedBy} to manage this neuron.</>
              )}
            </p>
          </>
        ) : (
          <NeuronSelectionForm
            neuronIds={neuronIds}
            setNeuronIds={setNeuronIds}
          />
        )}
      </div>
      <div className="py-4">
        <CommandForm setCommand={setCommand} />
      </div>
    </div>
  );
}
