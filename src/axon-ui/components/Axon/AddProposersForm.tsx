import { Principal } from "@dfinity/principal";
import React, { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { AxonCommandRequest } from "../../declarations/Axon/Axon.did";
import { useAxonById } from "../../lib/hooks/Axon/useAxonById";
import { formatNumber } from "../../lib/utils";
import ErrorAlert from "../Labels/ErrorAlert";

export function AddProposersForm({
  makeCommand,
  defaults,
}: {
  makeCommand: (cmd: AxonCommandRequest | null) => void;
  defaults?: Extract<AxonCommandRequest, { AddMembers: {} }>["AddMembers"];
}) {
  const { data } = useAxonById();
  const [users, setUsers] = useState(defaults?.map((p) => p.toText()) ?? []);
  const [inputError, setInputError] = useState("");

  useEffect(() => {
    setInputError("");
    if (!users.length) {
      return makeCommand(null);
    }

    let AddMembers: Principal[];
    try {
      AddMembers = users.map((value) => Principal.fromText(value));
    } catch (err) {
      setInputError(`Invalid principal: ${err.message}`);
      return makeCommand(null);
    }

    makeCommand({
      AddMembers,
    });
  }, [users]);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm leading-tight">
        Specify the Principals that are able to create proposals, assuming they
        hold the minimum proposal creation balance (currently{" "}
        {data ? formatNumber(data.policy.proposeThreshold) : "-"}).
      </p>

      <label className="block">
        <span>Proposers</span>
        <CreatableSelect
          isMulti={true}
          onChange={(values) => setUsers(values.map(({ value }) => value))}
          defaultValue={defaults?.map((p) => ({
            value: p.toText(),
            label: p.toText(),
          }))}
        />
      </label>

      {!!inputError && <ErrorAlert>{inputError}</ErrorAlert>}
    </div>
  );
}
