import React from 'react';
import Components from 'components';
import numeral from 'numeral';

const _formatOptionName = (option) => {
  const optionsMap = {
    name: 'Account Name',
    contactName: 'Contact Name',
    vendorId: 'Vendor Name',
  };

  return optionsMap[option] || option;
};

const preparePaymentAutomationInformation = (
  previousInitialData,
  previousFieldOptions,
  dataStructures,
  paymentStatus,
  stateVendorCredentials,
  params = {}
) => {

  const initialData = { ...previousInitialData };
  const fieldOptions = { ...previousFieldOptions };
  const paymentCreatedData = paymentStatus.created;
  const vendorCredentials = (
    Object.keys(stateVendorCredentials).length
    && stateVendorCredentials)
    || _try(() => paymentStatus.verified.vendorCredentials || {});

  const { standardCredentialFields } = params;

  dataStructures.forEach((structure) => {
    const newData = structure.data;
    const { prependString } = structure;

    const formattedNewOptions = Object.keys(newData).reduce((result, option) => {
      if (newData[option] !== null && typeof newData[option] === 'object') {
        const subOptions = Object.keys(newData[option]);
        if (subOptions) {
          subOptions.forEach((subOption) => {
            const formattedOptionName = _formatOptionName(subOption);
            const key = `${prependString}:${formattedOptionName}`;
            if (newData[option][subOption].length) { result.push(key); }

            // format data for initial data object
            initialData[key] = newData[option][subOption];
          });
        }
      } else if (newData[option] && !(option.split('_').length > 1)) {

        const formattedOptionName = _formatOptionName(option);
        const key = `${prependString}:${formattedOptionName}`;
        result.push(key);

        // format data for initial data object
        initialData[key] = newData[option];
      }
      return result;
    }, []);

    fieldOptions[prependString] = formattedNewOptions;
  });

  const todayDate = new Date();

  // override existing values
  initialData['Payment Information:amount'] = numeral(initialData['Payment Information:amount']).format('$0,0.00');
  initialData['Payment Information:Vendor Name'] = paymentStatus.verified.vendor.name;

  // build out general items
  initialData.todayDate = `${todayDate.getMonth() + 1}-${todayDate.getDate()}-${todayDate.getFullYear()}`;
  initialData.checkbox = 'x';
  initialData.pcNumber = 'CHANGE_ME';
  initialData.pcEmail = 'CHANGE_ME';
  initialData.pcName = 'WFS';

  // add new values
  fieldOptions['Payment Information'].push('Payment Information:Business Name');
  initialData['Payment Information:Business Name'] = initialData['Payment Information:Agency Name']
    || initialData['Payer Information:Account Name'];

  fieldOptions['Payer Information'].push('Payer Information:City, State Zip');
  initialData['Payer Information:City, State Zip'] = `${initialData['Payer Information:city']}, `
    + `${initialData['Payer Information:state']} ${initialData['Payer Information:zipCode']}`;

  fieldOptions['Payment Information'].push('Payment Information:Copy/Paste Memo');
  initialData['Payment Information:Copy/Paste Memo'] = Object.keys(paymentCreatedData.paymentFields || {})
    .map((key, index) => `${paymentCreatedData.paymentFields[key]}`
      + `${Object.keys(paymentCreatedData.paymentFields).length - 1 > index && paymentCreatedData.paymentFields[key]
        ? ', '
        : ''
      }`).join('');

  fieldOptions['Payment Information'].push('Payment Information:Amount - No $');
  initialData['Payment Information:Amount - No $'] = numeral(initialData['Payment Information:amount'])
    .format('0,0.00');

  fieldOptions['Payment Information'].push('Payment Information:Amount - less fee');
  initialData['Payment Information:Amount - less fee'] = numeral(
    numeral(initialData['Payment Information:amount']).format('00.00') - (paymentStatus.created.fee || 0)
  ).format('00.00');

  Object.keys(vendorCredentials || {})
    .forEach((key) => {
      fieldOptions['Payment Information'].push(`Payment Information: Creds - ${standardCredentialFields[key].key}`);
      initialData[`Payment Information: Creds - ${standardCredentialFields[key].key}`] = `${vendorCredentials[key]}`;
    });

  return { initialData, fieldOptions };
};

function SectionPaymentForm({
  account,
  attachedPaymentForms,
  downloadAttachment,
  globalVendorMetadata,
  hideFormBuilder,
  id,
  onLoadDirectlyIntoLoader,
  onPaymentFormDrop,
  paymentFormLoading,
  paymentStatus,
  privateVirtualCard,
  removeAttachedPaymentForm,
  setAttachedPaymentForms,
  setHideFormBuilder,
  standardCredentialFields,
  vCardPaymentForm,
  vendorCredentials,
}) {

  const renderFormBuilder = () => {
    const dataToParse = [
      { data: account, prependString: 'Payer Information' },
      { data: paymentStatus.created, prependString: 'Payment Information' },
      { data: globalVendorMetadata, prependString: 'Global Vendor Metadata' },
    ];

    if (!privateVirtualCard.status.fetched) {
      return null;
    }

    const virtualCardInfo = paymentStatus.funded.vCards?.map((card, index) => {
      const cardData = { ...privateVirtualCard.data.items[card.id] };
      cardData['Expiration Date - Formatted'] = `${cardData.cardExpirationMonth} / ${cardData.cardExpirationYear}`;
      cardData['Expiration YEAR - YY'] = `${cardData.cardExpirationYear}`.slice(-2);
      cardData['Card Amount - Formatted'] = numeral(card.amount).format('$0,0.00');
      cardData['Card Amount'] = card.amount;

      return { data: cardData, prependString: `Card #${index + 1} ` };
    });

    if (virtualCardInfo) { dataToParse.push(...virtualCardInfo); }

    const overlayInformation = preparePaymentAutomationInformation(
      {},
      {},
      dataToParse,
      paymentStatus,
      vendorCredentials,
      { standardCredentialFields }
    );

    return (
      <div className="card-body" style={{ minHeight: '200px' }}>
        <Components.automation.pdfoverlayeditor
          attachment={vCardPaymentForm}
          initialData={overlayInformation.initialData}
          fieldOptions={overlayInformation.fieldOptions}
          loadPDF={onLoadDirectlyIntoLoader}
        />
      </div>
    );
  };

  const renderUploadCompletedForm = () => (
    <div className="col-12">
      <div className="card m-0">
        <div className="card-header default-bg">
          Upload Completed Payment Form
        </div>
        <div className="card-body">
          {!paymentFormLoading && (
            <Components.dropzone
              accept="application/pdf, image/jpeg, image/png"
              instructions="Click to upload or drag and drop the completed payment form."
              onDrop={onPaymentFormDrop}
              acceptedFiles={attachedPaymentForms}
            />
          )}
          {paymentFormLoading && (
            <div className="d-flex justify-content-center">
              <Components.spinner />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="row mb-3 card-deck">
      <div className="col-12 mb-3">
        {paymentStatus.sent && !paymentStatus.sent.attachedPaymentForm && !hideFormBuilder && (
          <div className="card m-0">
            <div className="card-header default-bg">
              Form Overlay Builder
              <button
                type="button"
                className="btn btn-primary float-end"
                onClick={() => setHideFormBuilder(true)}
              >
                Switch To Download
              </button>
            </div>
            {renderFormBuilder()}
          </div>
        )}
        {hideFormBuilder && (
          <div className="card m-0">
            <div className="card-header default-bg">
              Download File
              <button
                type="button"
                className="btn btn-primary float-end"
                onClick={() => setHideFormBuilder(false)}
              >
                Switch To Form Builder
              </button>
            </div>
            <Components.attachments attachments={[vCardPaymentForm]} handleDownload={downloadAttachment} />
          </div>
        )}
      </div>

      {paymentStatus.sent && paymentStatus.sent.attachedPaymentForm ? (
        <div className="col-12">
          <Components.attachments
            attachments={[paymentStatus.sent.attachedPaymentForm]}
            handleRemove={() => {
              removeAttachedPaymentForm(id);
              setAttachedPaymentForms([]);
            }}
            removeText="Unlock"
            lockIcon
            cardHeader="Uploaded Payment Form"
          />
        </div>
      ) : (
        renderUploadCompletedForm()
      )}
    </div>

  );
}

export default SectionPaymentForm;
