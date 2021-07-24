import { useEffect } from "react";
import { useQuery } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { FIVE_MINUTES_MS } from "../../constants";
import { errorToString } from "../../utils";

export const useNeurons = () => {
  const axon = useAxon();
  const queryResult = useQuery(
    "neurons",
    async () => {
      let neurons;
      try {
        neurons = await axon.getNeurons();
      } catch (error) {
        throw error.message;
      }

      if ("ok" in neurons) {
        return neurons.ok;
      } else {
        throw errorToString(neurons.err);
      }
    },
    {
      keepPreviousData: true,
      refetchInterval: FIVE_MINUTES_MS,
    }
  );

  useEffect(() => {
    queryResult.remove();
  }, [axon]);

  return queryResult;
};
