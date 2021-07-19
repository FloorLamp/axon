import useVote from "../../lib/hooks/useVote";
import SpinnerButton from "../Buttons/SpinnerButton";
import ErrorAlert from "../Labels/ErrorAlert";

export default function AcceptRejectButtons({
  proposalId,
}: {
  proposalId: bigint;
}) {
  const { mutate, isLoading, isError, error } = useVote();
  const doVote = (acceptReject: boolean) => {
    mutate({ proposalId, acceptReject });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <SpinnerButton
          className="bg-green-400 w-20"
          isLoading={isLoading}
          onClick={() => doVote(true)}
        >
          Accept
        </SpinnerButton>
        <SpinnerButton
          className="bg-red-400 w-20"
          isLoading={isLoading}
          onClick={() => doVote(false)}
        >
          Reject
        </SpinnerButton>
      </div>
      {isError && <ErrorAlert>{error}</ErrorAlert>}
    </div>
  );
}
