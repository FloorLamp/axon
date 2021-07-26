import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { AxonProposal } from "../../../declarations/Axon/Axon.did";
import { ONE_MINUTES_MS } from "../../constants";
import { errorToString, tryCall } from "../../utils";
import useAxonId from "../useAxonId";
import useSync from "./useSync";

export const usePendingProposals = () => {
  const id = useAxonId();
  const axon = useAxon();
  const queryResult = useQuery(
    ["pendingProposals", id],
    async () => {
      const result = await tryCall(() => axon.getPendingProposals(BigInt(id)));
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
    console.log("got pending proposals", queryResult.data);

    if (queryResult.data?.find((action) => "Executing" in action.status)) {
      setIsExecuting(true);
      setTimeout(queryResult.refetch, 1000);
    } else {
      setIsExecuting(false);
    }
  }, [queryResult.data]);

  useEffect(() => {
    if (!isExecuting) {
      queryClient.refetchQueries(["allProposals", id]);
    }
  }, [isExecuting]);

  useEffect(() => {
    queryResult.remove();
  }, [axon]);

  return queryResult;
};

export const useAllProposals = () => {
  const id = useAxonId();
  const axon = useAxon();
  const queryResult = useQuery(
    ["allProposals", id],
    async () => {
      const result = await tryCall(() => axon.getAllProposals(BigInt(id), []));
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
  const [previousData, setPreviousData] = useState<AxonProposal[]>(null);
  // Check for any new actions that moved out of pending state
  useEffect(() => {
    if (
      previousData &&
      queryResult.data &&
      queryResult.data.length > previousData.length
    ) {
      const newProposals = queryResult.data.filter(
        (d) => !previousData.find((p) => p.id === d.id)
      );
      // If there are new AxonCommands, refetch info
      if (newProposals.find((a) => "AxonCommand" in a.proposal)) {
        console.log("new AxonCommand found");

        queryClient.refetchQueries(["info", id]);
      }

      // If there are new successfully executed NeuronCommands, sync neurons
      if (
        newProposals.find(
          (a) =>
            "NeuronCommand" in a.proposal &&
            a.proposal.NeuronCommand[1][0] &&
            a.proposal.NeuronCommand[1][0].find((r) => "ok" in r[1])
        )
      ) {
        sync.mutate();
      }
    }
    setPreviousData(queryResult.data);
  }, [queryResult.data]);

  return queryResult;
};
