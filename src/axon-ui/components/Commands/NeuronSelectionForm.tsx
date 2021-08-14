import classNames from "classnames";
import React, { useEffect } from "react";
import { useAxonById } from "../../lib/hooks/Axon/useAxonById";
import { ManagedNeurons } from "../../lib/hooks/Axon/useControllerType";
import { useNeuronIds } from "../../lib/hooks/Axon/useNeuronIds";
import { useNeurons } from "../../lib/hooks/Axon/useNeurons";
import { pluralize, principalIsEqual } from "../../lib/utils";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import WarningAlert from "../Labels/WarningAlert";

export const ControlTypes = ["Direct", "Delegated"] as const;
export type ControlType = typeof ControlTypes[number];

export default function NeuronSelectionForm({
  neuronIds,
  setNeuronIds,
  controlType,
  setControlType,
  managedNeurons,
}: {
  neuronIds: string[];
  setNeuronIds: (arg: string[]) => void;
  controlType: ControlType;
  setControlType: (arg: ControlType) => void;
  managedNeurons: ManagedNeurons;
}) {
  const { data: info } = useAxonById();
  const { data: neurons } = useNeurons();
  const { data: allNeuronIds, isSuccess } = useNeuronIds();

  const set = new Set(neuronIds);

  const toggle = (id) => {
    if (set.has(id)) {
      setNeuronIds(neuronIds.filter((n) => n !== id));
    } else {
      setNeuronIds(neuronIds.concat(id));
    }
  };

  useEffect(() => {
    if (controlType === "Delegated") {
      if (!(neuronIds.length === 1 && managedNeurons[neuronIds[0]])) {
        setNeuronIds([]);
      }
    }
  }, [controlType]);

  const showNonControllerWarning =
    controlType === "Direct" &&
    !neurons?.response.full_neurons
      .filter(
        (neuron) =>
          neuronIds.includes(neuron.id[0].id.toString()) || !neuronIds.length
      )
      .every((neuron) => principalIsEqual(info.proxy, neuron.controller[0]));

  const handleSelectAll = (e) => {
    setNeuronIds(
      allNeuronIds.length === neuronIds.length ? [] : allNeuronIds.map(String)
    );
  };

  return isSuccess && !allNeuronIds.length ? (
    <p className="flex items-center justify-center h-full text-gray-500 text-sm">
      No neurons to manage.
    </p>
  ) : (
    <>
      <div className="flex rounded-md overflow-hidden">
        {ControlTypes.map((ct) => (
          <button
            key={ct}
            className={classNames("rounded-none p-1 flex-1", {
              "bg-indigo-500 text-white cursor-default": ct === controlType,
              "bg-indigo-200 cursor-pointer": ct !== controlType,
            })}
            onClick={(e) => {
              e.preventDefault();
              setControlType(ct);
            }}
          >
            {ct}
          </button>
        ))}
      </div>
      <div className="divide-y divide-gray-300">
        {controlType === "Direct" && (
          <div className="flex items-center py-2">
            <input
              type="checkbox"
              className="mr-2 cursor-pointer hover:ring-2 hover:ring-opacity-50 hover:ring-indigo-500 hover:border-indigo-500"
              onChange={handleSelectAll}
              checked={allNeuronIds.length === neuronIds.length}
            />
            {neuronIds.length === 0 ? (
              `No Neurons specified, will send to all`
            ) : (
              <>
                {neuronIds.length} {pluralize("neuron", neuronIds.length)}{" "}
                selected
              </>
            )}
          </div>
        )}
        <ul className="flex flex-col gap-0.5 py-2">
          {controlType === "Direct"
            ? allNeuronIds.map((neuronId) => {
                const id = neuronId.toString();
                return (
                  <li key={id}>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="mr-2"
                        onChange={(e) => toggle(id)}
                        checked={set.has(id)}
                      />
                      <IdentifierLabelWithButtons
                        type="Neuron"
                        id={id}
                        showButtons={false}
                      />
                    </label>
                  </li>
                );
              })
            : Object.entries(managedNeurons).map(([target, managers]) => {
                return (
                  <li key={target}>
                    <label
                      className={classNames(
                        "flex py-1 px-2 rounded-md border border-transparent cursor-pointer",
                        {
                          "bg-indigo-100 border-indigo-400": set.has(target),
                        }
                      )}
                    >
                      <div className="w-6">
                        <input
                          type="radio"
                          onChange={(e) => setNeuronIds([target])}
                          checked={set.has(target)}
                        />
                      </div>
                      <div>
                        <IdentifierLabelWithButtons
                          type="Neuron"
                          id={target}
                          showButtons={false}
                        />
                        <p className="text-xs">
                          Managed by {managers.join(", ")}
                        </p>
                      </div>
                    </label>
                  </li>
                );
              })}
        </ul>
      </div>
      {showNonControllerWarning && (
        <WarningAlert>
          <p className="leading-tight text-sm p-1">
            Some of the selected neurons are not directly controlled by Axon.
            For those neurons, Axon is only able to issue{" "}
            <strong>Follow, Vote</strong>, and <strong>Make Proposal</strong>{" "}
            commands.
          </p>
        </WarningAlert>
      )}
    </>
  );
}
