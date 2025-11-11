// @ts-check
import { Decimal } from 'decimal.js';

/**
 * @param {import('./types').GetPaymentFeeAmountsArgs} args 
 * @returns {import('./types').GetPaymentFeeAmountsResult}
 */
export default function getPaymentFeeAmounts(args) {
  const { netPaymentAmount, maxTransactionAmount, fee, requireUniqueAmounts } = args;

  let totalNetAmount = new Decimal(netPaymentAmount).toDecimalPlaces(2, Decimal.ROUND_UP);

  /**
   * If 'requireUniqueAmounts' is true, that means the vendor will not accept > 1 transaction
   * for the same amount within a certain time period. So, we need to ensure each card has a
   * unique transaction amount, while keeping the total net amount paid the same.
   */
  let uniqueAmountCounter = 0;

  /**
   * @type {{ transactionNetAmount: Decimal; transactionFeeAmount: Decimal }[]}
   */
  const transactions = [];

  /**
   * Build up transactions until the net amount is allocated.
   */
  while (totalNetAmount.toNumber() > 0) {
    let transactionNetAmount = new Decimal(0);
    let transactionFeeAmount = new Decimal(0);

    if (fee?.type === 'fixed') {
      /**
       * Set the current maximum that can be allocated by a single transaction.
       */
      let currentMaxTransactionAmount = new Decimal(
        Math.min(
          maxTransactionAmount,
          totalNetAmount.plus(fee.value).toNumber()
        )
      );

      if (requireUniqueAmounts) {
        const isLastTransaction = totalNetAmount
          .plus(fee.value)
          .lte(maxTransactionAmount);

        if (!isLastTransaction) {
          currentMaxTransactionAmount = currentMaxTransactionAmount.minus(0.01 * uniqueAmountCounter);
          uniqueAmountCounter += 1;
        }
      }

      /**
       * Get the maximum net amount that can be allocated by this transaction.
       */
      transactionNetAmount = currentMaxTransactionAmount
        .minus(fee.value);

      /**
       * Get the fee amount incurred by this transaction.
       */
      transactionFeeAmount = new Decimal(fee.value);
    } else if (fee?.type === 'percentage') {
      const percentage = new Decimal(fee.value).dividedBy(100);

      /**
       * Set the current maximum that can be allocated by a single transaction.
       */
      let currentMaxTransactionAmount = new Decimal(
        Math.min(
          maxTransactionAmount,
          totalNetAmount.times(percentage.plus(1)).toNumber()
        )
      );

      if (requireUniqueAmounts) {
        const isLastTransaction = totalNetAmount
          .times(percentage.plus(1))
          .lte(maxTransactionAmount);

        if (!isLastTransaction) {
          currentMaxTransactionAmount = currentMaxTransactionAmount.minus(0.01 * uniqueAmountCounter);
          uniqueAmountCounter += 1;
        }
      }

      /**
       * Find the _maximum_ net amount that can be handled by this transaction.
       * 
       * It's possible that transactionNetAmount is not a whole number of cents, e.g. we
       * could get 10.275 with percentage = 2.75% and currentMaxTransactionAmount = 10
       * 
       * Then, we have to round the transactionNetAmount because _this is the amount that CSRS
       * have to input into payment forms_. We must round down. If we round up, it's
       * possible that ceil(transactionNetAmount) + ceil(transactionNetAmount * percentage) > maxTransactionAmount
       * (I'm using ceil to mean "round up to the nearest cent" not to the nearest integer.)
       */
      transactionNetAmount = currentMaxTransactionAmount
        .dividedBy(percentage.plus(1))
        .toDecimalPlaces(2, Decimal.ROUND_DOWN);

      transactionFeeAmount = transactionNetAmount.times(percentage).toDecimalPlaces(2, Decimal.ROUND_UP);
    } else {
      /**
       * Set the current maximum that can be allocated by a single transaction.
       */
      let currentMaxTransactionAmount = new Decimal(
        Math.min(
          maxTransactionAmount,
          totalNetAmount.toNumber()
        )
      );

      if (requireUniqueAmounts) {
        const isLastTransaction = totalNetAmount.lte(maxTransactionAmount);

        if (!isLastTransaction) {
          currentMaxTransactionAmount = currentMaxTransactionAmount.minus(0.01 * uniqueAmountCounter);
          uniqueAmountCounter += 1;
        }
      }

      transactionNetAmount = currentMaxTransactionAmount;
    }

    transactions.push({
      transactionNetAmount,
      transactionFeeAmount,
    });

    totalNetAmount = totalNetAmount.minus(transactionNetAmount);
  }

  let totalAmount = new Decimal(0);
  let netAmount = new Decimal(0);
  let totalFeeAmount = new Decimal(0);

  /**
   * @type {{ transactionNetAmount: number; transactionFeeAmount: number; totalTransactionAmount: number  }[]}
   */
  const parsedTransactions = [];

  /**
   * Aggregate totals.
   */
  transactions.forEach(({ transactionNetAmount, transactionFeeAmount }) => {
    totalAmount = totalAmount.plus(transactionNetAmount).plus(transactionFeeAmount);
    netAmount = netAmount.plus(transactionNetAmount);
    totalFeeAmount = totalFeeAmount.plus(transactionFeeAmount);

    parsedTransactions.push({
      transactionNetAmount: transactionNetAmount.toNumber(),
      transactionFeeAmount: transactionFeeAmount.toNumber(),
      totalTransactionAmount: transactionNetAmount.plus(transactionFeeAmount).toNumber(),
    });
  });

  return {
    totalAmount: totalAmount.toNumber(),
    netAmount: netAmount.toNumber(),
    totalFeeAmount: totalFeeAmount.toNumber(),
    transactions: parsedTransactions,
  };
}
