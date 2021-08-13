import classNames from "classnames";
import React, { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useAxonById } from "../../lib/hooks/Axon/useAxonById";
import { useNeuronIds } from "../../lib/hooks/Axon/useNeuronIds";
import CodeBlockWithCopy from "../Inputs/CodeBlockWithCopy";
import { DfxCreateNeuronForm } from "./DfxCreateNeuronForm";
import SyncForm from "./SyncForm";

export default function DelegateNeuronForm() {
  const { data } = useAxonById();
  const { data: neuronIds, isSuccess } = useNeuronIds();
  const hasNeurons = isSuccess && neuronIds.length > 0;
  const ids = neuronIds
    .map((id) => `record{id=${id.toString()}:nat64}`)
    .join("; ");
  const [neuronId, setNeuronId] = useState("");
  const dfxFollowCommand = `dfx canister --network=ic --no-wallet call rrkah-fqaaa-aaaaa-aaaaq-cai manage_neuron "(record {id=opt (record {id=${
    neuronId || "$NEURON_ID"
  }:nat64}); command=opt (variant {Follow=record {topic=1:int32; followees=vec {${ids}}}})})"`;

  const dfxAddHotKeyCommand = `dfx canister --network=ic --no-wallet call rrkah-fqaaa-aaaaa-aaaaq-cai manage_neuron "(record {id=opt (record {id=${
    neuronId || "$NEURON_ID"
  }:nat64}); command=opt (variant {Configure=(record {operation=opt (variant {AddHotKey=record {new_hot_key=opt principal \\"${
    data?.proxy
  }\\"}})})})})"`;

  return (
    <div className="flex flex-col divide-gray-300 divide-y">
      <div className="flex flex-col gap-2 py-4">
        <p className="leading-tight">
          You can delegate control of a neuron (such as a Genesis neuron in cold
          storage) to another neuron (in a hot wallet). The "hot" neuron can
          create NNS proposals to manage the other.
        </p>
        <ol className="list-decimal pl-6 flex flex-col gap-2">
          <li className="pl-2">
            <p className="leading-tight">
              Create a new neuron using a Principal that can be kept "hot". Only
              the minimum ICP stake is required.
            </p>
            <DfxCreateNeuronForm />
          </li>
          <li className="pl-2">
            Add Axon as a hot key for that canister to issue commands.
            <p className="py-2 text-sm flex items-center">
              {hasNeurons ? (
                <>
                  <FaCheckCircle className="text-green-400 mr-1" />
                  Hot keys have been added.
                </>
              ) : (
                "No hot keys have been added yet."
              )}
            </p>
          </li>
          <li
            className={classNames("pl-2 transition-colors", {
              "text-gray-400": !hasNeurons,
            })}
          >
            Specify the Neuron ID you want to delegate:
            {hasNeurons && (
              <label className="block">
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
            )}
          </li>
          <li
            className={classNames("pl-2 transition-colors", {
              "text-gray-400": !hasNeurons || !neuronId,
            })}
          >
            <p className="leading-tight pb-4">
              Run the{" "}
              <code className="px-1 py-0.5 bg-gray-200 rounded text-xs">
                dfx
              </code>{" "}
              command from the Principal that controls the neuron. This will set
              it to follow your hot key for the <em>Manage Neuron</em> topic.
            </p>

            {hasNeurons && <CodeBlockWithCopy value={dfxFollowCommand} />}
          </li>
          <li
            className={classNames("pl-2 transition-colors", {
              "text-gray-400": !hasNeurons || !neuronId,
            })}
          >
            <p className="leading-tight pb-4">
              Next, run this command to add Axon as a hot key, which will allow
              you to view neuron details in the UI.
            </p>

            {hasNeurons && <CodeBlockWithCopy value={dfxAddHotKeyCommand} />}
          </li>
          <li
            className={classNames("pl-2 transition-colors", {
              "text-gray-400": !hasNeurons || !neuronId,
            })}
          >
            Click to sync Axon with the latest neuron data.
            <SyncForm
              buttonClassName={classNames("transition-colors", {
                "btn-secondary": hasNeurons && neuronId,
                "bg-gray-200 text-gray-400 cursor-not-allowed":
                  !hasNeurons || !neuronId,
              })}
            />
          </li>
          <li
            className={classNames("pl-2 transition-colors", {
              "text-gray-400": !hasNeurons || !neuronId,
            })}
          >
            Axon will then be able to use NNS proposals to control that neuron.
          </li>
        </ol>
      </div>
    </div>
  );
}
