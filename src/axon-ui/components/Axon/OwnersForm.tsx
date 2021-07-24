import { Principal } from "@dfinity/principal";
import React, { useEffect, useState } from "react";
import { AxonCommandRequest } from "../../declarations/Axon/Axon.did";
import { useInfo } from "../../lib/hooks/Axon/useInfo";
import useDebounce from "../../lib/hooks/useDebounce";
import ErrorAlert from "../Labels/ErrorAlert";

export function AddOwnerForm({
  makeCommand,
}: {
  makeCommand: (cmd: AxonCommandRequest | null) => void;
}) {
  const { data } = useInfo();
  const [user, setUser] = useState("");
  const [inputError, setInputError] = useState("");
  const [needed, setNeeded] = useState(data?.policy[0].needed.toString() ?? "");

  const debouncedUser = useDebounce(user);
  useEffect(() => {
    setInputError("");
    if (!debouncedUser) {
      return makeCommand(null);
    }

    let principal;
    try {
      principal = Principal.fromText(debouncedUser);
    } catch (err) {
      setInputError("Invalid principal");
      return makeCommand(null);
    }

    makeCommand({
      AddOwner: {
        principal,
        needed: BigInt(needed),
        total: [],
      },
    });
  }, [debouncedUser, needed]);

  const maxSigners = data?.owners.length + 1;
  const numSigners = Array.from({ length: maxSigners }).map((_, i) => i + 1);

  return (
    <>
      <div className="flex flex-col py-4 gap-2">
        <label className="block">
          <span>User</span>
          <input
            type="text"
            placeholder="User"
            className="w-full mt-1"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            maxLength={64}
          />
        </label>

        {!!inputError && <ErrorAlert>{inputError}</ErrorAlert>}

        <label className="block">
          <span>Approvers</span>
          <select
            name="approvers"
            className="w-full mt-1"
            onChange={(e) => setNeeded(e.target.value)}
            value={needed}
          >
            {numSigners.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </label>
      </div>
    </>
  );
}

export function RemoveOwnerForm({
  makeCommand,
}: {
  makeCommand: (cmd: AxonCommandRequest | null) => void;
}) {
  const { data } = useInfo();
  const [user, setUser] = useState(data?.owners[0].toText());
  const [needed, setNeeded] = useState(data?.policy[0].needed.toString() ?? "");

  useEffect(() => {
    makeCommand({
      RemoveOwner: {
        principal: Principal.fromText(user),
        needed: BigInt(needed),
        total: [],
      },
    });
  }, [user, needed]);

  const maxSigners = data?.owners.length - 1;
  const numSigners = Array.from({ length: maxSigners }).map((_, i) => i + 1);

  return (
    <>
      <div className="flex flex-col py-4 gap-2">
        <label className="block">
          <span>User</span>
          <select
            className="w-full overflow-hidden overflow-ellipsis"
            onChange={(e) => setUser(e.target.value)}
            value={user}
          >
            {data?.owners.map((owner) => {
              const principal = owner.toText();
              return (
                <option key={principal} value={principal}>
                  {principal}
                </option>
              );
            })}
          </select>
        </label>

        <label className="block">
          <span>Approvers</span>
          <select
            name="approvers"
            className="w-full mt-1"
            onChange={(e) => setNeeded(e.target.value)}
            value={needed}
          >
            {numSigners.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </label>
      </div>
    </>
  );
}
