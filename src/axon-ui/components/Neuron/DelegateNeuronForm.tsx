import React, { useState } from "react";
import { BsCheck, BsClipboard } from "react-icons/bs";
import { useClipboard } from "use-clipboard-copy";
import { useNeuronIds } from "../../lib/hooks/Axon/useNeuronIds";

export default function DelegateNeuronForm() {
  const { data, isSuccess } = useNeuronIds();
  const ids = data.map((id) => `record{id=${id.toString()}:nat64}`).join("; ");
  const [neuronId, setNeuronId] = useState("");
  const dfxCommand = `dfx canister --network=ic --no-wallet call rrkah-fqaaa-aaaaa-aaaaq-cai manage_neuron "(record {id=opt (record {id=${
    neuronId || "$NEURON_ID"
  }:nat64}); command=opt (variant {Follow=record {topic=1:int32; followees=vec {${ids}}}})})"`;

  const clipboard = useClipboard({
    copiedTimeout: 1000,
  });

  const handleCopy = (e) => {
    clipboard.copy(dfxCommand);
  };

  return (
    <div className="flex flex-col divide-gray-300 divide-y">
      <div className="flex flex-col gap-2 py-4">
        <p className="leading-tight">
          You can delegate control of a neuron (such as a Genesis neuron in cold
          storage) to another neuron (in a hot wallet). The "hot" neuron can
          create NNS proposals to manage the other.
        </p>
        {isSuccess &&
          (data.length > 0 ? (
            <>
              <label className="block">
                Neuron to Delegate
                <input
                  type="number"
                  placeholder="Specify a Neuron ID..."
                  className="w-full mt-1"
                  value={neuronId}
                  onChange={(e) => setNeuronId(e.target.value)}
                  min={0}
                  required
                />
              </label>
              <p className="leading-tight">
                The following{" "}
                <code className="px-1 py-0.5 bg-gray-200 rounded text-xs">
                  dfx
                </code>{" "}
                command will delegate control of the specified neuron to Axon
                neurons:
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
                Axon will then be able to use NNS proposals to control that
                neuron.
              </p>
            </>
          ) : (
            <p className="py-12 text-center text-gray-500 text-sm">
              This Axon doesn't have any neurons yet.
              <br /> Try adding a neuron before delegating.
            </p>
          ))}
      </div>
    </div>
  );
}
