import { useQuery } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { ONE_MINUTES_MS } from "../../constants";
import useAxonId from "../useAxonId";

export const useBalance = () => {
  const id = useAxonId();
  const axon = useAxon();

  const queryResult = useQuery(
    ["balance", id],
    () => axon.balanceOf(BigInt(id), []),
    {
      enabled: !!id,
      keepPreviousData: true,
      refetchInterval: ONE_MINUTES_MS,
    }
  );

  return queryResult;
};
