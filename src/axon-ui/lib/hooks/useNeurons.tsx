import { useQuery } from "react-query";
import { useAxon } from "../../components/Store";
import { errorToString } from "../utils";

export const useNeurons = () => {
  const axon = useAxon();
  return useQuery(
    "neurons",
    async () => {
      const neurons = await axon.neurons();
      if ("ok" in neurons) {
        return neurons.ok.map(([res]) => ("Ok" in res ? res.Ok : res.Err));
      } else {
        throw errorToString(neurons.err);
      }
    },
    {
      placeholderData: [],
    }
  );
};
