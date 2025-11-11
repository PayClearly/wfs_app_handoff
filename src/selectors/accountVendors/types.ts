type GetPaymentFeeAmountsArgs = {
  netPaymentAmount: number;
  maxTransactionAmount: number;
  requireUniqueAmounts?: boolean;
  fee?: {
    type: 'fixed' | 'percentage';
    value: number;
  };
};

type GetPaymentFeeAmountsResult = {
  netAmount: number;
  totalAmount: number;
  totalFeeAmount: number;
  transactions: {
    transactionNetAmount: number;
    transactionFeeAmount: number;
    totalTransactionAmount: number;
  }[];
};

export type {
  GetPaymentFeeAmountsArgs,
  GetPaymentFeeAmountsResult,
};
