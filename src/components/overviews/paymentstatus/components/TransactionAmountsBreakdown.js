import React from 'react';
import numeral from 'numeral';

import './TransactionAmountsBreakdown.scss';

function TransactionAmountsBreakdown({ paymentStatus }) {
  const transactions = paymentStatus?.created?.transactionAmounts || [];

  if (!transactions.length) {
    return null;
  }

  const formatCurrency = (amount) => numeral(amount || 0).format('$0,0.00');

  const renderTransactionCard = (transaction, index) => {
    const {
      transactionNetAmount,
      transactionFeeAmount,
      totalTransactionAmount,
    } = transaction;

    return (
      <div
        key={`transaction-${index}`}
        className="transaction-breakdown col-4 col-md-3 mb-3"
        role="listitem"
      >
        <div className="card">
          <div className="card-header bg-light">
            <small>Transaction {index + 1} of {transactions.length}</small>
          </div>
          <div className="card-body py-2">
            <div className="d-flex justify-content-between align-items-center">
              <div><small>Net Amount:</small></div>
              <div><strong>{formatCurrency(transactionNetAmount)}</strong></div>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <div><small>Service Fee:</small></div>
              <div>
                <strong className="fee">
                  +{formatCurrency(transactionFeeAmount)}
                </strong>
              </div>
            </div>
            <hr className="my-1" />
            <div className="d-flex justify-content-between align-items-center">
              <div><small>Total:</small></div>
              <div>
                <strong className="total">
                  {formatCurrency(totalTransactionAmount)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <strong>Transaction Breakdown</strong>
      <br />
      <div
        className="row"
        role="list"
        aria-label={`${transactions.length} transaction${transactions.length !== 1 ? 's' : ''} breakdown`}
      >
        {transactions.map(renderTransactionCard)}
      </div>
    </div>
  );
}

export default TransactionAmountsBreakdown;

