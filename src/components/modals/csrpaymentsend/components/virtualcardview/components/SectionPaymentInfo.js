import React from 'react';
import Components from 'components';

function _formatKey(str) {
  // split a camelCase string, capitalize the first letter of each word and join on a space
  // billingPostalCode -> Billing Postal Code
  return str.split(/(?=[A-Z])/).map((word) => `${word[0].toUpperCase()}${word.slice(1)}`).join(' ');
}

function CredentialFields({ vendorCredentials, standardCredentialFields }) {
  if (!vendorCredentials || !standardCredentialFields) {
    return null;
  }

  return (
    <>
      <h3>Credential Fields</h3>
      <h5 className="mt-2">Standard Credential Field Map</h5>
      {Object.keys(standardCredentialFields || {}).map((key) => (vendorCredentials[key] && (
        <div key={key}>
          {standardCredentialFields[key]?.key || 'Unknown'}&nbsp;|&nbsp;{standardCredentialFields[key]?.name || key}:
          <br />
          <Components.clicktocopytextwrapper value={vendorCredentials[key]} showTooltip>
            <p>{vendorCredentials[key]}</p>
          </Components.clicktocopytextwrapper>
        </div>
      )))}
    </>
  );
}

function PasswordManagerFields({ privateCredentials, privateCredentialsStatus }) {
  return privateCredentialsStatus.fetched ? (
    Object.keys(privateCredentials.fields || {}).map((key) => (
      <div key={key}>
        <strong>{_formatKey(key)}:</strong>
        <br />
        <Components.clicktocopytextwrapper value={privateCredentials.fields[key]} showTooltip>
          <p>{privateCredentials.fields[key] || 'not provided'}</p>
        </Components.clicktocopytextwrapper>
      </div>
    ))
  ) : (
    <p>Loading...</p>
  );
}

function PaymentFields({ paymentFields }) {
  return (
    <>
      <h3>Payment Fields</h3>
      {Object.keys(paymentFields || {}).map(
        (key) => typeof paymentFields[key] === 'string' && (
          <div key={key}>
            <strong>{key}:</strong>
            <br />
            <Components.clicktocopytextwrapper value={paymentFields[key]} showTooltip>
              <p>{paymentFields[key]}</p>
            </Components.clicktocopytextwrapper>
          </div>
        )
      )}
    </>
  );
}

function ClientInfo({
  clientsData, clientsCollections, clientId, clientsStatus,
}) {
  return clientsStatus.fetched ? (
    <div>
      <strong>Name</strong>
      <br />
      <p>{clientsData[clientsCollections?._ids[clientId]?.[0]]?.display || 'Invalid Client'}</p>
    </div>
  ) : (
    <p>Loading...</p>
  );
}

const SectionPaymentInfo = React.memo(({
  paymentCreatedData,
  clientsStatus,
  clientsData,
  clientsCollections,
  paymentPipelinePreferences,
  privateCredentials,
  privateCredentialsStatus,
  vendorCredentials,
  standardCredentialFields,
}) => (
  <div className="row mb-3">
    <div className="col-12">
      <div className="card">
        <div className="card-header default-bg">Payment Information</div>
        <div className="card-body">
          <div className="row">
            {paymentCreatedData.clientId && (
              <div className="col-4">
                <h3>Client</h3>
                <ClientInfo
                  clientsData={clientsData}
                  clientsCollections={clientsCollections}
                  clientId={paymentCreatedData.clientId}
                  clientsStatus={clientsStatus}
                />
              </div>
            )}
            <div className="col-4">
              {paymentPipelinePreferences.passwordManager && (
                <>
                  <h3>Password Manager Fields</h3>
                  <PasswordManagerFields
                    privateCredentials={privateCredentials}
                    privateCredentialsStatus={privateCredentialsStatus}
                  />
                </>
              )}
              <PaymentFields paymentFields={paymentCreatedData.paymentFields} />
              <h3>Memo</h3>
              <p>
                {Object.keys(paymentCreatedData.paymentFields || {})
                  .map((key, index) => `${paymentCreatedData.paymentFields[key]}`
                    + `${Object.keys(paymentCreatedData.paymentFields).length - 1 > index ? ', ' : ''}`)
                  .join('')}
              </p>
            </div>
            <div className="col-4">
              <CredentialFields
                vendorCredentials={vendorCredentials}
                standardCredentialFields={standardCredentialFields}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
));

export default SectionPaymentInfo;
