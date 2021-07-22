import classNames from "classnames";
import React from "react";
import { GrRefresh } from "react-icons/gr";
import { useQueryClient } from "react-query";
import { useNeuronIds } from "../lib/hooks/Axon/useNeuronIds";
import { useNeurons } from "../lib/hooks/Axon/useNeurons";
import ErrorAlert from "./Labels/ErrorAlert";
import ManageNeuronModal from "./ManageNeuronModal";
import NeuronDetails from "./Neuron/NeuronDetails";

export default function Neurons() {
  const {
    data: neuronIds,
    isFetching: isFetchingNeuronIds,
    error: errorNeuronIds,
  } = useNeuronIds();
  const {
    data: neurons,
    isFetching: isFetchingNeurons,
    error: errorNeurons,
  } = useNeurons();

  const queryClient = useQueryClient();
  const handleRefresh = () => {
    queryClient.refetchQueries(["neuronIds"]);
    queryClient.refetchQueries(["neurons"]);
  };
  const isFetching = isFetchingNeuronIds || isFetchingNeurons;

  return (
    <section className="py-4 bg-gray-50 rounded-lg shadow-lg">
      <div className="px-4 flex justify-between mb-2">
        <div className="flex gap-2 items-center">
          <h2 className="text-xl font-bold">Neurons</h2>
          <GrRefresh
            className={classNames("", {
              "cursor-pointer filter hover:drop-shadow opacity-50 hover:opacity-100 transition-all":
                !isFetching,
              "inline-block animate-spin": isFetching,
            })}
            onClick={isFetching ? undefined : handleRefresh}
            title={isFetching ? "Loading neurons..." : "Refresh neurons"}
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
                <NeuronDetails
                  isFetching={isFetchingNeurons}
                  id={id}
                  neuron={neuron}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        "None"
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
