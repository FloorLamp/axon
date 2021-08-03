import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { getStatus } from "../../axonProposal";
import { ONE_MINUTES_MS } from "../../constants";
import { dateTimeFromNanos } from "../../datetime";
import { errorToString, tryCall } from "../../utils";
import useAxonId from "../useAxonId";
import useCleanup from "./useCleanup";

export const useActiveProposals = () => {
  const id = useAxonId();
  const axon = useAxon();
  const cleanup = useCleanup();

  const queryResult = useQuery(
    ["activeProposals", id],
    async () => {
      const result = await tryCall(() => axon.getActiveProposals(BigInt(id)));
      if ("ok" in result) {
        return result.ok;
      } else {
        throw errorToString(result.err);
      }
    },
    {
      enabled: !!id,
      keepPreviousData: true,
      placeholderData: [],
      refetchInterval: ONE_MINUTES_MS,
    }
  );

  // If any proposals are executing, poll for updates
  const queryClient = useQueryClient();
  const [isExecuting, setIsExecuting] = useState(false);
  useEffect(() => {
    if (
      queryResult.data?.find((proposal) => {
        const status = getStatus(proposal);
        return status === "ExecutionQueued" || status === "ExecutionStarted";
      })
    ) {
      console.log("is Executing", queryResult.data);
      setIsExecuting(true);
      setTimeout(queryResult.refetch, 1000);
    } else {
      setIsExecuting(false);
    }

    // Check for expired and call cleanup
    if (
      queryResult.data?.find((proposal) => {
        const status = getStatus(proposal);
        return (
          (status === "Active" &&
            dateTimeFromNanos(proposal.timeEnd).diffNow().toMillis() < 0) ||
          (status === "Created" &&
            dateTimeFromNanos(proposal.timeStart).diffNow().toMillis() < 0)
        );
      })
    ) {
      cleanup.mutate();
    }
  }, [queryResult.data]);

  useEffect(() => {
    if (id && !isExecuting) {
      queryClient.refetchQueries(["allProposals", id]);
    }
  }, [isExecuting]);

  return queryResult;
};
