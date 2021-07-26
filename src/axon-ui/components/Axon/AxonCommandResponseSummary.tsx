import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import { AxonCommandResponse } from "../../declarations/Axon/Axon.did";
import { errorToString } from "../../lib/utils";
import SuccessAlert from "../Labels/SuccessAlert";
import { CommandError } from "../Proposal/CommandResponseSummary";

export const AxonCommandResponseSummary = ({
  response,
}: {
  response: AxonCommandResponse;
}) => {
  if ("ok" in response) {
    return (
      <SuccessAlert>
        <div className="flex items-center">
          <FaCheckCircle className="w-4 text-green-500" />
          <div className="pl-1 font-bold">Success</div>
        </div>
      </SuccessAlert>
    );
  } else {
    return (
      <CommandError label="Error">{errorToString(response.err)}</CommandError>
    );
  }
};
