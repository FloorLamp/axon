import React, { useState } from "react";
import { BsCheck, BsClipboard } from "react-icons/bs";
import { useClipboard } from "use-clipboard-copy";
import { useInfo } from "../../lib/hooks/Axon/useInfo";
import SyncForm from "./SyncForm";

export default function AddHotKeyForm() {
  const { data } = useInfo();
  const [neuronId, setNeuronId] = useState("");
  const dfxCommand = `dfx canister --network=ic --no-wallet call rrkah-fqaaa-aaaaa-aaaaq-cai manage_neuron "(record {id=opt (record {id=${
    neuronId || "$NEURON_ID"
  }:nat64}); command=opt (variant {Configure=(record {operation=opt (variant {AddHotKey=record {new_hot_key=opt principal \\"${
    data?.proxy
  }\\"}})})})})"`;

  const clipboard = useClipboard({
    copiedTimeout: 1000,
  });

  const handleCopy = (e) => {
    clipboard.copy(dfxCommand);
  };

  return (
    <div className="flex flex-col divide-gray-300 divide-y">
      <div className="flex flex-col gap-2 py-4">
        <label className="block">
          Add existing Neuron
          <input
            type="number"
            placeholder="Neuron ID"
            className="w-full mt-1"
            value={neuronId}
            onChange={(e) => setNeuronId(e.target.value)}
            min={0}
            required
          />
        </label>
        <p className="leading-tight">
          You can add Axon as a hot key for an existing neuron by running the
          following{" "}
          <code className="px-1 py-0.5 bg-gray-200 rounded text-xs">dfx</code>{" "}
          command:
        </p>

        <div className="group relative p-2 bg-gray-200 rounded text-xs">
          <button
            onClick={handleCopy}
            className="hidden group-hover:block absolute right-2 top-2 z-10 p-2 bg-gray-300 text-gray-800 fill-current focus:outline-none rounded border border-gray-400 border-0.5"
          >
            {clipboard.copied ? <BsCheck /> : <BsClipboard />}
          </button>
          <code>{dfxCommand}</code>
        </div>
        <p className="leading-tight">
          Then, click the button to sync Axon with the new neuron.
        </p>
      </div>

      <SyncForm />
    </div>
  );
}
