import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { Command, RegisterVote } from "../../declarations/Axon/Axon.did";
import useDebounce from "../../lib/hooks/useDebounce";
import ErrorAlert from "../Labels/ErrorAlert";

export function RegisterVoteForm({
  makeCommand,
  stake,
  defaults,
}: {
  makeCommand: (cmd: Command | null) => void;
  stake?: bigint;
  defaults: RegisterVote;
}) {
  const [proposal, setProposal] = useState(
    defaults?.proposal[0] ? defaults.proposal[0].id.toString() : ""
  );
  const [vote, setVote] = useState(defaults?.vote ?? 0);
  const [error, setError] = useState("");

  const debouncedProposal = useDebounce(proposal);

  useEffect(() => {
    setError("");
    let command;
    try {
      command = {
        RegisterVote: {
          proposal: BigInt(proposal),
          vote,
        },
      };
    } catch (error) {
      setError("Invalid Proposal ID");
      return makeCommand(null);
    }

    makeCommand(command);
  }, [debouncedProposal, vote]);

  return (
    <div className="flex flex-col gap-2">
      <label className="block">
        NNS Proposal
        <input
          type="text"
          placeholder="NNS Proposal"
          className="w-full mt-1"
          value={proposal}
          onChange={(e) => setProposal(e.target.value)}
          maxLength={64}
        />
      </label>

      <label className="block">
        Vote
        <div className="flex rounded-md overflow-hidden">
          <button
            className={classNames(
              "rounded-none p-1 flex-1 text-white transition-colors",
              {
                "bg-green-500 text-white cursor-default font-bold": vote === 1,
                "bg-green-300 text-white cursor-pointer": vote !== 1,
              }
            )}
            onClick={(e) => {
              e.preventDefault();
              setVote(1);
            }}
          >
            Yes
          </button>
          <button
            className={classNames(
              "rounded-none p-1 flex-1 text-white transition-colors",
              {
                "bg-red-500 text-white cursor-default font-bold": vote === 2,
                "bg-red-300 text-white cursor-pointer": vote !== 2,
              }
            )}
            onClick={(e) => {
              e.preventDefault();
              setVote(2);
            }}
          >
            No
          </button>
        </div>
      </label>

      {!!error && <ErrorAlert>{error}</ErrorAlert>}
    </div>
  );
}
