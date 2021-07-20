import { useQuery } from "react-query";
import { useAxon } from "../../components/Store";
import { errorToString } from "../utils";

export const useNeurons = () => {
  const axon = useAxon();
  return useQuery("neurons", async () => {
    const neurons = await axon.listNeurons();

    if ("ok" in neurons) {
      return neurons.ok;
    } else {
      throw errorToString(neurons.err);
    }
  });
};
