import React from "react";
import { BsInboxFill } from "react-icons/bs";
import { useIsMutating } from "react-query";
import { useNeuronIds } from "../../lib/hooks/Axon/useNeuronIds";
import { useNeurons } from "../../lib/hooks/Axon/useNeurons";
import useSync from "../../lib/hooks/Axon/useSync";
import useAxonId from "../../lib/hooks/useAxonId";
import { RefreshButton } from "../Buttons/RefreshButton";
import Panel from "../Containers/Panel";
import ResponseError from "../Labels/ResponseError";
import ManageNeuronModal from "./ManageNeuronModal";
import NeuronDetails from "./NeuronDetails";

export default function Neurons() {
  const id = useAxonId();
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
  const isSyncing = !!useIsMutating({ mutationKey: ["sync", id] });
  const isFetching = isSyncing || isFetchingNeuronIds || isFetchingNeurons;

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
        <ManageNeuronModal />
      </div>
      {(errorNeuronIds || errorNeurons) && (
        <div className="px-4">
          <ResponseError>
            {errorNeuronIds}
            {errorNeurons}
          </ResponseError>
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
                <NeuronDetails id={id} neuron={neuron} />
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
