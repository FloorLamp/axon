import { useNeurons } from "./useNeurons";

export const useNeuronIds = () => {
  const neurons = useNeurons();
  return neurons.data?.response.full_neurons.map((n) => n.id[0]) ?? [];
};
