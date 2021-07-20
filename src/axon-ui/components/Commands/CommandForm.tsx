import React, { ReactNode, useState } from "react";
import { Command } from "../../declarations/Axon/Axon.did";
import useProposeCommand from "../../lib/hooks/useProposeCommand";
import { stringify } from "../../lib/utils";
import SpinnerButton from "../Buttons/SpinnerButton";
import ErrorAlert from "../Labels/ErrorAlert";
import { ProposalOptionsForm } from "../ProposalOptionsForm";
import NeuronSelectionForm from "./NeuronSelectionForm";

export default function CommandForm({
  makeCommand,
  children,
}: {
  makeCommand: () => Command | null;
  children: ReactNode;
}) {
  const [neuronIds, setNeuronIds] = useState([]);
  const [options, setOptions] = useState({});
  const onChangeOptions = (opts) => setOptions(opts);

  const { mutate, error, isError, isLoading } = useProposeCommand(options);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const command = makeCommand();
    if (command) {
      mutate({
        command,
        neuronIds: neuronIds.length > 0 ? [neuronIds.map(BigInt)] : [],
      });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col divide-gray-300 divide-y">
        {children}

        <NeuronSelectionForm
          neuronIds={neuronIds}
          setNeuronIds={setNeuronIds}
        />

        <ProposalOptionsForm onChangeOptions={onChangeOptions} />

        <div className="flex flex-col gap-2 py-4">
          <div className="flex gap-2">
            <SpinnerButton className="w-20" isLoading={isLoading}>
              Submit
            </SpinnerButton>
          </div>

          {isError && (
            <ErrorAlert>
              {typeof error === "string" ? error : stringify(error)}
            </ErrorAlert>
          )}
        </div>
      </div>
    </form>
  );
}
