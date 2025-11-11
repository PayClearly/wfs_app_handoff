import React, { useEffect, useState } from 'react';
import Components from 'components';
import numeral from 'numeral';

export function ModalHeader({ paymentStatus, close }) {
  return (
    <div className="modal-header">
      <h4 className="modal-title" id="modalTitle">
        {`Send Payment: P_${paymentStatus._ref || ''}`}
      </h4>
      <button onClick={close} type="button" className="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  );
}

export function ModalFooter({
  close, disableClose, disableSend, markPaymentAsSent, submitText,
}) {
  return (
    <div className="modal-footer">
      <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={close} disabled={disableClose}>
        Close
      </button>
      <button
        type="button"
        className="btn btn-danger"
        data-dismiss="modal"
        onClick={markPaymentAsSent}
        disabled={disableSend}
      >
        {submitText}
      </button>
    </div>
  );
}

export function PaymentInfoHeader({
  paymentCreatedData, paymentStatusFundedData = {}, account, globalVendor, PSOPData,
}) {
  const [fundedAgo, setFundedAgo] = useState(1000);
  const [fundedAgoInterval, setFundedAgoInterval] = useState(null);

  // STOPPED HERE: Tested the UI output correctly and need to ensure the interval is working
  // as expected and stops at 5 minutes.
  const calculateFundedAgo = () => {
    const fundedAgeValue = (Date.now() - paymentStatusFundedData._at) / 1000;

    // Stop updating if greater than 300 seconds
    if (fundedAgeValue > 300) {
      clearInterval(fundedAgoInterval);
      return;
    }

    const interval = setInterval(() => {
      setFundedAgo(fundedAgeValue);
    }, 1000);
    setFundedAgoInterval(interval);
  };

  /* Note:
     If the payment has been funded, calculate the time since it was funded
     If the payment has been funded for less than 5 minutes, warning message will be displayed.
     If the payment has been funded for more than 5 minutes, stop interval and remove warning message.
     useEffect will fire on load and when paymentStatusFundedData changes
  */
  useEffect(() => {
    if (paymentStatusFundedData?._at) {
      calculateFundedAgo(paymentStatusFundedData);
    }

    return () => {
      clearInterval(fundedAgoInterval);
    };
  }, [paymentStatusFundedData._at]);

  return (
    <>
      <div className="row mb-3">
        <div className="col-12">
          <h3>
            Please perform a
            <span className="fw-bold pe-2 ps-2">{numeral(paymentCreatedData.amount).format('$0,0.00')}</span>
            payment from
            <span className="fw-bold pe-2 ps-2">{account.name}</span>
            to
            <span className="fw-bold pe-2 ps-2">{globalVendor?.name || 'Unknown'}</span>
            using group
            <span className="fw-bold ps-2">{PSOPData?.groupName || 'Unknown'}</span>
          </h3>
        </div>
      </div>
      {fundedAgo < 300 && (
        <div className="row mb-3">
          <div className="col-12">
            <div className="alert alert-warning" role="alert">
              Virtual card was created {Math.round(fundedAgo / 60) + 1} minute(s) ago and may not be ready for use.
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function LoadingScreen({ close }) {
  return (
    <div className="h-100 w-100" role="document">
      <div className="modal-content h-100 w-100">
        <div className="modal-header">
          <h4 className="modal-title" id="exampleModalLabel">Loading...</h4>
          <button onClick={close} type="button" className="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function GlobalVendorMetadata({ globalVendorId }) {
  return (
    <div className="card mb-3">
      <div className="card-header default-bg">Global Vendor Metadata</div>
      <div className="card-body">
        <Components.overviews.globalVendor globalVendorId={globalVendorId} />
      </div>
    </div>
  );
}
