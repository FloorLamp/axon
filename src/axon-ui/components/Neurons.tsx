import { Principal } from "@dfinity/principal";
import { DateTime } from "luxon";
import React, { useEffect, useState } from "react";
import { FiExternalLink } from "react-icons/fi";
import { GovernanceError, Neuron } from "../../declarations/Axon/Axon.did";
import { subaccountToAccount } from "../lib/account";
import { errorToString, governanceErrorToString } from "../lib/utils";
import BalanceLabel from "./BalanceLabel";
import { DissolveStateLabel } from "./DissolveStateLabel";
import RegisterForm from "./RegisterForm";
import { TimestampLabel } from "./TimestampLabel";

const governanceCanister = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");

function NeuronDisplay({ neuron }: { neuron: Neuron }) {
  const controller = neuron.controller[0];
  const account = subaccountToAccount(governanceCanister, neuron.account);
  console.log(neuron);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col sm:flex-row leading-tight">
        <div className="w-32 font-medium">Account</div>
        <div>
          <a
            target="_blank"
            className="inline-flex gap-1 items-center underline text-xs"
            href={`https://ic.rocks/account/${account}`}
          >
            {account}
            <FiExternalLink />
          </a>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row leading-tight">
        <div className="w-32 font-medium">Controller</div>
        <div>
          <a
            target="_blank"
            className="inline-flex gap-1 items-center underline text-xs"
            href={`https://ic.rocks/principal/${controller.toText()}`}
          >
            {controller.toText()}
            <FiExternalLink />
          </a>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row leading-tight">
        <div className="w-32 font-medium">Hot Keys</div>
        <div>
          <ul>
            {neuron.hot_keys.map((hotkey) => (
              <li key={hotkey.toText()}>
                <a
                  target="_blank"
                  className="inline-flex gap-1 items-center underline text-xs"
                  href={`https://ic.rocks/principal/${hotkey.toText()}`}
                >
                  {hotkey.toText()}
                  <FiExternalLink />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row leading-tight">
        <div className="w-32 font-medium">Followees</div>
        <div>
          <ul>
            {neuron.followees.map(([topic, followee]) => (
              <li key={topic} className="divide-x divide-gray-400">
                <label className="pr-2">{topic}</label>
                <span className="pl-2">
                  {followee.followees.map((f) => f.id).join(", ")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row leading-tight">
        <div className="w-32 font-medium">Created</div>
        <div>
          <TimestampLabel
            dt={DateTime.fromSeconds(Number(neuron.created_timestamp_seconds))}
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row leading-tight">
        <div className="w-32 font-medium">Aging Since</div>
        <div>
          <TimestampLabel
            dt={DateTime.fromSeconds(
              Number(neuron.aging_since_timestamp_seconds)
            )}
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row leading-tight">
        <div className="w-32 font-medium">Stake</div>
        <div>
          <BalanceLabel value={neuron.cached_neuron_stake_e8s} />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row leading-tight">
        <div className="w-32 font-medium">Maturity</div>
        <div>
          <BalanceLabel value={neuron.maturity_e8s_equivalent} />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row leading-tight">
        <div className="w-32 font-medium">State</div>
        <div>
          {neuron.dissolve_state[0] ? (
            <DissolveStateLabel state={neuron.dissolve_state[0]} />
          ) : (
            "-"
          )}
        </div>
      </div>
    </div>
  );
}

export default function Neurons({ axon, isAuthed }) {
  const [neuronIds, setNeuronIds] = useState<bigint[]>([]);
  const [neurons, setNeurons] = useState<(Neuron | GovernanceError)[]>(null);
  const [error, setError] = useState("");

  const fetchData = async () => {
    const neuronIds = await axon.getNeuronIds();
    setNeuronIds(neuronIds);
    const neurons = await axon.neurons();
    if ("ok" in neurons) {
      const neuronsOrErrors = neurons.ok.map(([res], i) =>
        "Ok" in res ? res.Ok : res.Err
      );
      setNeurons(neuronsOrErrors);
    } else {
      setError(errorToString(neurons.err));
    }
  };

  useEffect(() => {
    fetchData();
  }, [axon]);

  return (
    <section className="p-4 bg-gray-50 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-2">Neurons</h2>
      {neuronIds ? (
        neuronIds.length > 0 ? (
          <ul className="divide-y divide-gray-500">
            {neuronIds.map((n, i) => {
              let display = null;
              if (neurons && neurons[i]) {
                if ("id" in neurons[i]) {
                  display = <NeuronDisplay neuron={neurons[i] as Neuron} />;
                } else {
                  display = governanceErrorToString(
                    neurons[i] as GovernanceError
                  );
                }
              }

              return (
                <li key={n.toString()}>
                  <strong>{n.toString()}</strong>
                  {display}
                </li>
              );
            })}
          </ul>
        ) : (
          "None"
        )
      ) : (
        "Loading..."
      )}
      {error}
      {isAuthed && <RegisterForm axon={axon} refresh={fetchData} />}
    </section>
  );
}
