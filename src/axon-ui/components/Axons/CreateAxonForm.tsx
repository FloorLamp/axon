import { Principal } from "@dfinity/principal";
import classNames from "classnames";
import { useRouter } from "next/dist/client/router";
import React, { useEffect, useState } from "react";
import useCreate from "../../lib/hooks/Axons/useCreate";
import { DefaultPolicy, PolicyForm } from "../Axon/PolicyForm";
import SpinnerButton from "../Buttons/SpinnerButton";
import { LedgerInput, LedgerItem } from "../Inputs/LedgerInput";
import ErrorAlert from "../Labels/ErrorAlert";
import { useGlobalContext } from "../Store/Store";

const UserTypes: [UserType, string][] = [
  [
    "Individual User",
    "You are the sole owner of the Axon and its controlled neurons. One vote to propose and accept.",
  ],
  [
    "Multisig",
    "A small group of owners jointly manage the Axon. A minimum number of votes to accept, eg. 2 out of 3.",
  ],
  [
    "DAO",
    "A large group of token holders manage the Axon. A minimum percent of votes to accept, eg. 50% with 30% quorum.",
  ],
];
type UserType = "Individual User" | "Multisig" | "DAO";

const defaultPolicyForType = (
  type: UserType,
  principal: Principal
): DefaultPolicy => {
  switch (type) {
    case "Individual User":
      return {
        defaultProposersKey: "Closed",
        defaultProposers: [principal.toText()],
        defaultProposeThreshold: "1",
        defaultAcceptanceThreshold: "1",
      };
    case "Multisig":
      return {
        defaultProposersKey: "Open",
      };
    case "DAO":
      return {
        defaultAcceptanceThresholdKey: "Percent",
      };
  }
};

export default function CreateAxonForm() {
  const router = useRouter();
  const {
    state: { principal },
  } = useGlobalContext();
  const [userType, setUserType] = useState<UserType>();
  const [name, setName] = useState("");
  const [ledger, setLedger] = useState<LedgerItem[]>([
    {
      id: principal?.toText(),
      amount: "",
    },
  ]);
  const create = useCreate();
  const [error, setError] = useState("");
  const [policy, setPolicy] = useState(null);

  const totalSupply = ledger.reduce(
    (sum, item) => sum + (item?.amount ? BigInt(item.amount) : BigInt(0)),
    BigInt(0)
  );

  useEffect(() => {
    if (userType === "Individual User") {
      setLedger([
        {
          id: principal.toText(),
          amount: "1",
        },
      ]);
    }
  }, [userType]);

  const handleSubmit = (e) => {
    e.preventDefault();

    let ledgerEntries;
    try {
      ledgerEntries = ledger.map(({ id, amount }) => [
        Principal.fromText(id),
        BigInt(amount),
      ]);
    } catch (error) {
      setError("Invalid principal: " + error.message);
    }

    create.mutate(
      {
        ledgerEntries,
        name,
        policy,
      },
      {
        onSuccess: (data) => {
          router.push(`/axon/${data.id.toString()}`);
        },
      }
    );
  };

  return (
    <form
      className="flex flex-col divide-y divide-gray-300"
      onSubmit={handleSubmit}
    >
      <div className="pb-4">
        <h3 className="text-xl mb-2">What kind of user are you?</h3>
        <p className="text-sm leading-tight mb-4">
          This will set the default configuration, which you can modify.
        </p>
        {UserTypes.map(([value, label]) => (
          <label
            key={value}
            className={classNames(
              "flex py-2 px-4 rounded-md border border-transparent",
              {
                "bg-indigo-100 border-indigo-400": userType === value,
              }
            )}
          >
            <div className="w-6">
              <input
                type="radio"
                className="rounded-full"
                onChange={(e) => setUserType(value)}
                checked={userType === value}
              />
            </div>
            <div className="flex-1">
              <strong>{value}</strong>
              <p className="text-sm leading-tight text-gray-500">{label}</p>
            </div>
          </label>
        ))}
      </div>

      {userType && (
        <>
          <div className="py-4">
            <label className="block">
              <span className="text-xl mb-2">Name of your Axon</span>
              <input
                type="text"
                name="axon-name"
                placeholder="Name"
                className="w-full mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={64}
              />
            </label>
          </div>

          <div className="py-4">
            <label className="text-xl mb-2">Initial Ledger</label>
            <p className="text-sm leading-tight mb-4">
              Specify the principals are able to create proposals and vote.
              Voting tokens can always be transferred. Additional supply can be
              minted later through the standard proposal process.
            </p>
            <LedgerInput values={ledger} onChange={setLedger} />
          </div>

          <div className="py-4">
            <label className="text-xl mb-2">Policy</label>
            <PolicyForm
              key={userType}
              makeCommand={(command) =>
                setPolicy("SetPolicy" in command ? command.SetPolicy : null)
              }
              defaultMaxSupply={totalSupply}
              {...defaultPolicyForType(userType, principal)}
            />
          </div>

          {!!(error || create.error) && (
            <ErrorAlert>{error || create.error}</ErrorAlert>
          )}

          <div className="py-4">
            <SpinnerButton
              className="w-full p-4"
              activeClassName="btn-cta"
              disabledClassName="btn-cta-disabled"
              isLoading={create.isLoading}
              isDisabled={!name || !ledger.length || !policy}
            >
              Create
            </SpinnerButton>
          </div>
        </>
      )}
    </form>
  );
}
