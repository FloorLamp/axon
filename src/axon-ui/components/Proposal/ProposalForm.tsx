import React, { useState } from "react";
import { ProposalType } from "../../declarations/Axon/Axon.did";
import { useNeuronIds } from "../../lib/hooks/Axon/useNeuronIds";
import usePropose from "../../lib/hooks/Axon/usePropose";
import { ProposalOptions, ProposalTypeKey } from "../../lib/types";
import AxonCommandForm from "../Axon/AxonCommandForm";
import { ProposalOptionsForm } from "../Axon/ProposalOptionsForm";
import SpinnerButton from "../Buttons/SpinnerButton";
import NeuronCommandForm from "../Commands/NeuronCommandForm";
import ErrorAlert from "../Labels/ErrorAlert";

export default function ProposalForm({
  closeModal,
  proposalType,
  defaultNeuronIds,
}: {
  closeModal: () => void;
  proposalType: ProposalTypeKey;
  defaultNeuronIds?: string[];
}) {
  const { data } = useNeuronIds();
  const [options, setOptions] = useState<ProposalOptions>({});
  const [proposal, setProposal] = useState<ProposalType>(null);

  const { mutate, error, isError, isLoading } = usePropose(options);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (proposal) {
      mutate(proposal, {
        onSuccess: closeModal,
      });
    }
  }

  if (proposalType === "NeuronCommand" && !data?.length) {
    return (
      <p className="py-12 text-center text-gray-500 text-sm">
        No neurons to manage.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col divide-gray-300 divide-y">
        {proposalType === "AxonCommand" && (
          <AxonCommandForm setProposal={setProposal} />
        )}
        {proposalType === "NeuronCommand" && (
          <NeuronCommandForm
            setProposal={setProposal}
            defaultNeuronIds={defaultNeuronIds}
          />
        )}

        <ProposalOptionsForm onChangeOptions={setOptions} />

        <div className="flex flex-col gap-2 py-4">
          <SpinnerButton
            className="w-20 p-2"
            activeClassName="btn-cta"
            disabledClassName="btn-cta-disabled"
            isLoading={isLoading}
            isDisabled={!proposal}
          >
            Submit
          </SpinnerButton>

          {isError && <ErrorAlert>{error}</ErrorAlert>}
        </div>
      </div>
    </form>
  );
}
