import { Principal } from "@dfinity/principal";
import React, { useEffect, useState } from "react";
import { BiInfoCircle } from "react-icons/bi";
import CreatableSelect from "react-select/creatable";
import {
  AxonCommandRequest,
  Policy,
  Threshold,
} from "../../declarations/Axon/Axon.did";
import { useAxonById } from "../../lib/hooks/Axon/useAxonById";
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

export function PolicyFormWithDefaults({
  makeCommand,
  defaults,
}: {
  makeCommand: (cmd: AxonCommandRequest | null) => void;
  defaults?: Policy;
}) {
  const { data } = useAxonById();
  const policy = defaults ?? data?.policy;

  if (policy) {
    return (
      <PolicyForm
        makeCommand={makeCommand}
        defaultMaxSupply={data.supply}
        defaultProposersKey={Object.keys(policy.proposers)[0] as ProposersKey}
        defaultProposers={
          "Closed" in policy.proposers
            ? policy.proposers.Closed.map((p) => p.toText())
            : []
        }
        defaultProposeThreshold={policy.proposeThreshold.toString()}
        defaultAcceptanceThresholdKey={
          Object.keys(policy.acceptanceThreshold)[0] as ThresholdKey
        }
        defaultAcceptanceThreshold={
          "Absolute" in policy.acceptanceThreshold
            ? policy.acceptanceThreshold.Absolute.toString()
            : String(
                percentFromBigInt(policy.acceptanceThreshold.Percent.percent)
              )
        }
        defaultQuorum={
          "Percent" in policy.acceptanceThreshold &&
          policy.acceptanceThreshold.Percent.quorum[0]
            ? String(
                percentFromBigInt(policy.acceptanceThreshold.Percent.quorum[0])
              )
            : ""
        }
      />
    );
  }

  return <PolicyForm makeCommand={makeCommand} />;
}

export type DefaultPolicy = {
  defaultProposersKey?: ProposersKey;
  defaultProposers?: string[];
  defaultProposeThreshold?: string;
  defaultAcceptanceThresholdKey?: ThresholdKey;
  defaultAcceptanceThreshold?: string;
  defaultQuorum?: string;
  defaultMaxSupply?: bigint;
};

export function PolicyForm({
  makeCommand,
  defaultProposersKey = "Open",
  defaultProposers = [],
  defaultProposeThreshold = "",
  defaultAcceptanceThresholdKey = "Absolute",
  defaultAcceptanceThreshold = "",
  defaultQuorum = "",
  defaultMaxSupply,
}: {
  makeCommand: (cmd: AxonCommandRequest | null) => void;
} & DefaultPolicy) {
  const {
    state: { principal },
  } = useGlobalContext();
  const { principalName } = useNames();
  const [users, setUsers] = useState(defaultProposers);
  const [proposers, setProposers] = useState<ProposersKey>(defaultProposersKey);
  const [inputError, setInputError] = useState("");
  const [proposeThreshold, setProposeThreshold] = useState(
    defaultProposeThreshold
  );
  const [threshold, setThreshold] = useState<ThresholdKey>(
    defaultAcceptanceThresholdKey
  );
  const [acceptanceThreshold, setAcceptanceThreshold] = useState(
    defaultAcceptanceThreshold
  );
  const [quorum, setQuorum] = useState(defaultQuorum);

  useEffect(() => {
    setInputError("");

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

    let policy: Policy;
    try {
      policy = {
        proposeThreshold: proposeThreshold
          ? BigInt(proposeThreshold)
          : BigInt(0),
        proposers: proposersValue,
        acceptanceThreshold:
          threshold === "Absolute"
            ? {
                Absolute: BigInt(acceptanceThreshold),
              }
            : {
                Percent: {
                  percent: percentToBigInt(acceptanceThreshold),
                  quorum: quorum ? [BigInt(Number(quorum) * 1e6)] : [],
                },
              },
      };
    } catch (error) {
      setInputError(error.message);
      return makeCommand(null);
    }
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
      <p className="text-sm leading-tight">
        Set the parameters for creating and accepting proposals.
      </p>

      <label className="block">
        <span className="flex items-center">
          Proposer Eligibility
          <span
            aria-label="Who is eligible to create proposals"
            data-balloon-pos="right"
            data-balloon-length="large"
          >
            <BiInfoCircle className="ml-1 text-gray-500 cursor-help" />
          </span>
        </span>
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
          <span className="flex items-center">
            Proposer Balance Requirement
            <span
              aria-label="Minimum token balance required to create a proposal. Proposer must have nonzero token balance regardless of this minimum"
              data-balloon-pos="right"
              data-balloon-length="large"
            >
              <BiInfoCircle className="ml-1 text-gray-500 cursor-help" />
            </span>
          </span>
          {defaultMaxSupply && (
            <span className="text-gray-400">
              Max {formatNumber(defaultMaxSupply)}
            </span>
          )}
        </div>
        <input
          type="number"
          placeholder="Proposer Balance Requirement"
          className="w-full mt-1"
          value={proposeThreshold}
          onChange={(e) => setProposeThreshold(e.target.value)}
          min={0}
          max={defaultMaxSupply ? Number(defaultMaxSupply) : undefined}
        />
      </label>

      <div>
        <div className="flex justify-between">
          <span className="flex items-center">
            Acceptance Threshold
            <span
              aria-label="Percentage or absolute number of votes required to accept a proposal"
              data-balloon-pos="right"
              data-balloon-length="large"
            >
              <BiInfoCircle className="ml-1 text-gray-500 cursor-help" />
            </span>
          </span>
          {threshold === "Absolute" && defaultMaxSupply && (
            <span className="text-gray-400">
              Max {formatNumber(defaultMaxSupply)}
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
            max={
              threshold === "Absolute"
                ? defaultMaxSupply
                  ? Number(defaultMaxSupply)
                  : undefined
                : 100
            }
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
            <span className="flex items-center">
              Quorum
              <span
                aria-label="Minimum percentage of votes that must participate before a proposal is accepted"
                data-balloon-pos="right"
                data-balloon-length="large"
              >
                <BiInfoCircle className="ml-1 text-gray-500 cursor-help" />
              </span>
            </span>
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
