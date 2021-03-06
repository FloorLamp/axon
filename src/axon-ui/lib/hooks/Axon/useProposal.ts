import { useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { AxonProposal } from "../../../declarations/Axon/Axon.did";
import { getStatus } from "../../axonProposal";
import { ONE_MINUTES_MS } from "../../constants";
import { errorToString, tryCall } from "../../utils";
import useAxonId from "../useAxonId";

export const useProposal = (proposalId: string) => {
  const axonId = useAxonId();
  const axon = useAxon();
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

  // If this proposal is executing, poll for updates
  useEffect(() => {
    if (!queryResult.data) {
      return;
    }
    const status = getStatus(queryResult.data);
    if (status === "ExecutionQueued" || status === "ExecutionStarted") {
      console.log("is Executing", queryResult.data);
      setTimeout(queryResult.refetch, 1000);
    }
  }, [queryResult.data]);

  return queryResult;
};
