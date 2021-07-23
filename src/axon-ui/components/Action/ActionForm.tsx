import React, { useEffect, useState } from "react";
import useInitiate from "../../lib/hooks/Axon/useInitiate";
import { ActionOptions, ActionTypeKey } from "../../lib/types";
import { ActionOptionsForm } from "../Axon/ActionOptionsForm";
import AxonCommandForm from "../Axon/AxonCommandForm";
import SpinnerButton from "../Buttons/SpinnerButton";
import NeuronCommandForm from "../Commands/NeuronCommandForm";
import ErrorAlert from "../Labels/ErrorAlert";

export default function ActionForm({
  closeModal,
  actionType,
}: {
  closeModal: () => void;
  actionType: ActionTypeKey;
}) {
  const [options, setOptions] = useState<ActionOptions>({});
  const [action, setAction] = useState(null);

  const { mutate, error, isError, isLoading, isSuccess } = useInitiate(options);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (action) {
      mutate(action);
    }
  }

  useEffect(() => {
    if (isSuccess) {
      closeModal();
    }
  }, [isSuccess]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col divide-gray-300 divide-y">
        {actionType === "AxonCommand" && (
          <AxonCommandForm setAction={setAction} />
        )}
        {actionType === "NeuronCommand" && (
          <NeuronCommandForm setAction={setAction} />
        )}

        <ActionOptionsForm onChangeOptions={setOptions} />

        <div className="flex flex-col gap-2 py-4">
          <SpinnerButton
            className="w-20 p-2"
            activeClassName="btn-cta"
            disabledClassName="btn-cta-disabled"
            isLoading={isLoading}
            isDisabled={!action}
          >
            Submit
          </SpinnerButton>

          {isError && <ErrorAlert>{error}</ErrorAlert>}
        </div>
      </div>
    </form>
  );
}
