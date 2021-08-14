import { useNeurons } from "./useNeurons";

export const useNeuronsByIds = (ids: (string | bigint)[]) => {
  const { data: neurons } = useNeurons();
  const strings = ids.map(String);
  return (
    neurons?.response.full_neurons.filter((fn) =>
      strings.includes(fn.id[0].id.toString())
    ) ?? []
  );
};
