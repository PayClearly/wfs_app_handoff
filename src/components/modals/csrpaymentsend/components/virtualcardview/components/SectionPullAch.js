import React, { useState } from 'react';
import Components from 'components';
import numeral from 'numeral';
import { api } from 'api/_util/payclearlyapi';

import VendorFeeDetails from './VendorFeeDetails';
import TransactionAmountsBreakdown from '../../../../../overviews/paymentstatus/components/TransactionAmountsBreakdown';

function SectionPullAch({
  paymentStatus,
  organizationId,
  accountId,
  achNotes = '',
  markedAsSent = false,
}) {
  const paymentAmount = paymentStatus.created.amount;
  const paymentStatusRevisedAmount = paymentStatus.sent?.revisedPaymentAmount || paymentAmount;

  const bankAccount = paymentStatus.funded.pullAchAccountId || '';
  const routingNumber = paymentStatus.funded.pullAchRoutingNumber || '';

  const [isEditing, setIsEditing] = useState(false);
  const [revisedAmount, setRevisedAmount] = useState(paymentStatusRevisedAmount);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditToggle = (bool) => {
    setIsEditing(bool);
    setError('');
  };

  const handleAmountChange = (e) => {
    const { value } = e.target;

    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setRevisedAmount(value === '' ? 0 : parseFloat(value));
      setError('');
    }
  };

  const handleSave = async () => {
    if (!revisedAmount || Number.isNaN(revisedAmount) || revisedAmount <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    if (revisedAmount > paymentAmount) {
      setError('Revised amount cannot be greater than the original payment amount.');
      return;
    }

    setIsSubmitting(true);

    api().patch(
      `/paymentstatuses/${organizationId}/${accountId}/${paymentStatus._id}/sent/revisePaymentAmount`,
      { revisedPaymentAmount: revisedAmount }
    ).then(() => {
      setIsEditing(false);
      setIsSubmitting(false);
    }).catch(() => {
      setError('Error updating payment amount. Please try again.');
      setIsSubmitting(false);

    });
  };

  /**
   * TODO: PAY-1380
   *
   * Add form inputs for updating the fee amount and fee type.
   * Add ability to update the fee amount and fee type on the backend.
   *
   * Warning: this will not recalculate the fees when amount paid is changed
   */
  const revisedPaymentAmount = paymentStatus?.created?.revisedPaymentAmount;
  const vendorFee = paymentStatus?.created?.fee;
  const netPayment = paymentStatus?.created?.netAmount || 0;
  const totalPayment = paymentStatus?.created?.amount || 0;
  const shouldDisplayRevisedPaymentAmountWarning = revisedPaymentAmount
    && vendorFee;

  return (
    <div className="w-100">
      <div className="card">
        <div className={'card-header default-bg'}>Echeck Details</div>
        <div className={'card-body'}>
          <strong>Routing Number:</strong>
          <br />
          <Components.clicktocopytextwrapper
            value={routingNumber}
            showTooltip
          >
            <p>{routingNumber}</p>
          </Components.clicktocopytextwrapper>
          <strong>Bank Account Number:</strong>
          <br />
          <Components.clicktocopytextwrapper
            value={bankAccount}
            showTooltip
          >
            <p>{bankAccount}</p>
          </Components.clicktocopytextwrapper>
          <strong>Ach Notes:</strong>
          <p className="multi-lined-text">{achNotes}</p>
          <strong>Payment Amount:</strong>
          <div className="d-flex align-items-center">
            <p className="mb-0 mr-2">${paymentAmount.toFixed(2)}</p>
          </div>
          <div className="mt-2" style={{ maxWidth: '200px' }}>
            {
              vendorFee && (
                <VendorFeeDetails
                  netPayment={numeral(netPayment).format('$0.00')}
                  serviceFee={numeral(vendorFee).format('$0.00')}
                  totalPayment={numeral(totalPayment).format('$0.00')}
                />
              )
            }
            {
              shouldDisplayRevisedPaymentAmountWarning && (
                <p>
                  Warning! The amount for this payment has changed. If the
                  vendor charges a fee, then fee amount above might not
                  be incorrect.
                </p>
              )
            }
          </div>
          <TransactionAmountsBreakdown paymentStatus={paymentStatus} />
          <strong>Actual Payment Amount Submitted:</strong>
          <div className="d-flex align-items-center">
            {isEditing ? (
              <div>
                <div className="input-group mb-2">
                  <div className="input-group-prepend">
                    <span className="input-group-text">$</span>
                  </div>
                  <input
                    type="text"
                    className={`form-control ${error ? 'is-invalid' : ''}`}
                    value={revisedAmount}
                    onChange={handleAmountChange}
                    placeholder="Enter amount"
                    disabled={isSubmitting}
                  />
                  <div className="input-group-append">
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={handleSave}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleEditToggle(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <Components.tooltip className="d-inline ms-2">
                      <i className="mdi mdi-help-circle-outline" />
                      <p>Amount can only be decreased, not increased.</p>
                    </Components.tooltip>
                  </div>
                </div>
                {error && <div className="text-danger">{error}</div>}
              </div>
            ) : (
              <>
                <p className="mb-0 mr-2">${revisedAmount.toFixed(2)}</p>
                {!markedAsSent
                  && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary border-0"
                      onClick={() => handleEditToggle(true)}
                      title="Edit payment amount"
                      aria-label="Edit payment amount"
                    >
                      <span className="edit-pencil" aria-hidden="true">
                        <i className="mdi mdi-pencil" />
                      </span>
                    </button>
                  )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SectionPullAch;
