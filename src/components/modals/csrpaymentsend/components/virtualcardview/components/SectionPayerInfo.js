import React from 'react';
import Components from 'components';

function AccountInfo({ label, value }) {
  return (
    <div>
      <strong>{label}</strong>
      <br />
      <Components.clicktocopytextwrapper value={value} showTooltip>
        <p>{value}</p>
      </Components.clicktocopytextwrapper>
    </div>
  );
}

function AccountAddress({ address }) {
  return (
    <div>
      <strong>Account Address</strong>
      <br />
      <Components.overviews.address address={address} clickToCopy />
    </div>
  );
}

const SectionPayerInfo = React.memo(({ account }) => (
  <div className="card mt-4">
    <div className="card-header default-bg">Payer Information</div>
    <div className="card-body">
      <AccountInfo label="Account Name:" value={account.name} />
      <AccountInfo label={`Contact Name: ${account.contactName}`} value={account.contactName} />
      <AccountInfo label="Contact Email:" value={account.contactEmail} />
      <AccountInfo label="Contact Phone:" value={account.contactPhoneNumber} />
      <AccountAddress address={account.address} />
    </div>
  </div>
));

export default SectionPayerInfo;
