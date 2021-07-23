import React from "react";
import { BsInboxFill } from "react-icons/bs";
import { useNeuronIds } from "../../lib/hooks/Axon/useNeuronIds";
import { useNeurons } from "../../lib/hooks/Axon/useNeurons";
import { RefreshButton } from "../Buttons/RefreshButton";
import ErrorAlert from "../Labels/ErrorAlert";
import ManageNeuronModal from "./ManageNeuronModal";
import NeuronDetails from "./NeuronDetails";

export default function Neurons() {
  const {
    data: neuronIds,
    isFetching: isFetchingNeuronIds,
    error: errorNeuronIds,
    refetch: refetchNeuronIds,
  } = useNeuronIds();
  const {
    data: neurons,
    isFetching: isFetchingNeurons,
    error: errorNeurons,
    refetch: refetchNeurons,
  } = useNeurons();

  const handleRefresh = () => {
    refetchNeuronIds();
    refetchNeurons();
  };
  const isFetching = isFetchingNeuronIds || isFetchingNeurons;

  return (
    <section className="py-4 bg-gray-50 rounded-lg shadow-lg">
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
      {neuronIds.length > 0 ? (
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
        <div className="h-32 flex flex-col items-center justify-center">
          {!isFetching && (
            <>
              <BsInboxFill size={48} />
              <p className="py-2">No neurons</p>
              <p className="text-gray-500">Add your first neuron!</p>
            </>
          )}
        </div>
      )}
      {(errorNeuronIds || errorNeurons) && (
        <ErrorAlert>
          {errorNeuronIds}
          {errorNeurons}
        </ErrorAlert>
      )}
    </section>
  );
}
