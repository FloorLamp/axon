import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { AxonAction } from "../../../declarations/Axon/Axon.did";
import { ONE_MINUTES_MS } from "../../constants";
import { errorToString, tryCall } from "../../utils";
import useSync from "./useSync";

export const usePendingActions = () => {
  const axon = useAxon();
  const queryResult = useQuery(
    "pendingActions",
    async () => {
      const result = await tryCall(axon.getPendingActions);
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
      const result = await tryCall(() => axon.getAllActions([]));
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

  const sync = useSync();
  const queryClient = useQueryClient();
  const [previousData, setPreviousData] = useState<AxonAction[]>(null);
  // Check for any new actions that moved out of pending state
  useEffect(() => {
    if (
      previousData &&
      queryResult.data &&
      queryResult.data.length > previousData.length
    ) {
      const newActions = queryResult.data.filter(
        (d) => !previousData.find((p) => p.id === d.id)
      );
      // If there are new AxonCommands, refetch info
      if (newActions.find((a) => "AxonCommand" in a.action)) {
        queryClient.refetchQueries(["info"]);
      }

      // If there are new successfully executed NeuronCommands, sync neurons
      if (
        newActions.find(
          (a) =>
            "NeuronCommand" in a.action &&
            a.action.NeuronCommand[1][0] &&
            a.action.NeuronCommand[1][0].find((r) => "ok" in r[1])
        )
      ) {
        sync.mutate();
      }
    }
    setPreviousData(queryResult.data);
  }, [queryResult.data]);

  return queryResult;
};
