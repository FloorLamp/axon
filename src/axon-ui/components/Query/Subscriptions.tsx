import { useEffect, useState } from "react";
import { useQueryClient } from "react-query";
import { AxonProposal } from "../../declarations/Axon/Axon.did";
import { getStatus } from "../../lib/axonProposal";
import { ONE_HOUR_MS } from "../../lib/constants";
import { dateTimeFromNanos } from "../../lib/datetime";
import { useActiveProposals } from "../../lib/hooks/Axon/useActiveProposals";
import { useAllProposals } from "../../lib/hooks/Axon/useAllProposals";
import useCleanup from "../../lib/hooks/Axon/useCleanup";
import { useNeurons } from "../../lib/hooks/Axon/useNeurons";
import useSync from "../../lib/hooks/Axon/useSync";
import useAxonId from "../../lib/hooks/useAxonId";
import { useGlobalContext } from "../Store/Store";

export const Subscriptions = () => {
  const axonId = useAxonId();
  const {
    state: { isAuthed },
  } = useGlobalContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Clear cache when logging in or out
    queryClient.removeQueries();
  }, [isAuthed]);

  const sync = useSync();
  const cleanup = useCleanup();

  const neurons = useNeurons();
  useEffect(() => {
    if (neurons.data && !sync.isLoading) {
      const delta = dateTimeFromNanos(neurons.data.timestamp).diffNow();
      if (Math.abs(delta.toMillis()) > ONE_HOUR_MS) {
        console.log("neurons stale, re-syncing...");
        sync.mutate();
      }
    }
  }, [neurons.data]);

  // If any proposals are executing, poll for updates
  const [isExecuting, setIsExecuting] = useState(false);
  const activeProposals = useActiveProposals();
  useEffect(() => {
    const executingProposals = activeProposals.data?.find((proposal) => {
      const status = getStatus(proposal);
      return status === "ExecutionQueued" || status === "ExecutionStarted";
    });
    if (executingProposals) {
      console.log("is Executing", executingProposals);
      setIsExecuting(true);
      setTimeout(activeProposals.refetch, 1000);
    } else {
      setIsExecuting(false);
    }

    // Check for expired and call cleanup
    if (
      activeProposals.data?.find((proposal) => {
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
  }, [axonId, activeProposals.data]);

  // Fetch all proposes once any execution is finished
  useEffect(() => {
    if (axonId && !isExecuting) {
      console.log("execution finished", axonId);

      queryClient.refetchQueries(["allProposals", axonId]);
    }
  }, [axonId, isExecuting]);

  const [previousAllProposals, setPreviousAllProposals] = useState<
    AxonProposal[]
  >([]);
  const { data: allProposals } = useAllProposals();

  // Check for any new proposals and refetch axon queries
  useEffect(() => {
    if (allProposals?.length) {
      if (
        previousAllProposals.length &&
        allProposals.length > previousAllProposals.length
      ) {
        const newProposals = allProposals.filter(
          (d) => !previousAllProposals.find((p) => p.id === d.id)
        );
        console.log("new proposals found", newProposals);

        // If there are new AxonCommands, refetch info
        if (newProposals.find((a) => "AxonCommand" in a.proposal)) {
          console.log("new AxonCommand found");

          queryClient.refetchQueries(["info", axonId]);
          queryClient.refetchQueries(["ledger", axonId]);
          queryClient.refetchQueries(["balance", axonId]);
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

      setPreviousAllProposals(allProposals);
    }
  }, [axonId, allProposals]);

  return null;
};
