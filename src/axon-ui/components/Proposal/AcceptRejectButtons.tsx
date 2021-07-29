import classNames from "classnames";
import React, { MouseEvent, useState } from "react";
import { BsCheck, BsX } from "react-icons/bs";
import { useIsMutating } from "react-query";
import { AxonProposal } from "../../declarations/Axon/Axon.did";
import useAxonId from "../../lib/hooks/useAxonId";
import SpinnerButton from "../Buttons/SpinnerButton";
import Modal from "../Layout/Modal";
import VoteForm from "./VoteForm";

export default function AcceptRejectButtons({
  proposal,
  size = "large",
}: {
  proposal: AxonProposal;
  size?: "small" | "large";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const axonId = useAxonId();
  const [yesNo, setYesNo] = useState(false);
  const handleVote = (e: MouseEvent, yesNo: boolean) => {
    e.stopPropagation();
    setYesNo(yesNo);
    openModal();
  };
  const isLoading = !!useIsMutating({
    mutationKey: ["vote", axonId, proposal.id],
  });

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <SpinnerButton
            className={classNames({
              "w-20 text-sm p-2": size === "large",
              "p-0.5": size === "small",
            })}
            activeClassName="text-white bg-green-500 hover:bg-green-400 transition-colors"
            disabledClassName="text-white bg-green-300"
            isLoading={isLoading}
            onClick={(e) => handleVote(e, true)}
            title="Accept Proposal"
          >
            {size === "large" ? "Accept" : <BsCheck />}
          </SpinnerButton>
          <SpinnerButton
            className={classNames({
              "w-20 text-sm p-2": size === "large",
              "p-0.5": size === "small",
            })}
            activeClassName="text-white bg-red-500 hover:bg-red-400 transition-colors"
            disabledClassName="text-white bg-red-300"
            isLoading={isLoading}
            onClick={(e) => handleVote(e, false)}
            title="Reject Proposal"
          >
            {size === "large" ? "Reject" : <BsX />}
          </SpinnerButton>
        </div>
      </div>
      <Modal
        isOpen={isOpen}
        openModal={openModal}
        closeModal={closeModal}
        title="Submit Vote"
      >
        <VoteForm proposal={proposal} yesNo={yesNo} closeModal={closeModal} />
      </Modal>
    </>
  );
}
