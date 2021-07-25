import { DEFAULT_NEURONS } from "../names";
import { useNeuronIds } from "./Axon/useNeuronIds";
import useNames from "./useNames";

export default function useNeuronOptions() {
  const { data } = useNeuronIds();
  const { neuronName } = useNames();

  const myNeurons = data.map(String);

  return Object.keys(DEFAULT_NEURONS)
    .concat(myNeurons)
    .map((value) => ({
      value,
      label: neuronName(value) ?? value,
    }));
}
