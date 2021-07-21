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
    mutate({ proposalId, acceptReject, execute: true });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <SpinnerButton
          className="w-20"
          activeClassName="text-white bg-green-500 hover:bg-green-400 transition-colors"
          isLoading={isLoading}
          onClick={() => doVote(true)}
        >
          Accept
        </SpinnerButton>
        <SpinnerButton
          className="w-20"
          activeClassName="text-white bg-red-500 hover:bg-red-400 transition-colors"
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
