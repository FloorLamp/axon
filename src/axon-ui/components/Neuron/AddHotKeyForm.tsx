import classNames from "classnames";
import React, { useState } from "react";
import { useAxonById } from "../../lib/hooks/Axon/useAxonById";
import CodeBlockWithCopy from "../Inputs/CodeBlockWithCopy";
import WarningAlert from "../Labels/WarningAlert";
import SyncForm from "./SyncForm";

export default function AddHotKeyForm() {
  const { data } = useAxonById();
  const [neuronId, setNeuronId] = useState("");
  const dfxCommand = `dfx canister --network=ic --no-wallet call rrkah-fqaaa-aaaaa-aaaaq-cai manage_neuron "(record {id=opt (record {id=${
    neuronId || "$NEURON_ID"
  }:nat64}); command=opt (variant {Configure=(record {operation=opt (variant {AddHotKey=record {new_hot_key=opt principal \\"${
    data?.proxy
  }\\"}})})})})"`;

  return (
    <div className="flex flex-col divide-gray-300 divide-y">
      <div className="flex flex-col gap-2 py-4">
        <p className="leading-tight">
          Add Axon as a hot key for an existing neuron to view its details. Axon
          is only able to issue <strong>Follow, Vote</strong>, and{" "}
          <strong>Make Proposal</strong> commands to hot keyed neurons.
        </p>

        <WarningAlert>
          <p className="leading-tight text-sm p-1">
            <strong>Note:</strong> At this time, neurons created in the{" "}
            <strong>NNS App</strong> cannot set their hot keys to a canister.
            This is only UI limitation.
          </p>
        </WarningAlert>
        <ol className="list-decimal pl-6 flex flex-col gap-2">
          <li className="pl-2">
            Specify the Neuron ID you want to add:
            <label className="block">
              <input
                type="text"
                placeholder="Neuron ID"
                className="w-full mt-1"
                value={neuronId}
                onChange={(e) => setNeuronId(e.target.value)}
                required
              />
            </label>
          </li>
          <li className="pl-2">
            <p className="leading-tight pb-4">
              Run the{" "}
              <code className="px-1 py-0.5 bg-gray-200 rounded text-xs">
                dfx
              </code>{" "}
              command from the Principal that controls the neuron.
            </p>

            <CodeBlockWithCopy value={dfxCommand} />
          </li>

          <li
            className={classNames("pl-2 transition-colors", {
              "text-gray-400": !neuronId,
            })}
          >
            Click to sync Axon with the latest neuron data.
            <SyncForm
              buttonClassName={classNames("transition-colors", {
                "btn-secondary": neuronId,
                "bg-gray-200 text-gray-400 cursor-not-allowed": !neuronId,
              })}
            />
          </li>
          <li
            className={classNames("pl-2 transition-colors", {
              "text-gray-400": !neuronId,
            })}
          >
            Then, you should be able to view neuron details in the Neurons list.
          </li>
        </ol>
      </div>
    </div>
  );
}
