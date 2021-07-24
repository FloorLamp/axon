enum TransactionType {
  TRANSACTION = "TRANSACTION",
  FEE = "FEE",
  MINT = "MINT",
  BURN = "BURN",
}

type BlockIdentifier = {
  index: number;
  hash: string;
};

type Amount = {
  value: string;
  currency: {
    symbol: string;
    decimals: number;
  };
};

export type SearchTransactionsResponse = {
  transactions: Array<{
    block_identifier: BlockIdentifier;
    transaction: {
      transaction_identifier: {
        hash: string;
      };
      operations: Array<{
        operation_identifier: {
          index: number;
        };
        type: TransactionType;
        status: "COMPLETED";
        account: {
          address: string;
        };
        amount: Amount;
      }>;
      metadata: {
        block_height: number;
        memo: string;
        timestamp: number;
      };
    };
  }>;
  total_count: number;
};
