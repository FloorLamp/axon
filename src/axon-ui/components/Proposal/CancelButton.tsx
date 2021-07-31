import React from "react";
import { AxonProposal } from "../../declarations/Axon/Axon.did";
import useCancel from "../../lib/hooks/Axon/useCancel";
import SpinnerButton from "../Buttons/SpinnerButton";

export default function CancelButton({ proposal }: { proposal: AxonProposal }) {
  const cancel = useCancel(proposal.id);

  return (
    <SpinnerButton
      className="w-16 text-xs leading-none px-1 py-0.5"
      activeClassName="bg-gray-300 hover:bg-gray-200 transition-colors"
      disabledClassName="bg-gray-200 text-gray-400"
      isLoading={cancel.isLoading}
      onClick={(e) => cancel.mutate()}
      title="Cancel Proposal"
    >
      Cancel
    </SpinnerButton>
  );
}
