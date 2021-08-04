import { useRouter } from "next/dist/client/router";
import React, { useState } from "react";
import { BsInboxFill } from "react-icons/bs";
import { useIsMutating } from "react-query";
import { useIsProposer } from "../../lib/hooks/Axon/useIsProposer";
import { useNeuronIds } from "../../lib/hooks/Axon/useNeuronIds";
import { useNeurons } from "../../lib/hooks/Axon/useNeurons";
import useSync from "../../lib/hooks/Axon/useSync";
import useAxonId from "../../lib/hooks/useAxonId";
import { RefreshButton } from "../Buttons/RefreshButton";
import Panel from "../Containers/Panel";
import { ListButton } from "../ExpandableList/ListButton";
import ResponseError from "../Labels/ResponseError";
import ManageNeuronModal from "./ManageNeuronModal";
import NeuronSummary from "./NeuronSummary";

export default function Neurons() {
  const isProposer = useIsProposer();
  const axonId = useAxonId();
  const router = useRouter();
  const {
    data: neuronIds,
    isFetching: isFetchingNeuronIds,
    error: errorNeuronIds,
  } = useNeuronIds();
  const {
    data: neurons,
    isFetching: isFetchingNeurons,
    error: errorNeurons,
    isSuccess,
  } = useNeurons();
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
      {isProposer && (
        <div className="flex gap-3 items-center px-4 pb-2">
          <input
            type="checkbox"
            className="mr-1 cursor-pointer hover:ring-2 hover:ring-opacity-50 hover:ring-indigo-500 hover:border-indigo-500"
            onChange={handleSelectAll}
            checked={
              neuronIds?.length > 0 &&
              selectedNeuronIds.length === neuronIds.length
            }
          />
          <ManageNeuronModal defaultNeuronIds={selectedNeuronIds} />
        </div>
      )}
      {neuronIds?.length > 0 ? (
        <ul className="divide-y divide-gray-300">
          {neuronIds.map((neuronId) => {
            const id = neuronId.toString();
            const neuron = neurons?.full_neurons.find(
              (fn) => fn.id[0].id === neuronId
            );

            return (
              <li key={id}>
                <ListButton
                  onClick={() =>
                    router.push(`/axon/${axonId}/neuron/${id.toString()}`)
                  }
                >
                  <NeuronSummary
                    id={id}
                    neuron={neuron}
                    isSelected={selectedNeuronIds.includes(id)}
                    onSelect={handleToggle}
                  />
                </ListButton>
              </li>
            );
          })}
        </ul>
      ) : (
        isSuccess && (
          <div className="h-32 flex flex-col items-center justify-center">
            <BsInboxFill size={48} />
            <p className="py-2">No neurons</p>
            <p className="text-gray-500">Add your first neuron!</p>
          </div>
        )
      )}
    </Panel>
  );
}
