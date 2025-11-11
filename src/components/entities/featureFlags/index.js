import {
  connect,
  Component,
} from 'component';

import Store from 'store';
import Components from 'components';

import './index.scss';

const featuresTree = {
  Integrations: [
    { display: 'ERP/Accounting Integration', value: 'erpIntegration' },
    { display: 'Cards Integration', value: 'cardsIntegration' },
    { display: 'Checks Integration', value: 'checksIntegration' },
    { display: 'ACH Integration', value: 'achIntegration' },
    { display: 'Galileo ACH Integration', value: 'galileoACH' },
    { display: 'Galileo Check Integration', value: 'galileoCheck' },
    { display: 'Galileo Toggle Payment Card Bin', value: 'galileoPaymentCardBinToggle' },
    { display: 'Galileo Toggle Purchase Card Bin', value: 'galileoPurchaseCardBinToggle' },
    { display: 'ACH Delivery Method Toggle Debit/Credit', value: 'achDeliveryMethod' },
  ],
  Widgets: [
    { display: 'ERP Status', value: 'erpIntegrationStatus' },
    { display: 'Pending Payments', value: 'pendingPayments' },
    { display: 'Exposure Management', value: 'exposureManagement' },
  ],
  Vendors: [
    { display: 'Vendor Creation - Singular', value: 'vendorCreateSingle' },
    { display: 'Vendor Creation - Upload', value: 'vendorCreateUpload' },
    { display: 'Vendor Enrollments', value: 'enrollments' },
    { display: 'Clients', value: 'clients' },
    { display: 'Bulk Vendor Uploads', value: 'bulkVendorUploads' },
  ],
  Payments: [
    { display: 'Payments', value: 'paymentCreation' },
    { display: 'Payment Cards', value: 'paymentCards' },
    { display: 'Plastic', value: 'plastic' },
    { display: 'FTP Payments', value: 'ftpPayments' },
    { display: 'Approvals', value: 'approvals' },
    { display: 'Bypass Payment Uploader', value: 'bypassPaymentUploader' },
  ],
  Funding: [
    { display: 'Funding Tab', value: 'fundingTab' },
    { display: 'Manual Deposits', value: 'manualDeposits' },
    { display: 'Manual Withdrawals', value: 'manualWithdrawals' },
    { display: 'ACH Funding', value: 'achFunding' },
    /**
     * The 'enableOpsAchDebit' feature flag is currently commented out so that it will
     * not be editable by ops users. It can however exist and it's value
     * can be retrieved from firebase.
     */
    // { display: 'Enable Ops ACH Debit', value: 'enableOpsAchDebit' },
  ],
  Miscellaneous: [
    { display: 'Payments Table Update Cards', value: 'paymentsTableUpdateCards' },
    { display: 'Expenses', value: 'expenses' },
    { display: 'Automated Exposure Relief', value: 'automateExposureRelief' },
  ],
};

const mapStateToProps = (state) => ({
  features: state.account.featureFlags.data.item,
  forms: state.forms,
  status: state.account.featureFlags.status,
});

const mapDispatchToProps = (dispatch) => ({
  updateFeatureFlags: (data) => {
    dispatch(Store.account.updateFeatureFlags(data));
  },
});

// Internal Helper Functions ...
function ClosedContent(props) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '20rem 5rem', marginLeft: '1.45rem', marginRight: '1.45rem',
    }}
    >
      <span>{`${props.feature}: `}</span>
      <span>{props.status || '--'}</span>
    </div>
  );
}

// eslint-disable-next-line camelcase
class components_entities_featureFlags extends Component {
  state = {
    editBtnText: 'Edit',
    openAccordions: {},
  };

  toggleAccordion = (category) => {
    this.setState((prevState) => ({
      openAccordions: {
        ...prevState.openAccordions,
        [category]: !prevState.openAccordions[category],
      },
    }));
  };

  onSubmit = () => {
    const form = this.props.forms?.['Components.forms.features']?.default;
    this.props.updateFeatureFlags(form._values);
  };

  render() {
    const { status } = this.props;
    const form = this.props.forms?.['Components.forms.features']?.default || {};
    const error = status.updatingError;
    const { updating } = status;
    const updateDisabled = updating || !form._allValid || form._allInitial;

    return (
      <div className="components_entities_featureFlags">
        <Components.entities.entitywrapper
          canRead
          canUpdate
          onSubmit={this.onSubmit}
          onCancel={this.onCancel}
          clearStatusErrors={this.props.clearStatusErrors}
          updating={updating}
          error={error}
          updateDisabled={updateDisabled}
          editBtnText={this.state.editBtnText}
        >
          <div>
            {Object.keys(featuresTree || {}).map((category) => (
              <Components.boxaccordion
                label={category}
                leftAligned
                selected={!!(Object.prototype.hasOwnProperty.call(this.state.openAccordions, category) && this.state.openAccordions[category])}
                onSelect={() => this.toggleAccordion(category)}
                closedContent={featuresTree[category].map((item) => (
                  <ClosedContent
                    feature={item.display}
                    status={this.props.features[item.value]}
                  />
                ))}
              />
            ))}
          </div>
          <Components.forms.features
            features={this.props.features}
            format={featuresTree}
          />
        </Components.entities.entitywrapper>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(components_entities_featureFlags);
