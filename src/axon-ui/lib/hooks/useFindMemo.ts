import assert from "assert";
import { useQuery } from "react-query";
import { SearchTransactionsResponse } from "../rosetta";

export function useFindMemo(account: string) {
  return useQuery(
    ["account/transactions", account],
    async () => {
      const res = await fetch(
        "https://rosetta-api.internetcomputer.org/search/transactions",
        {
          body: JSON.stringify({
            network_identifier: {
              blockchain: "Internet Computer",
              network: "00000000000000020101",
            },
            account_identifier: { address: account },
          }),
          method: "POST",
          headers: {
            "content-type": "application/json;charset=UTF-8",
          },
        }
      );
      if (!res.ok) {
        throw "memo: account not found";
      }

      let text: string;
      try {
        text = await res.text();
      } catch (error) {
        throw "memo: cannot read text";
      }

      let json: SearchTransactionsResponse;
      try {
        json = JSON.parse(text.replace(/"memo":(\d+)/g, '"memo":"$1"'));
      } catch (error) {
        throw "memo: invalid json";
      }
      // First tx is the last element
      try {
        const memo = json.transactions.slice(-1)[0].transaction.metadata.memo;
        assert(memo);
        return memo;
      } catch (error) {
        throw "memo: not found";
      }
    },
    {
      staleTime: Infinity,
    }
  );
}
