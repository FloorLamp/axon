import { Principal } from "@dfinity/principal";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { AxonCommandRequest } from "../../declarations/Axon/Axon.did";
import { useInfo } from "../../lib/hooks/Axon/useInfo";
import useNames from "../../lib/hooks/useNames";
import { formatNumber } from "../../lib/utils";
import ErrorAlert from "../Labels/ErrorAlert";

export function AddProposersForm({
  makeCommand,
}: {
  makeCommand: (cmd: AxonCommandRequest | null) => void;
}) {
  const { data } = useInfo();
  const [users, setUsers] = useState([]);
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
        />
      </label>

      {!!inputError && <ErrorAlert>{inputError}</ErrorAlert>}
    </div>
  );
}

export function RemoveProposersForm({
  makeCommand,
}: {
  makeCommand: (cmd: AxonCommandRequest | null) => void;
}) {
  const { principalName } = useNames();
  const { data } = useInfo();
  const [users, setUsers] = useState([]);
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
            isMulti={true}
            onChange={(values) => setUsers(values.map(({ value }) => value))}
            options={membersOptions}
          />
        </label>
      ) : (
        <p className="px-2 text-gray-500">Cannot remove the only proposer.</p>
      )}
    </div>
  );
}
