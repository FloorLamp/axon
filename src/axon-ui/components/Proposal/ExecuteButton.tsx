import useExecute from "../../lib/hooks/useExecute";
import SpinnerButton from "../Buttons/SpinnerButton";
import ErrorAlert from "../Labels/ErrorAlert";

export default function ExecuteButton({ proposalId }: { proposalId: bigint }) {
  const { mutate, isLoading, isError, error } = useExecute();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <SpinnerButton
          className="bg-indigo-200 w-20"
          isLoading={isLoading}
          onClick={() => mutate({ proposalId })}
        >
          Execute
        </SpinnerButton>
      </div>
      {isError && <ErrorAlert>{error}</ErrorAlert>}
    </div>
  );
}
