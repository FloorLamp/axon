import { useEffect } from "react";
import { useQueryClient } from "react-query";
import useAxonId from "../../lib/hooks/useAxonId";
import { useGlobalContext } from "../Store/Store";

export const Subscriptions = () => {
  const axonId = useAxonId();
  const {
    state: { isAuthed },
  } = useGlobalContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.removeQueries(["balance", axonId]);
  }, [isAuthed]);

  return null;
};
