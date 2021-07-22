import useExecute from "../../lib/hooks/Axon/useExecute";
import SpinnerButton from "../Buttons/SpinnerButton";
import ErrorAlert from "../Labels/ErrorAlert";

export default function ExecuteButton({
  proposalId,
  isDisabled,
}: {
  proposalId: bigint;
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
          onClick={() => mutate({ proposalId })}
        >
          Execute
        </SpinnerButton>
      </div>
      {isError && <ErrorAlert>{error}</ErrorAlert>}
    </div>
  );
}
