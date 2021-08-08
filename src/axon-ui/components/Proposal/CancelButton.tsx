import React from "react";
import { AxonProposal } from "../../declarations/Axon/Axon.did";
import useCancel from "../../lib/hooks/Axon/useCancel";
import SpinnerButton from "../Buttons/SpinnerButton";

export default function CancelButton({ proposal }: { proposal: AxonProposal }) {
  const cancel = useCancel(proposal.id);

  return (
    <SpinnerButton
      className="w-16 leading-none py-1"
      activeClassName="bg-transparent border-gray-800 border-2 transition-opacity opacity-50 hover:opacity-100"
      disabledClassName="border-gray-800 border-2 text-gray-800 opacity-50"
      isLoading={cancel.isLoading}
      onClick={(e) => cancel.mutate()}
      title="Cancel Proposal"
    >
      Cancel
    </SpinnerButton>
  );
}
