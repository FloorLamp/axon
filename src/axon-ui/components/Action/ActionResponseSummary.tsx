import React, { ReactNode } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { ActionType } from "../../declarations/Axon/Axon.did";
import { AxonCommandResponseSummary } from "../Axon/AxonCommandResponseSummary";
import ErrorAlert from "../Labels/ErrorAlert";
import SuccessAlert from "../Labels/SuccessAlert";
import NeuronCommandResponseList from "./NeuronCommandResponseList";

export const ActionError = ({
  label,
  children,
}: {
  label: string;
  children?: ReactNode;
}) => {
  return (
    <ErrorAlert>
      <div className="flex items-center">
        <FaTimesCircle className="w-4 text-red-500" />
        <div className="pl-1 font-bold">{label}</div>
      </div>
      {children && (
        <div className="flex pt-0.5">
          <div className="w-5" />
          <div className="flex-1">{children}</div>
        </div>
      )}
    </ErrorAlert>
  );
};

export const ActionSuccess = ({
  label,
  children,
}: {
  label: string;
  children?: ReactNode;
}) => {
  return (
    <SuccessAlert>
      <div className="flex items-center">
        <FaCheckCircle className="w-4 text-green-500" />
        <div className="pl-1 font-bold">{label}</div>
      </div>
      {children && (
        <div className="flex pt-0.5">
          <div className="w-5" />
          <div className="flex-1">{children}</div>
        </div>
      )}
    </SuccessAlert>
  );
};

export const ActionResponseSummary = ({
  actionType,
}: {
  actionType: ActionType;
}) => {
  let summary = null;
  if ("AxonCommand" in actionType) {
    const response = actionType.AxonCommand[1][0];
    if (response) {
      summary = <AxonCommandResponseSummary response={response} />;
    }
  } else {
    const response = actionType.NeuronCommand[1][0];
    if (response) {
      summary = <NeuronCommandResponseList responses={response} />;
    }
  }
  return summary && <div className="pt-2">{summary}</div>;
};
