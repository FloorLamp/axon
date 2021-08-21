import { useNeuronRelationships } from "./useNeuronRelationships";

export const useNeuronsByIds = (ids: (string | bigint)[] = []) => {
  const neurons = useNeuronRelationships();
  const strings = ids.map(String);
  return neurons.filter(({ _id }) => strings.includes(_id));
};
