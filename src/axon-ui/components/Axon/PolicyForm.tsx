import { Principal } from "@dfinity/principal";
import React, { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import {
  AxonCommandRequest,
  Policy,
  Threshold,
} from "../../declarations/Axon/Axon.did";
import { useInfo } from "../../lib/hooks/Axon/useInfo";
import useNames from "../../lib/hooks/useNames";
import { percentFromBigInt, percentToBigInt } from "../../lib/percents";
import { KeysOfUnion } from "../../lib/types";
import { formatNumber, shortPrincipal } from "../../lib/utils";
import ErrorAlert from "../Labels/ErrorAlert";
import { useGlobalContext } from "../Store/Store";

type ProposersKey = KeysOfUnion<Policy["proposers"]>;
type ThresholdKey = KeysOfUnion<Threshold>;

const proposersOptions: [ProposersKey, string][] = [
  ["Open", "Any token holder"],
  ["Closed", "Restricted"],
];

export function PolicyForm({
  makeCommand,
}: {
  makeCommand: (cmd: AxonCommandRequest | null) => void;
}) {
  const {
    state: { principal },
  } = useGlobalContext();
  const { data } = useInfo();
  const { principalName } = useNames();
  const [users, setUsers] = useState(
    "Closed" in data.policy.proposers
      ? data.policy.proposers.Closed.map((p) => p.toText())
      : []
  );
  const [proposers, setProposers] = useState<ProposersKey>(
    Object.keys(data.policy.proposers)[0] as ProposersKey
  );
  const [inputError, setInputError] = useState("");
  const [proposeThreshold, setProposeThreshold] = useState(
    data.policy.proposeThreshold.toString()
  );
  const [threshold, setThreshold] = useState<ThresholdKey>(
    Object.keys(data.policy.acceptanceThreshold)[0] as ThresholdKey
  );
  const [acceptanceThreshold, setAcceptanceThreshold] = useState(
    "Absolute" in data.policy.acceptanceThreshold
      ? data.policy.acceptanceThreshold.Absolute.toString()
      : String(
          percentFromBigInt(data.policy.acceptanceThreshold.Percent.percent)
        )
  );
  const [quorum, setQuorum] = useState(
    "Percent" in data.policy.acceptanceThreshold &&
      data.policy.acceptanceThreshold.Percent.quorum[0]
      ? String(
          percentFromBigInt(data.policy.acceptanceThreshold.Percent.quorum[0])
        )
      : ""
  );

  useEffect(() => {
    const proposeThresholdValue = BigInt(proposeThreshold);

    let proposersValue: Policy["proposers"];
    if (proposers === "Closed") {
      if (!users.length) {
        return makeCommand(null);
      }

      let members: Principal[];
      try {
        members = users.map((value) => Principal.fromText(value));
      } catch (err) {
        setInputError(`Invalid principal: ${err.message}`);
        return makeCommand(null);
      }
      proposersValue = {
        Closed: members,
      };
    } else {
      proposersValue = { Open: null };
    }

    const policy: Policy = {
      proposeThreshold: proposeThresholdValue,
      proposers: proposersValue,
      acceptanceThreshold:
        threshold === "Absolute"
          ? {
              Absolute: BigInt(acceptanceThreshold),
            }
          : {
              Percent: {
                percent: percentToBigInt(acceptanceThreshold),
                quorum: quorum ? [BigInt((Number(quorum) / 100) * 1e8)] : [],
              },
            },
    };
    console.log(policy);

    makeCommand({
      SetPolicy: policy,
    });
  }, [
    proposers,
    users,
    threshold,
    proposeThreshold,
    acceptanceThreshold,
    quorum,
  ]);

  const getPrincipalLabel = (value: string) =>
    principalName(value)
      ? `${principalName(value)} (${shortPrincipal(value)})`
      : value;

  // TODO: use names
  const principals = [principal.toText()].map((value) => ({
    value,
    label: getPrincipalLabel(value),
  }));

  return (
    <div className="flex flex-col gap-2">
      <label className="block">
        <span>Proposers</span>
        <select
          name="proposers"
          className="w-full mt-1"
          onChange={(e) => setProposers(e.target.value as ProposersKey)}
          value={proposers}
        >
          {proposersOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      {proposers === "Closed" && (
        <label className="block">
          <CreatableSelect
            placeholder="Select proposers..."
            isMulti={true}
            onChange={(values) => setUsers(values.map(({ value }) => value))}
            options={principals}
            defaultValue={users.map((value) => ({
              value,
              label: getPrincipalLabel(value),
            }))}
          />
        </label>
      )}

      <label className="block">
        <div className="flex justify-between">
          <span>Proposal Threshold</span>
          <span className="text-gray-400">Max {formatNumber(data.supply)}</span>
        </div>
        <input
          type="number"
          placeholder="Proposal Threshold"
          className="w-full mt-1"
          value={proposeThreshold}
          onChange={(e) => setProposeThreshold(e.target.value)}
          min={0}
          max={Number(data.supply)}
          required
        />
      </label>

      <div>
        <div className="flex justify-between">
          <span>Acceptance Threshold</span>
          {threshold === "Absolute" && (
            <span className="text-gray-400">
              Max {formatNumber(data.supply)}
            </span>
          )}
        </div>
        <div className="flex">
          <input
            type="number"
            placeholder="Acceptance Threshold"
            className="w-full mt-1"
            value={acceptanceThreshold}
            onChange={(e) => setAcceptanceThreshold(e.target.value)}
            min={0}
            max={threshold === "Absolute" ? Number(data.supply) : 100}
            required
          />

          <select
            className="w-full mt-1"
            onChange={(e) => setThreshold(e.target.value as ThresholdKey)}
            value={threshold}
          >
            {["Absolute", "Percent"].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      {threshold === "Percent" && (
        <label className="block">
          <div className="flex justify-between">
            <span>Quorum</span>
            <span className="text-gray-400">Optional</span>
          </div>
          <input
            type="number"
            placeholder="Quorum"
            className="w-full mt-1"
            value={quorum}
            onChange={(e) => setQuorum(e.target.value)}
            min={0}
            max={100}
          />
        </label>
      )}

      {!!inputError && <ErrorAlert>{inputError}</ErrorAlert>}
    </div>
  );
}
