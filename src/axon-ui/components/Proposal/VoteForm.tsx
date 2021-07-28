import classNames from "classnames";
import React from "react";
import { useIsMutating } from "react-query";
import { AxonProposal } from "../../declarations/Axon/Axon.did";
import { useMyBallot } from "../../lib/hooks/Axon/useMyBallot";
import useVote from "../../lib/hooks/Axon/useVote";
import useAxonId from "../../lib/hooks/useAxonId";
import { proposalTypeToString } from "../../lib/proposalTypes";
import { formatNumber } from "../../lib/utils";
import SpinnerButton from "../Buttons/SpinnerButton";
import ErrorAlert from "../Labels/ErrorAlert";
import VoteSummary from "./VoteSummary";

export default function VoteForm({
  proposal,
  closeModal,
  yesNo,
}: {
  proposal: AxonProposal;
  closeModal: () => void;
  yesNo: boolean;
}) {
  const axonId = useAxonId();
  const myBallot = useMyBallot(proposal);
  const { mutate, isError, error } = useVote(proposal.id);
  const isLoading = !!useIsMutating({
    mutationKey: ["vote", axonId, proposal.id],
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    mutate(
      { yesNo },
      {
        onSuccess: closeModal,
      }
    );
  }

  if (!myBallot) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col divide-gray-300 divide-y">
        <div className="pb-4 flex flex-col gap-4">
          <p className="leading-tight">
            You have <strong>{formatNumber(myBallot.votingPower)}</strong> vote
            power.
          </p>
          <div>
            <p className="leading-tight">
              You are voting{" "}
              <span
                className={classNames("font-bold uppercase", {
                  "text-green-500": yesNo,
                  "text-red-500": !yesNo,
                })}
              >
                {yesNo ? "For" : "Against"}
              </span>{" "}
              Proposal #{proposal.id.toString()}:
            </p>
            <p className="pt-2 text-sm leading-tight italic">
              {proposalTypeToString(proposal.proposal)}
            </p>
          </div>
          <VoteSummary
            proposal={proposal}
            newVote={{
              yesNo,
              votePower: myBallot.votingPower,
            }}
          />
        </div>
        <div className="flex flex-col gap-2 py-4">
          <SpinnerButton
            className="w-20 p-2"
            activeClassName="btn-cta"
            disabledClassName="btn-cta-disabled"
            isLoading={isLoading}
          >
            Submit
          </SpinnerButton>

          {isError && <ErrorAlert>{error}</ErrorAlert>}
        </div>
      </div>
    </form>
  );
}
