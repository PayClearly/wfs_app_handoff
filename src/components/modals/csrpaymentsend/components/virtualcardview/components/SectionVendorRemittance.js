import React from 'react';
import Components from 'components';

const SectionVendorRemittance = React.memo(({
  id,
  onDrop,
  requireConfirmationNumber,
  receipts,
}) => (
  <div className="row mb-3">
    <div className="col-6">
      <div className="card w-100">
        <div className="card-header default-bg">Vendor Remittance Fields</div>
        <div className="card-body">
          <Components.dropzone
            title="Upload Receipt"
            accept="application/pdf, image/jpeg, image/png"
            instructions="Click to upload or drag and drop a supported file"
            onDrop={onDrop}
            acceptedFiles={receipts}
            fullSizeImagePreviews
          />
        </div>
      </div>
    </div>
    {requireConfirmationNumber ? (
      <div className="col-6">
        <div className="card w-100 h-100">
          <div className="card-header default-bg">Vendor Remittance Fields</div>
          <div className="card-body">
            <Components.entities.vendorRemittanceFields id={id} />
          </div>
        </div>
      </div>
    ) : null}
  </div>
));

export default SectionVendorRemittance;
