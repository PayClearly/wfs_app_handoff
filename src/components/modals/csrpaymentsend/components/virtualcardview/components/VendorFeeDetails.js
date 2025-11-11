import React from 'react';

const VendorFeeDetails = React.memo(({ netPayment, serviceFee, totalPayment }) => (
  <div className="mb-4">
    <div className="d-flex justify-content-between align-items-center">
      <div><span>Net Payment:&nbsp;&nbsp;</span></div>
      <div><strong>{netPayment}</strong></div>
    </div>
    <div className="d-flex justify-content-between align-items-center">
      <div><span>Service Fee:&nbsp;&nbsp;</span></div>
      <div><strong>{serviceFee}</strong></div>
    </div>
    <hr className="my-1" />
    <div className="d-flex justify-content-between align-items-center">
      <div><span>Total Payment:&nbsp;&nbsp;</span></div>
      <div><strong>{totalPayment}</strong></div>
    </div>
  </div>
));

export default VendorFeeDetails;
