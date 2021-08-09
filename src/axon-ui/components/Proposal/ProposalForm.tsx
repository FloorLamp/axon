import { useRouter } from "next/dist/client/router";
import React, { useState } from "react";
import { ProposalType } from "../../declarations/Axon/Axon.did";
import { useNeuronIds } from "../../lib/hooks/Axon/useNeuronIds";
import usePropose from "../../lib/hooks/Axon/usePropose";
import useAxonId from "../../lib/hooks/useAxonId";
import { ProposalOptions, ProposalTypeKey } from "../../lib/types";
import AxonCommandForm from "../Axon/AxonCommandForm";
import { ProposalOptionsForm } from "../Axon/ProposalOptionsForm";
import SpinnerButton from "../Buttons/SpinnerButton";
import NeuronCommandForm from "../Commands/NeuronCommandForm";
import ErrorAlert from "../Labels/ErrorAlert";

export default function ProposalForm({
  closeModal,
  proposalType,
  defaultProposal,
  defaultNeuronIds,
}: {
  closeModal: () => void;
  proposalType: ProposalTypeKey;
  defaultProposal?: ProposalType;
  defaultNeuronIds?: string[];
}) {
  const router = useRouter();
  const axonId = useAxonId();
  const { data } = useNeuronIds();
  const [options, setOptions] = useState<ProposalOptions>({});
  const [proposal, setProposal] = useState<ProposalType>(null);

  const { mutate, error, isError, isLoading } = usePropose(options);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (proposal) {
      mutate(proposal, {
        onSuccess: (data) => {
          closeModal();
          router.push(`/axon/${axonId}/proposal/${data.id.toString()}`);
        },
      });
    }
  }

  const isDisabled =
    !proposal || (proposalType === "NeuronCommand" && !data?.length);

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col divide-gray-300 divide-y">
        {proposalType === "AxonCommand" && (
          <AxonCommandForm
            defaultCommand={
              defaultProposal && "AxonCommand" in defaultProposal
                ? defaultProposal.AxonCommand[0]
                : undefined
            }
            setProposal={setProposal}
          />
        )}
        {proposalType === "NeuronCommand" && (
          <NeuronCommandForm
            setProposal={setProposal}
            defaultNeuronIds={defaultNeuronIds}
            defaultCommand={
              defaultProposal && "NeuronCommand" in defaultProposal
                ? defaultProposal.NeuronCommand[0]
                : undefined
            }
          />
        )}

        <ProposalOptionsForm onChangeOptions={setOptions} />

        <div className="flex flex-col gap-2 py-4">
          <SpinnerButton
            className="w-20 p-2"
            activeClassName="btn-cta"
            disabledClassName="btn-cta-disabled"
            isLoading={isLoading}
            isDisabled={isDisabled}
          >
            Submit
          </SpinnerButton>

          {isError && <ErrorAlert>{error}</ErrorAlert>}
        </div>
      </div>
    </form>
  );
}
