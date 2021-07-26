import { useQuery } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { FIVE_MINUTES_MS } from "../../constants";
import { tryCall } from "../../utils";
import useAxonId from "../useAxonId";

export const useNeuronIds = () => {
  const id = useAxonId();
  const axon = useAxon();
  return useQuery(
    ["neuronIds", id],
    async () => {
      if (!id) {
        return null;
      }
      const result = await tryCall(() => axon.getNeuronIds(BigInt(id)));
      return result.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    },
    {
      keepPreviousData: true,
      placeholderData: [],
      refetchInterval: FIVE_MINUTES_MS,
    }
  );
};
