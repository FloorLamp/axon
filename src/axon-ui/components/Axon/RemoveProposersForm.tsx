import { Principal } from "@dfinity/principal";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { AxonCommandRequest } from "../../declarations/Axon/Axon.did";
import { useAxonById } from "../../lib/hooks/Axon/useAxonById";
import useNames from "../../lib/hooks/useNames";

export function RemoveProposersForm({
  makeCommand,
  defaults,
}: {
  makeCommand: (cmd: AxonCommandRequest | null) => void;
  defaults?: Extract<
    AxonCommandRequest,
    { RemoveMembers: {} }
  >["RemoveMembers"];
}) {
  const { principalName } = useNames();
  const { data } = useAxonById();
  const [users, setUsers] = useState(defaults?.map((p) => p.toText()) ?? []);
  const [inputError, setInputError] = useState("");

  const members =
    data && "Closed" in data.policy.proposers
      ? data.policy.proposers.Closed
      : [];
  const membersOptions = members.map((principal) => {
    const value = principal.toText();
    return { value, label: principalName(value) };
  });

  useEffect(() => {
    setInputError("");
    if (!users.length || members.length <= 1) {
      return makeCommand(null);
    }

    let RemoveMembers: Principal[];
    try {
      RemoveMembers = users.map((value) => Principal.fromText(value));
    } catch (err) {
      setInputError(`Invalid principal: ${err.message}`);
      return makeCommand(null);
    }

    makeCommand({
      RemoveMembers,
    });
  }, [users]);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm leading-tight">
        Remove Principals from the set of eligible proposers. Non-proposers are
        still able to vote.
      </p>

      {members.length > 1 ? (
        <label className="block">
          <span>Proposers</span>
          <Select
            className="react-select"
            isMulti={true}
            onChange={(values) => setUsers(values.map(({ value }) => value))}
            options={membersOptions}
            defaultValue={defaults?.map((p) => ({
              value: p.toText(),
              label: p.toText(),
            }))}
          />
        </label>
      ) : (
        <p className="px-2 text-gray-500">Cannot remove the only proposer.</p>
      )}
    </div>
  );
}
