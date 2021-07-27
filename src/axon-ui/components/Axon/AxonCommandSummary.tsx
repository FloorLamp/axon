import { Principal } from "@dfinity/principal";
import assert from "assert";
import React from "react";
import { AxonCommandRequest } from "../../declarations/Axon/Axon.did";
import { AxonCommandKey } from "../../lib/types";
import IdentifierLabelWithButtons from "../Buttons/IdentifierLabelWithButtons";
import { DataRow, DataTable } from "../Proposal/DataTable";
import PolicySummary from "./PolicySummary";

export default function AxonCommandSummary({
  command,
}: {
  command: AxonCommandRequest;
}) {
  const key = Object.keys(command)[0] as AxonCommandKey;
  switch (key) {
    case "AddMembers":
    case "RemoveMembers": {
      const principals = command[key] as Array<Principal>;

      return (
        <DataTable
          label={`${key === "AddMembers" ? "Add" : "Remove"} Proposers`}
        >
          <DataRow labelClassName="w-20" label="Principals">
            {principals.map((principal) => (
              <IdentifierLabelWithButtons
                key={principal.toText()}
                id={principal}
                type="Principal"
              />
            ))}
          </DataRow>
        </DataTable>
      );
    }
    case "SetPolicy": {
      assert("SetPolicy" in command);
      const payload = command.SetPolicy;
      return <PolicySummary label="Set Policy" policy={payload} />;
    }
    case "SetVisibility": {
      assert("SetVisibility" in command);
      const visibility = Object.keys(command.SetVisibility)[0];
      return (
        <div>
          Set Visibility to <strong>{visibility}</strong>
        </div>
      );
    }
  }
}
