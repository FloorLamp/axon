import { useQuery } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { ONE_MINUTES_MS } from "../../constants";
import { errorToString } from "../../utils";

export const usePendingActions = () => {
  const axon = useAxon();
  return useQuery(
    "pendingActions",
    async () => {
      const result = await axon.getPendingActions();
      console.log("pendingActions", result);

      if ("ok" in result) {
        return result.ok;
      } else {
        throw errorToString(result.err);
      }
    },
    {
      keepPreviousData: true,
      placeholderData: [],
      refetchInterval: ONE_MINUTES_MS,
    }
  );
};

export const useAllActions = () => {
  const axon = useAxon();
  return useQuery(
    "allActions",
    async () => {
      const result = await axon.getAllActions([]);
      if ("ok" in result) {
        return result.ok;
      } else {
        throw errorToString(result.err);
      }
    },
    {
      keepPreviousData: true,
      placeholderData: [],
      refetchInterval: ONE_MINUTES_MS,
    }
  );
};
