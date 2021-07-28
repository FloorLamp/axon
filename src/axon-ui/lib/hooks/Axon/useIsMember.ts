import { useBalance } from "./useBalance";

export const useIsMember = () => {
  const { data: balance } = useBalance();

  return balance !== null && balance > 0;
};
