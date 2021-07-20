import { useQuery } from "react-query";
import { useAxon } from "../../components/Store";

export const useNeuronIds = () => {
  const axon = useAxon();
  return useQuery(
    "neuronIds",
    async () => {
      const ids = await axon.getNeuronIds();
      return ids;
    },
    {
      placeholderData: [],
    }
  );
};
