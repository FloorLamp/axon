import classNames from "classnames";
import React, { useEffect, useState } from "react";
import {
  NeuronCommand,
  NeuronCommandRequest,
  ProposalType,
} from "../../declarations/Axon/Axon.did";
import { useManagedNeurons } from "../../lib/hooks/Axon/useControllerType";
import { useInfo } from "../../lib/hooks/Axon/useInfo";
import { useNeurons } from "../../lib/hooks/Axon/useNeurons";
import { principalIsEqual } from "../../lib/utils";
import WarningAlert from "../Labels/WarningAlert";
import CommandForm from "./CommandForm";
import NeuronSelectionForm from "./NeuronSelectionForm";

const ControlTypes = ["Direct", "Delegated"] as const;

export default function NeuronCommandForm({
  setProposal,
  defaultNeuronIds,
  defaultCommand,
}: {
  setProposal: (arg: ProposalType) => void;
  defaultNeuronIds?: string[];
  defaultCommand?: NeuronCommandRequest;
}) {
  const { data: info } = useInfo();
  const { data: neurons } = useNeurons();

  const [neuronIds, setNeuronIds] = useState(
    defaultCommand?.neuronIds.map(String) ?? defaultNeuronIds
  );
  const [command, setCommand] = useState(defaultCommand?.command);
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

      setProposal({
        NeuronCommand: neuronCommand,
      });
    } else {
      setProposal(null);
    }
  }, [command, neuronIds]);

  const showNonControllerWarning =
    controlType === "Direct" &&
    !neurons?.full_neurons
      .filter(
        (neuron) =>
          neuronIds.includes(neuron.id[0].id.toString()) || !neuronIds.length
      )
      .every((neuron) => principalIsEqual(info.proxy, neuron.controller[0]));

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
        {showNonControllerWarning && (
          <div className="pb-4">
            <WarningAlert>
              <p className="leading-tight text-sm p-1">
                Some of the selected neurons are not directly controlled by
                Axon. For those neurons, Axon is only able to issue{" "}
                <strong>Follow</strong> and <strong>Vote</strong> commands.
              </p>
            </WarningAlert>
          </div>
        )}
        <CommandForm
          setCommand={setCommand}
          defaultCommand={defaultCommand?.command}
          neuronIds={neuronIds}
        />
      </div>
    </div>
  );
}
