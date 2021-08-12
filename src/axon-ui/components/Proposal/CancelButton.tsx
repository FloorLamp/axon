import React from "react";
import { AxonProposal } from "../../declarations/Axon/Axon.did";
import useCancel from "../../lib/hooks/Axon/useCancel";
import SpinnerButton from "../Buttons/SpinnerButton";

export default function CancelButton({ proposal }: { proposal: AxonProposal }) {
  const cancel = useCancel(proposal.id);

  return (
    <SpinnerButton
      className="w-20 leading-none p-2 ring-2 ring-inset ring-gray-800 bg-transparent opacity-50"
      activeClassName="transition-opacity hover:opacity-100"
      disabledClassName="text-gray-800"
      isLoading={cancel.isLoading}
      onClick={(e) => cancel.mutate()}
      title="Cancel Proposal"
    >
      Cancel
    </SpinnerButton>
  );
}
