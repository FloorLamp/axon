import useExecute from "../../lib/hooks/Axon/useExecute";
import SpinnerButton from "../Buttons/SpinnerButton";
import { CommandError } from "./CommandResponseSummary";

export default function ExecuteButton({
  id,
  isDisabled,
}: {
  id: bigint;
  isDisabled?: boolean;
}) {
  const { mutate, isLoading, isError, error } = useExecute();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <SpinnerButton
          className="w-20 p-2"
          isLoading={isLoading}
          isDisabled={isDisabled}
          activeClassName="btn-cta"
          disabledClassName="btn-cta-disabled"
          onClick={() => mutate({ id })}
        >
          Execute
        </SpinnerButton>
      </div>
      {isError && <CommandError label="Error">{error}</CommandError>}
    </div>
  );
}
