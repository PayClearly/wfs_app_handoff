import React from 'react';

const renderSection = (label, value, condition = true) => (condition && value ? (
  <>
    <strong>{label}:</strong> {value}
    <br />
  </>
) : null);

const SectionPSOP = React.memo(({
  paymentProcedure,
  paymentStatus,
  globalVendorId,
}) => (
  <div className="card">
    <div className="card-header default-bg">Notes about how to pay this vendor</div>
    <div className="card-body">
      {
        !globalVendorId && (
          <div className="alert alert-danger" role="alert">
            This payment does not have a linked global vendor.
            Please link the global vendor before proceeding.
          </div>
        )

      }
      {
        Object.keys(paymentProcedure).length === 0 && globalVendorId ? (
          <div className="alert alert-danger" role="alert">
            This Group does not have a payment procedure defined for this payment method.
            Please add payment procedure instructions to this group via the Global Database.
          </div>
        ) : globalVendorId && (
          <>
            {renderSection('Delivery Method', paymentProcedure.vCardDeliveryMethod || 'Unknown')}
            {renderSection('Vendor Details', 'Charges Service Fee', paymentStatus.created?.fee)}
            {renderSection(
              'Fax Numbers',
              paymentProcedure.vCardFaxNumbers?.join(', '),
              paymentProcedure.vCardFaxNumbers?.length
            )}
            {renderSection(
              'Using Fax Template',
              paymentProcedure.vCardUseFaxTemplate ? 'True' : 'False',
              paymentProcedure.vCardFaxNumbers?.length
            )}
            {renderSection(
              'Email Address',
              paymentProcedure.vCardEmails?.join(', '),
              paymentProcedure.vCardEmails?.length
            )}
            {renderSection(
              'Email CC Address',
              paymentProcedure.vCardCCEmails?.join(', '),
              paymentProcedure.vCardCCEmails?.length
            )}
            {renderSection(
              'Using Email Template',
              'True',
              paymentProcedure.vCardUseEmailTemplate
            )}
            {paymentProcedure.notes && (
              <>
                <strong>Notes:</strong>
                <br />
                <p className="multi-lined-text mb-3">{paymentProcedure.notes}</p>
              </>
            )}
          </>
        )
      }
    </div>
  </div>
));

export default SectionPSOP;
