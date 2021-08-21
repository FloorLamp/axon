import { useRouter } from "next/dist/client/router";
import React, { useState } from "react";
import { BsInboxFill } from "react-icons/bs";
import { useIsMutating } from "react-query";
import { groupBy } from "../../lib/arrays";
import { dateTimeFromNanos } from "../../lib/datetime";
import { useIsMember } from "../../lib/hooks/Axon/useIsMember";
import { useIsProposer } from "../../lib/hooks/Axon/useIsProposer";
import { useNeuronIds } from "../../lib/hooks/Axon/useNeuronIds";
import { useNeuronRelationships } from "../../lib/hooks/Axon/useNeuronRelationships";
import { useNeurons } from "../../lib/hooks/Axon/useNeurons";
import useSync from "../../lib/hooks/Axon/useSync";
import useAxonId from "../../lib/hooks/useAxonId";
import { ControllerType } from "../../lib/neurons";
import { RefreshButton } from "../Buttons/RefreshButton";
import Panel from "../Containers/Panel";
import { ListButton } from "../ExpandableList/ListButton";
import ResponseError from "../Labels/ResponseError";
import ManageNeuronModal from "./ManageNeuronModal";
import NeuronSummary from "./NeuronSummary";

const NEURON_GROUPS: ControllerType[] = [
  "Controller",
  "Manager",
  "Delegated",
  "Hot Key",
];

export default function Neurons() {
  const isProposer = useIsProposer();
  const isMember = useIsMember();
  const axonId = useAxonId();
  const router = useRouter();
  const {
    data: neuronIds,
    isFetching: isFetchingNeuronIds,
    error: errorNeuronIds,
  } = useNeuronIds();
  const {
    data: rawNeurons,
    isFetching: isFetchingNeurons,
    error: errorNeurons,
    isSuccess,
  } = useNeurons();
  const neurons = useNeuronRelationships();
  const sync = useSync();

  const handleRefresh = () => {
    sync.mutate();
  };
  const isSyncing = !!useIsMutating({ mutationKey: ["sync", axonId] });
  const isFetching = isSyncing || isFetchingNeuronIds || isFetchingNeurons;
  const [selectedNeuronIds, setSelectedNeuronIds] = useState<string[]>([]);
  const handleToggle = (id: string) => {
    setSelectedNeuronIds(
      selectedNeuronIds.includes(id)
        ? selectedNeuronIds.filter((s) => s !== id)
        : selectedNeuronIds.concat([id])
    );
  };
  const handleSelectAll = (e) => {
    setSelectedNeuronIds(
      selectedNeuronIds.length === neuronIds.length ? [] : neuronIds.map(String)
    );
  };

  const neuronsByType = groupBy(neurons, "_type");

  return (
    <Panel className="py-4">
      <div className="px-4 flex justify-between mb-2">
        <div className="flex gap-2 items-center">
          <h2 className="text-xl font-bold">Neurons</h2>
          <RefreshButton
            isFetching={isFetching}
            onClick={handleRefresh}
            title="Refresh neurons"
          />
        </div>
      </div>
      {(errorNeuronIds || errorNeurons) && (
        <div className="px-4">
          <ResponseError>
            {errorNeuronIds}
            {errorNeurons}
          </ResponseError>
        </div>
      )}
      <div className="flex gap-3 items-center px-4 pb-2">
        {isProposer && (
          <>
            {neuronIds?.length > 0 && (
              <input
                type="checkbox"
                className="mr-1 cursor-pointer hover:ring-2 hover:ring-opacity-50 hover:ring-indigo-500 hover:border-indigo-500"
                onChange={handleSelectAll}
                checked={
                  neuronIds?.length > 0 &&
                  selectedNeuronIds.length === neuronIds.length
                }
              />
            )}
          </>
        )}
        {isMember && <ManageNeuronModal defaultNeuronIds={selectedNeuronIds} />}
        {rawNeurons && rawNeurons.timestamp > 0 && (
          <span className="text-xs text-gray-500">
            Updated {dateTimeFromNanos(rawNeurons.timestamp).toRelative()}
          </span>
        )}
      </div>
      {neuronIds?.length > 0
        ? NEURON_GROUPS.map((group) => {
            const neurons = neuronsByType[group];
            if (!neurons) {
              return null;
            }
            return (
              <div key={group}>
                <h3 className="bg-gray-100 text-xs text-gray-500 px-4 py-2 border-t border-b border-gray-300">
                  {group}
                </h3>
                <ul className="divide-y divide-gray-300">
                  {neurons.map((neuron) => {
                    return (
                      <li key={neuron._id}>
                        <ListButton
                          disabled={!neuron}
                          onClick={() =>
                            router.push(`/axon/${axonId}/neuron/${neuron._id}`)
                          }
                        >
                          <NeuronSummary
                            id={neuron._id}
                            neuron={neuron}
                            isSelected={selectedNeuronIds.includes(neuron._id)}
                            onSelect={handleToggle}
                          />
                        </ListButton>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })
        : isSuccess && (
            <div className="h-48 flex flex-col items-center justify-center">
              <BsInboxFill size={48} className="text-gray-800" />
              <p className="pb-8">No neurons</p>
              <ManageNeuronModal
                buttonClassName="btn-cta px-4 py-2"
                buttonText="Add your first neuron"
              />
            </div>
          )}
    </Panel>
  );
}
