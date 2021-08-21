import classNames from "classnames";
import React, { useEffect } from "react";
import { useAxonById } from "../../lib/hooks/Axon/useAxonById";
import { useNeuronIds } from "../../lib/hooks/Axon/useNeuronIds";
import { useNeuronRelationships } from "../../lib/hooks/Axon/useNeuronRelationships";
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
}: {
  neuronIds: string[];
  setNeuronIds: (arg: string[]) => void;
  controlType: ControlType;
  setControlType: (arg: ControlType) => void;
}) {
  const { data: info } = useAxonById();
  const allNeurons = useNeuronRelationships();
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
      if (
        neuronIds.length === 1 &&
        allNeurons.find(({ _id }) => _id === neuronIds[0])._managedBy
          ?.length === 0
      ) {
        setNeuronIds([]);
      }
    }
  }, [controlType]);

  const selectedNeurons = allNeurons.filter(({ _id }) =>
    neuronIds.includes(_id)
  );

  const showNonControllerWarning =
    controlType === "Direct" &&
    !selectedNeurons.every((neuron) =>
      principalIsEqual(info.proxy, neuron.controller[0])
    );

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
        <ul
          className="flex flex-col gap-0.5 py-2 overflow-y-auto"
          style={{ maxHeight: "20rem" }}
        >
          {controlType === "Direct"
            ? allNeurons.map(({ _id }) => {
                return (
                  <li key={_id}>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="mr-2"
                        onChange={(e) => toggle(_id)}
                        checked={set.has(_id)}
                      />
                      <IdentifierLabelWithButtons
                        type="Neuron"
                        id={_id}
                        showButtons={false}
                      />
                    </label>
                  </li>
                );
              })
            : allNeurons
                .filter(({ _managedBy }) => _managedBy.length > 0)
                .map(({ _id, _managedBy }) => {
                  return (
                    <li key={_id}>
                      <label
                        className={classNames(
                          "flex py-1 px-2 rounded-md border border-transparent cursor-pointer",
                          {
                            "bg-indigo-100 border-indigo-400": set.has(_id),
                          }
                        )}
                      >
                        <div className="w-6">
                          <input
                            type="radio"
                            onChange={(e) => setNeuronIds([_id])}
                            checked={set.has(_id)}
                          />
                        </div>
                        <div>
                          <IdentifierLabelWithButtons
                            type="Neuron"
                            id={_id}
                            showButtons={false}
                          />
                          <p className="text-xs">
                            Managed by {_managedBy.join(", ")}
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
