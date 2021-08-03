import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { AxonProposal } from "../../../declarations/Axon/Axon.did";
import { getStatus } from "../../axonProposal";
import { ONE_MINUTES_MS } from "../../constants";
import { dateTimeFromNanos } from "../../datetime";
import { errorToString, tryCall } from "../../utils";
import useAxonId from "../useAxonId";
import useCleanup from "./useCleanup";

export const useProposal = (proposalId: string) => {
  const axonId = useAxonId();
  const axon = useAxon();
  const cleanup = useCleanup();
  const queryClient = useQueryClient();

  const queryResult = useQuery(
    ["proposal", axonId, proposalId],
    async () => {
      const result = await tryCall(() =>
        axon.getProposalById(BigInt(axonId), BigInt(proposalId))
      );
      if ("ok" in result) {
        return result.ok;
      } else {
        throw errorToString(result.err);
      }
    },
    {
      enabled: !!axonId && !!proposalId,
      keepPreviousData: true,
      initialData: () => {
        return (
          queryClient
            .getQueryData<AxonProposal[]>(["activeProposals", axonId])
            ?.find((p) => p.id.toString() === proposalId) ??
          queryClient
            .getQueryData<AxonProposal[]>(["allProposals", axonId])
            ?.find((p) => p.id.toString() === proposalId)
        );
      },
      refetchInterval: ONE_MINUTES_MS,
    }
  );

  // If any proposals are executing, poll for updates
  const [isExecuting, setIsExecuting] = useState(false);
  useEffect(() => {
    if (!queryResult.data) {
      return;
    }
    const status = getStatus(queryResult.data);
    if (status === "ExecutionQueued" || status === "ExecutionStarted") {
      console.log("is Executing", queryResult.data);
      setIsExecuting(true);
      setTimeout(queryResult.refetch, 1000);
    } else {
      setIsExecuting(false);
    }

    // Check for expired and call cleanup
    if (
      (status === "Active" &&
        dateTimeFromNanos(queryResult.data.timeEnd).diffNow().toMillis() < 0) ||
      (status === "Created" &&
        dateTimeFromNanos(queryResult.data.timeStart).diffNow().toMillis() < 0)
    ) {
      cleanup.mutate();
    }
  }, [queryResult.data]);

  useEffect(() => {
    if (axonId && !isExecuting) {
      queryClient.refetchQueries(["proposal", axonId, proposalId]);
    }
  }, [isExecuting]);

  return queryResult;
};
