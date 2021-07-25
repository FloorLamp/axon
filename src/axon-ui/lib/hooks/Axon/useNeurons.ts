import { useEffect } from "react";
import { useQuery } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { FIVE_MINUTES_MS } from "../../constants";
import { errorToString, tryCall } from "../../utils";

export const useNeurons = () => {
  const axon = useAxon();
  const queryResult = useQuery(
    "neurons",
    async () => {
      const result = await tryCall(axon.getNeurons);

      if ("ok" in result) {
        return result.ok;
      } else {
        throw errorToString(result.err);
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
