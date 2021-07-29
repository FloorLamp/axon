import assert from "assert";
import React from "react";
import {
  AxonCommandExecution,
  AxonCommandResponse,
} from "../../declarations/Axon/Axon.did";
import { KeysOfUnion } from "../../lib/types";
import { errorToString, formatNumber, shortPrincipal } from "../../lib/utils";
import {
  CommandError,
  CommandSuccess,
} from "../Proposal/CommandResponseSummary";

const renderSuccess = (result: AxonCommandExecution) => {
  const key = Object.keys(result)[0] as KeysOfUnion<AxonCommandExecution>;
  switch (key) {
    case "Ok":
      return null;
    case "SupplyChanged":
      assert("SupplyChanged" in result);
      return `Supply changed from ${formatNumber(
        result.SupplyChanged.from
      )} to ${formatNumber(result.SupplyChanged.to)}`;
    case "Transfer":
      assert("Transfer" in result);
      return `Transferred ${formatNumber(
        result.Transfer.amount
      )} to ${shortPrincipal(result.Transfer.receiver)}`;
  }
};

export const AxonCommandResponseSummary = ({
  response,
}: {
  response: AxonCommandResponse;
}) => {
  if ("ok" in response) {
    return (
      <CommandSuccess label="Success">
        {renderSuccess(response.ok)}
      </CommandSuccess>
    );
  } else {
    return (
      <CommandError label="Error">{errorToString(response.err)}</CommandError>
    );
  }
};
