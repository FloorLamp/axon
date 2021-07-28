import { useEffect } from "react";
import { useQuery } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { FIVE_MINUTES_MS } from "../../constants";
import { errorToString, tryCall } from "../../utils";
import useAxonId from "../useAxonId";

export const useNeurons = () => {
  const id = useAxonId();
  const axon = useAxon();
  const queryResult = useQuery(
    ["neurons", id],
    async () => {
      const result = await tryCall(() => axon.getNeurons(BigInt(id)));

      if ("ok" in result) {
        return result.ok;
      } else if ("NoNeurons" in result.err) {
        return null;
      } else {
        throw errorToString(result.err);
      }
    },
    {
      enabled: !!id,
      keepPreviousData: true,
      refetchInterval: FIVE_MINUTES_MS,
    }
  );

  useEffect(() => {
    queryResult.remove();
  }, [axon]);

  return queryResult;
};
