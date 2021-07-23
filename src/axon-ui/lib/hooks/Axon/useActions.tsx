import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { ONE_MINUTES_MS } from "../../constants";
import { errorToString } from "../../utils";

export const usePendingActions = () => {
  const axon = useAxon();
  const queryResult = useQuery(
    "pendingActions",
    async () => {
      const result = await axon.getPendingActions();
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

  // If any actions are executing, poll for updates
  const queryClient = useQueryClient();
  const [isExecuting, setIsExecuting] = useState(false);
  useEffect(() => {
    if (queryResult.data?.find((action) => "Executing" in action.status)) {
      setIsExecuting(true);
      setTimeout(queryResult.refetch, 2000);
    } else {
      setIsExecuting(false);
    }
  }, [queryResult.data]);

  useEffect(() => {
    if (!isExecuting) {
      queryClient.refetchQueries(["allActions"]);
    }
  }, [isExecuting]);

  useEffect(() => {
    queryResult.remove();
  }, [axon]);

  return queryResult;
};

export const useAllActions = () => {
  const axon = useAxon();
  const queryResult = useQuery(
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

  useEffect(() => {
    queryResult.remove();
  }, [axon]);

  return queryResult;
};
