import classNames from "classnames";
import React, { ReactNode } from "react";
import {
  FaCheckCircle,
  FaDotCircle,
  FaExclamationCircle,
  FaPlusCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { Action, Ballot } from "../../declarations/Axon/Axon.did";
import { useIsOwner } from "../../lib/hooks/Axon/useIsOwner";
import { StatusKey } from "../../lib/types";
import { pluralize, shortPrincipal } from "../../lib/utils";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import { ActionResponseSummary } from "./ActionResponseSummary";
import ApproveRejectButtons from "./ApproveRejectButtons";
import ExecuteButton from "./ExecuteButton";

const CIRCLE_SIZE = 18;

const Step = ({
  circle,
  label,
  children,
  showLine = true,
}: {
  circle: ReactNode;
  label: ReactNode;
  children?: ReactNode;
  showLine?: boolean;
}) => {
  return (
    <li className="flex flex-col text-sm">
      <div className="flex items-center">
        <div className="w-6 flex justify-center">{circle}</div>
        <div className="pl-2 uppercase font-bold">{label}</div>
      </div>
      <div className="flex items-stretch">
        <div className="w-6 flex justify-center">
          {showLine && <div className="bg-gray-200 w-px h-full -mx-px" />}
        </div>
        <div className={classNames("pl-2", { "pb-2": showLine })}>
          {children}
        </div>
      </div>
    </li>
  );
};

function BallotsList({ ballots }: { ballots: Ballot[] }) {
  return (
    <ul className="flex flex-col gap-0.5 text-gray-800">
      {ballots.map((ballot, i) => {
        const principalText = ballot.principal.toText();
        return (
          <li key={principalText + i} className="flex gap-1">
            <IdentifierLabelWithButtons type="Principal" id={ballot.principal}>
              <span title={principalText}>
                {shortPrincipal(ballot.principal)}
              </span>
            </IdentifierLabelWithButtons>
          </li>
        );
      })}
    </ul>
  );
}

export default function Steps({
  action,
  isEligibleToVote,
}: {
  action: Action;
  isEligibleToVote: boolean;
}) {
  const isOwner = useIsOwner();

  const ballots = action.ballots.filter(({ vote }) => !!vote[0]);

  const status = Object.keys(action.status)[0] as StatusKey;
  const policy = action.policy[0];

  let activeStep: JSX.Element;
  if (status === "Pending" || status === "Accepted") {
    let remaining: JSX.Element;
    if (status === "Pending" && policy) {
      const neededMinusCurrent = Number(policy.needed) - ballots.length;
      remaining = (
        <span className="text-gray-400">
          <strong>{neededMinusCurrent}</strong> more{" "}
          {pluralize("approval", neededMinusCurrent)} needed
        </span>
      );
    }

    const showActions = isOwner && (isEligibleToVote || status === "Accepted");

    activeStep = (
      <Step
        circle={<FaDotCircle size={CIRCLE_SIZE} className="text-gray-300" />}
        label={<span className="text-gray-400">Execute</span>}
        showLine={false}
      >
        {remaining}
        {showActions && (
          <div className="mt-2 border-t border-gray-300 pt-3">
            {isEligibleToVote && <ApproveRejectButtons id={action.id} />}
            {status === "Accepted" && <ExecuteButton id={action.id} />}
          </div>
        )}
      </Step>
    );
  }

  const approves = ballots.filter(({ vote: [v] }) => "Yes" in v);
  const rejects = ballots.filter(({ vote: [v] }) => "No" in v);

  return (
    <ul className="flex flex-col">
      <Step
        circle={<FaPlusCircle size={CIRCLE_SIZE} className="text-gray-400" />}
        label={<span className="text-gray-800">Created</span>}
      >
        <IdentifierLabelWithButtons type="Principal" id={action.creator}>
          {shortPrincipal(action.creator)}
        </IdentifierLabelWithButtons>
      </Step>
      {approves.length > 0 && (
        <Step
          circle={
            <FaCheckCircle size={CIRCLE_SIZE} className="text-green-400" />
          }
          label={
            <span className="text-green-700">Approved ({approves.length})</span>
          }
        >
          <BallotsList ballots={approves} />
        </Step>
      )}
      {rejects.length > 0 && (
        <Step
          circle={<FaTimesCircle size={CIRCLE_SIZE} className="text-red-400" />}
          label={
            <span className="text-red-700">Rejected ({rejects.length})</span>
          }
          showLine={status !== "Rejected"}
        >
          <BallotsList ballots={rejects} />
        </Step>
      )}
      {activeStep}
      {"Executed" in action.status && (
        <Step
          circle={
            <FaCheckCircle size={CIRCLE_SIZE} className="text-green-400" />
          }
          label={<span className="text-green-700">Executed</span>}
          showLine={false}
        >
          <ActionResponseSummary actionType={action.action} />
        </Step>
      )}
      {status === "Expired" && (
        <Step
          circle={
            <FaExclamationCircle size={CIRCLE_SIZE} className="text-gray-300" />
          }
          label={<span className="text-gray-400">Expired</span>}
          showLine={false}
        />
      )}
    </ul>
  );
}
