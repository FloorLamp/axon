import assert from "assert";
import React from "react";
import {
  AxonAction,
  AxonCommandRequest,
} from "../../declarations/Axon/Axon.did";
import { AxonCommandKey } from "../../lib/types";
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
        <div>
          <strong>Add owner</strong>
          <div className="flex">
            <span className="w-20">Principal</span>
            <IdentifierLabelWithButtons id={principal} type="Principal">
              {principal.toString()}
            </IdentifierLabelWithButtons>
          </div>
          <div className="flex">
            <span className="w-20">Approvals</span>
            <div>
              <strong>{needed.toString()}</strong> out of{" "}
              <strong>{total}</strong>
            </div>
          </div>
        </div>
      );
    }
    case "SetPolicy": {
      assert("SetPolicy" in command);
      const { needed } = command.SetPolicy;
      return (
        <div>
          <strong>Set Policy</strong>
          <div>
            <strong>{needed.toString()}</strong> out of{" "}
            <strong>{action.ballots.length}</strong>
          </div>
        </div>
      );
    }
    case "UpdateVisibility": {
      assert("UpdateVisibility" in command);
      const visibility = Object.keys(command.UpdateVisibility)[0];
      return (
        <span>
          Set Visibility to <strong>{visibility}</strong>
        </span>
      );
    }
  }
}
