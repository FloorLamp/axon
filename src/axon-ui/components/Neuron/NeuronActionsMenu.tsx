import React, { useState } from "react";
import { useNeuronIds } from "../../lib/hooks/Axon/useNeuronIds";
import NavButtons from "../Buttons/NavButtons";
import ProposalForm from "../Proposal/ProposalForm";
import AddHotKeyForm from "./AddHotKeyForm";
import DelegateNeuronForm from "./DelegateNeuronForm";

const ACTIONS = ["Manage", "Add Hot Key", "Delegate Neuron"] as const;

export default function NeuronActionsMenu({
  closeModal,
  defaultNeuronIds,
}: {
  closeModal: () => void;
  defaultNeuronIds?: string[];
}) {
  const { data } = useNeuronIds();
  const [action, setAction] = useState<typeof ACTIONS[number]>(
    defaultNeuronIds?.length > 0
      ? ACTIONS[0]
      : data && !data.length
      ? ACTIONS[1]
      : ACTIONS[0]
  );
  return (
    <div>
      {!(defaultNeuronIds?.length === 1) && (
        <NavButtons values={ACTIONS} selected={action} onChange={setAction} />
      )}

      {action === "Manage" && (
        <ProposalForm
          proposalType="NeuronCommand"
          closeModal={closeModal}
          defaultNeuronIds={defaultNeuronIds}
        />
      )}
      {action === "Add Hot Key" && <AddHotKeyForm />}
      {action === "Delegate Neuron" && <DelegateNeuronForm />}
    </div>
  );
}
