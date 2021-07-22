import { Principal } from "@dfinity/principal";
import { DateTime } from "luxon";
import React from "react";
import { CgSpinner } from "react-icons/cg";
import { Neuron } from "../declarations/Axon/Axon.did";
import { canisterId as governanceCanisterId } from "../declarations/Governance";
import { subaccountToAccount } from "../lib/account";
import { Topic } from "../lib/governance";
import { useNeuronIds } from "../lib/hooks/useNeuronIds";
import { useNeurons } from "../lib/hooks/useNeurons";
import IdentifierLabelWithButtons from "./Buttons/IdentifierLabelWithButtons";
import BalanceLabel from "./Labels/BalanceLabel";
import { DissolveStateLabel } from "./Labels/DissolveStateLabel";
import ErrorAlert from "./Labels/ErrorAlert";
import { TimestampLabel } from "./Labels/TimestampLabel";
import ManageNeuronModal from "./ManageNeuronModal";

const governanceCanister = Principal.fromText(governanceCanisterId);

function NeuronDisplay({ neuron }: { neuron: Neuron }) {
  const controller = neuron.controller[0];
  const account = subaccountToAccount(governanceCanister, neuron.account);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col md:flex-row leading-tight">
        <div className="w-32 font-bold">Account</div>
        <div>
          <IdentifierLabelWithButtons type="Account" id={account}>
            {account}
          </IdentifierLabelWithButtons>
        </div>
      </div>
      <div className="flex flex-col md:flex-row leading-tight">
        <div className="w-32 font-bold">Controller</div>
        <div>
          <IdentifierLabelWithButtons type="Principal" id={controller}>
            {controller.toText()}
          </IdentifierLabelWithButtons>
        </div>
      </div>
      <div className="flex flex-col md:flex-row leading-tight">
        <div className="w-32 font-bold">Hot Keys</div>
        <div>
          <ul>
            {neuron.hot_keys.map((hotkey) => (
              <li key={hotkey.toText()}>
                <IdentifierLabelWithButtons type="Principal" id={hotkey}>
                  {hotkey.toText()}
                </IdentifierLabelWithButtons>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-col md:flex-row leading-tight">
        <div className="w-32 font-bold">Following</div>
        <div>
          <ul>
            {neuron.followees.map(([topic, followee]) => (
              <li key={topic} className="divide-x divide-gray-400">
                <label className="pr-2">{Topic[topic]}</label>
                <span className="pl-2">
                  {followee.followees.map((f) => f.id).join(", ")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-col md:flex-row leading-tight">
        <div className="w-32 font-bold">Created</div>
        <div>
          <TimestampLabel
            dt={DateTime.fromSeconds(Number(neuron.created_timestamp_seconds))}
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row leading-tight">
        <div className="w-32 font-bold">Aging Since</div>
        <div>
          <TimestampLabel
            dt={DateTime.fromSeconds(
              Number(neuron.aging_since_timestamp_seconds)
            )}
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row leading-tight">
        <div className="w-32 font-bold">Stake</div>
        <div>
          <BalanceLabel value={neuron.cached_neuron_stake_e8s} />
        </div>
      </div>
      <div className="flex flex-col md:flex-row leading-tight">
        <div className="w-32 font-bold">Maturity</div>
        <div>
          <BalanceLabel value={neuron.maturity_e8s_equivalent} />
        </div>
      </div>
      <div className="flex flex-col md:flex-row leading-tight">
        <div className="w-32 font-bold">State</div>
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

export default function Neurons() {
  const {
    data: neuronIds,
    isFetching: isFetchingNeuronIds,
    error: errorNeuronIds,
  } = useNeuronIds();
  const {
    data: neurons,
    isFetching: isFetchingNeurons,
    error: errorNeurons,
  } = useNeurons();

  return (
    <section className="p-4 bg-gray-50 rounded-lg shadow-lg">
      <div className="flex justify-between mb-2">
        <div className="flex gap-2 items-center">
          <h2 className="text-xl font-bold">Neurons</h2>
          {isFetchingNeuronIds && (
            <CgSpinner className="inline-block animate-spin" />
          )}
        </div>
        <ManageNeuronModal />
      </div>
      {neuronIds.length > 0 ? (
        <ul className="divide-y divide-gray-300">
          {neuronIds.map((neuronId) => {
            let display = null;
            const neuron = neurons?.full_neurons.find(
              (fn) => fn.id[0].id === neuronId
            );
            if (neuron) {
              display = <NeuronDisplay neuron={neuron} />;
            }

            return (
              <li key={neuronId.toString()} className="py-2">
                <div className="flex items-center gap-2">
                  <IdentifierLabelWithButtons
                    type="Neuron"
                    id={neuronId.toString()}
                  >
                    <strong>{neuronId.toString()}</strong>
                  </IdentifierLabelWithButtons>
                  {isFetchingNeurons && (
                    <CgSpinner className="block animate-spin" />
                  )}
                </div>
                {display}
              </li>
            );
          })}
        </ul>
      ) : (
        "None"
      )}
      {(errorNeuronIds || errorNeurons) && (
        <ErrorAlert>
          {errorNeuronIds}
          {errorNeurons}
        </ErrorAlert>
      )}
    </section>
  );
}
