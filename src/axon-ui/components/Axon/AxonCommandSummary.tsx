import assert from "assert";
import React from "react";
import {
  AxonAction,
  AxonCommandRequest,
} from "../../declarations/Axon/Axon.did";
import { AxonCommandKey } from "../../lib/types";
import { DataRow, DataTable } from "../Action/ActionSummary";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";

export default function AxonCommandSummary({
  command,
  action,
}: {
  command: AxonCommandRequest;
  action: AxonAction;
}) {
  const key = Object.keys(command)[0] as AxonCommandKey;
  switch (key) {
    case "AddOwner":
    case "RemoveOwner": {
      const { principal, needed } = command[key];
      let total = action.ballots.length;
      if (key === "AddOwner") {
        total += 1;
      } else {
        total -= 1;
      }

      return (
        <DataTable label="Add owner">
          <DataRow labelClassName="w-20" label="Principal">
            <IdentifierLabelWithButtons id={principal} type="Principal">
              {principal.toString()}
            </IdentifierLabelWithButtons>
          </DataRow>
          <DataRow labelClassName="w-20" label="Approvals">
            <strong>{needed.toString()}</strong> out of <strong>{total}</strong>
          </DataRow>
        </DataTable>
      );
    }
    case "SetPolicy": {
      assert("SetPolicy" in command);
      const { needed } = command.SetPolicy;
      return (
        <DataTable label="Set Policy">
          <div>
            <strong>{needed.toString()}</strong> out of{" "}
            <strong>{action.ballots.length}</strong>
          </div>
        </DataTable>
      );
    }
    case "UpdateVisibility": {
      assert("UpdateVisibility" in command);
      const visibility = Object.keys(command.UpdateVisibility)[0];
      return (
        <div>
          Set Visibility to <strong>{visibility}</strong>
        </div>
      );
    }
  }
}
