import { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { useAxon } from "../../../components/Store/Store";
import { AxonProposal } from "../../../declarations/Axon/Axon.did";
import { ONE_MINUTES_MS } from "../../constants";
import { errorToString, tryCall } from "../../utils";
import useAxonId from "../useAxonId";
import useSync from "./useSync";

export const useAllProposals = () => {
  const id = useAxonId();
  const axon = useAxon();

  const sync = useSync();
  const queryClient = useQueryClient();
  const [previousData, setPreviousData] = useState<AxonProposal[]>([]);

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
      enabled: !!id,
      keepPreviousData: true,
      placeholderData: [],
      refetchInterval: ONE_MINUTES_MS,
      onSuccess: (data) => {
        // Check for any new proposals that moved out of active state

        if (previousData.length && data.length > previousData.length) {
          console.log("new proposals found", data);

          const newProposals = data.filter(
            (d) => !previousData.find((p) => p.id === d.id)
          );
          // If there are new AxonCommands, refetch info
          if (newProposals.find((a) => "AxonCommand" in a.proposal)) {
            console.log("new AxonCommand found");

            queryClient.refetchQueries(["info", id]);
            queryClient.refetchQueries(["ledger", id]);
            queryClient.refetchQueries(["balance", id]);
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
        setPreviousData(data);
      },
    }
  );

  return queryResult;
};
