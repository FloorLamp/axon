import { useEffect } from "react";
import { useQuery } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { ONE_MINUTES_MS } from "../../constants";
import { tryCall } from "../../utils";
import useAxonId from "../useAxonId";

export const useBalance = () => {
  const id = useAxonId();
  const axon = useAxon();

  const queryResult = useQuery(
    ["balance", id],
    async () => {
      if (!id) {
        return null;
      }
      return await tryCall(() => axon.balanceOf(BigInt(id)));
    },
    {
      keepPreviousData: true,
      refetchInterval: ONE_MINUTES_MS,
    }
  );

  useEffect(() => {
    queryResult.refetch();
  }, [axon]);

  return queryResult;
};
