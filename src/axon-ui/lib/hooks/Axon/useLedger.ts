import { useQuery } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { ONE_MINUTES_MS } from "../../constants";
import useAxonId from "../useAxonId";

export const useLedger = () => {
  const id = useAxonId();
  const axon = useAxon();

  const queryResult = useQuery(["ledger", id], () => axon.ledger(BigInt(id)), {
    enabled: !!id,
    keepPreviousData: true,
    refetchInterval: ONE_MINUTES_MS,
  });

  return queryResult;
};
