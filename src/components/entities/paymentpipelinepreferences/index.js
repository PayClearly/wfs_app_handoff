import numeral from 'numeral';
import {
  connect, Component,
} from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  accountId: state.account.data.id,
  forms: state.forms,
  orgId: state.organization.data.id,
  paymentPipelinePreferencesItem: state.account.paymentPipelinePreferences.data.item,
  paymentPipelinePreferencesStatus: state.account.paymentPipelinePreferences.status,
  policies: Selectors.entity('paymentPipelinePreferences_idOrganization_idAccount')(state),
  postageOptions: Selectors.postageOptions(),
  globalVendorTagOptions: Selectors.globalVendorTagOptions(state),
  cardRegionOptions: Selectors.cardRegionOptions(),
  fileTypeOptions: Selectors.fileTypeOptions(),
  provider: state.account && state.account.cardsIntegration && state.account.cardsIntegration.data && state.account.cardsIntegration.data.details && state.account.cardsIntegration.data.details.provider,
});

const mapDispatchToProps = (dispatch) => ({
  setPreferences: (data) => {
    dispatch(Store.account.updatePaymentPipelinePreferences(data));
  },
  clearStatusErrors: () => {
    dispatch(Store.account.clearErrorsPaymentPipelinePreferences());
  },
});

function getUpdatedFields(form) {
  const fieldsToParse = [
    'defaultCommissionRate',
    'commissionOffsetPercentage',
    'defaultValidThroughPeriod',
    'galileoVCardDefaultMaxUses',
    'vCardDefaultMaxUses',
  ];
  const fields = Object.keys(form._values);

  return fields.reduce((acc, key) => {
    if (form[key].initial !== form._values[key]) {
      if (fieldsToParse.includes(key)) {
        acc[key] = parseFloat(form._values[key]);
      } else {
        acc[key] = form._values[key];
      }
    }
    return acc;
  }, {});
}

class componentsEntitiesPaymentPipelinePreferences extends Component {

  state = {
    editBtnText: 'Edit Preferences',
    // formName: 'Components.forms.paymentpipelinepreferences',
  };

  fieldsTitles = {
    globalVendorTagIds: 'Linkable Verticals',
    defalutGlobalVendorTagId: 'Default Linkable Verticals',
    emailRepsOnCreation: 'Email vendor reps on payment creation',
    emailRepsOnDone: 'Email vendor reps on payment finalization',
    requireBatchFunding: 'Require funds for entire batch of payments',
    automaticallyMarkACHPaymentsAsSent: 'Automatically mark ACH payments as sent',
    automaticallyMarkCheckPaymentsAsSent: 'Automatically mark Check payments as sent',
    automaticallyMarkVCardPaymentsAsSent: 'Automatically mark Card payments as sent',
    requireVendorLinkToERP: 'Require vendors to be linked to ERP',
    postageCode: 'Default Postage Code',
    showAccountNameOnCards: 'Show Account Name on Cards',
    defaultCardRegion: 'Default Region for Cards',
    enableCommissions: 'Enable Commission Payments',
    allowBatchERPOverride: 'Allow Batch ERP Overrides',
    defaultCommissionRate: 'Default Commission Rate',
    commissionOffsetPercentage: 'Commission Offset Percentage',
    disableVCardExactMatchDefault: 'Disable virtual card exact match default for single use cards',
    defaultValidThroughPeriod: 'Default Valid Through Period for Cards (in days)',
    paymentUploadFileType: 'Payment Upload File Type',
    passwordManager: 'Password Manager',
    paymentHistoryVendorPaymentNotes: 'Show vendor payment notes in payment history',
    requiresApproval: 'Payments Require Approval',
    numberOfApprovers: 'Number Of Approvers Required',
    requireConfirmationNumber: 'Require Confirmation Number',
    confirmationNumberDefault: 'Default value when no confirmation number available',
    autoAcceptsFees: 'Auto Accepts Fees',
    showInterchangeDataOnTransactionsReport: 'Show Interchange Data on Transaction Report',
    vCardDefaultMaxUses: 'Default Virtual Card Max Uses', // WEX only
    galileoVCardDefaultMaxUses: 'Galileo Virtual Card Default Max Uses',
    galileoPaymentCardBin: 'Galileo Default Bin for Payment Cards',
    galileoPurchaseCardBin: 'Galileo Default Bin for Purchase Cards',
  };






  onSubmit() {
    const form = this.props.forms['Components.forms.paymentpipelinepreferences'].accountsettings;

    // only include updated fields in payload
    const updatedFields = getUpdatedFields(form);
    this.props.setPreferences({ ...updatedFields });
  }


  // allows for dynamic type definitions
  generateTypes = () => ({

    general: {
      globalVendorTagIds: true,
      defalutGlobalVendorTagId: true,
      emailRepsOnCreation: true,
      emailRepsOnDone: true,
      requireBatchFunding: true,
      automaticallyMarkACHPaymentsAsSent: true,
      automaticallyMarkCheckPaymentsAsSent: true,
      requireVendorLinkToERP: true,
      enableCommissions: true,
      allowBatchERPOverride: true,
      defaultCommissionRate: _resolve(this.props, 'paymentPipelinePreferencesItem.enableCommissions'),
      commissionOffsetPercentage: _resolve(this.props, 'paymentPipelinePreferencesItem.enableCommissions'),
      paymentUploadFileType: true,
      passwordManager: true,
      paymentHistoryVendorPaymentNotes: true,
      requiresApproval: true,
      numberOfApprovers: false,
      requireConfirmationNumber: true,
      confirmationNumberDefault: false,
      autoAcceptsFees: true,
      showInterchangeDataOnTransactionsReport: true,
      vCardDefaultMaxUses: this.props.provider === 'EFS' || this.props.provider === 'STUB', // WEX only
      galileoVCardDefaultMaxUses: this.props.provider === 'GALILEO' || this.props.provider === 'GALILEOSTUB',
      galileoPaymentCardBin: this.props.provider === 'GALILEO' || this.props.provider === 'GALILEOSTUB',
      galileoPurchaseCardBin: this.props.provider === 'GALILEO' || this.props.provider === 'GALILEOSTUB',
    },
    check: { postageCode: true },
    card: {
      showAccountNameOnCards: true,
      defaultCardRegion: true,
      disableVCardExactMatchDefault: true,
      defaultValidThroughPeriod: true,
    },
  });


  toVal(key) {
    const val = this.props.paymentPipelinePreferencesItem[key];
    switch (key) {

      case 'postageCode':
        return this.props.postageOptions[this.props.paymentPipelinePreferencesItem.postageCode || '1'].display;

      case 'globalVendorTagIds':
        return (val || [])
          .map((id) => this.props.globalVendorTagOptions[id] && this.props.globalVendorTagOptions[id].display)
          .join(', ');

      case 'defalutGlobalVendorTagId':
        return _try(() => this.props.globalVendorTagOptions[val].display) || null;

      case 'defaultCardRegion':
        return this.props.cardRegionOptions[val || 'USA'].display;

      case 'defaultCommissionRate':
      case 'commissionOffsetPercentage':
        return val ? _try(() => `${val.toString()}%`, '0%') : 'No';

      case 'defaultValidThroughPeriod':
        return val || 'Not Set';
      case 'paymentUploadFileType':
        return this.props.fileTypeOptions[val || 'csv'].display;
      case 'passwordManager':
        return val || 'none';
      case 'galileoVCardDefaultMaxUses':
        return this.props.paymentPipelinePreferencesItem.galileoVCardDefaultMaxUses || 5;
      case 'vCardDefaultMaxUses':
        return this.props.paymentPipelinePreferencesItem.vCardDefaultMaxUses || 1; // WEX only
      case 'galileoPaymentCardBin':
        return this.props.paymentPipelinePreferencesItem.galileoPaymentCardBin || 'not selected';
      case 'galileoPurchaseCardBin':
        return this.props.paymentPipelinePreferencesItem.galileoPurchaseCardBin || 'not selected';
      default:
        return (!val && 'No') || 'Yes';

    }
  }

  render() {
    if (!this.props.paymentPipelinePreferencesItem) { return null; }
    const { canRead, canUpdate, canDelete } = this.props.policies;

    const error = this.props.paymentPipelinePreferencesStatus.updatingError;
    const { updating } = this.props.paymentPipelinePreferencesStatus;
    const form = (this.props.forms['Components.forms.paymentpipelinepreferences']
      && this.props.forms['Components.forms.paymentpipelinepreferences'].accountsettings)
      || {};
    const updateDisabled = updating || form._allInitial || !form._allValid;
    const types = this.props.types
      ? this.props.types.reduce((acc, curr) => Object.assign(acc, this.generateTypes()[curr]), {})
      : 'general';

    return (
      <div className="mb-5 components_entities_paymentpipelinepreferences">
        {this.props.title && <h3>{this.props.title}</h3>}
        <Components.entities.entitywrapper
          canRead={canRead}
          canUpdate={canUpdate}
          canDelete={canDelete}
          onSubmit={() => this.onSubmit()}
          clearStatusErrors={this.props.clearStatusErrors}
          updating={updating}
          error={error}
          updateDisabled={updateDisabled}
          editBtnText={this.state.editBtnText}
          wrapperClasses={'mt-3'}
          orgId={this.props.orgId}
          accountId={this.props.accountId}
        >
          {(() => Object.keys(this.fieldsTitles)
            .map((key) => {
              if (!types[key]) { return (<span />); }

              const title = this.fieldsTitles[key];
              const val = this.toVal(key);
              return (
                <p> - {title}: <strong>{val}</strong></p>
              );

            }))()}
          <Components.forms.paymentpipelinepreferences
            id="accountsettings"
            initialFormData={this.props.paymentPipelinePreferencesItem}
            postageOptions={this.props.postageOptions}
            updating={updating}
            fieldsTitles={this.fieldsTitles}
            show={types || {}}
          />
        </Components.entities.entitywrapper>
      </div>
    );
  }
}

// Internal Helper Functions ...
// function getUpdatedFields(form) {
//   const fieldsToParse = ['defaultCommissionRate', 'commissionOffsetPercentage', 'defaultValidThroughPeriod'];
//   const fields = Object.keys(form._values);

//   return fields.reduce((acc, key) => {
//     if (form[key].initial !== form._values[key]) {
//       if (fieldsToParse.includes(key)) {
//         acc[key] = parseFloat(form._values[key]);
//       } else {
//         acc[key] = form._values[key];
//       }
//     }
//     return acc;
//   }, {});
// }

export default connect(mapStateToProps, mapDispatchToProps)(componentsEntitiesPaymentPipelinePreferences);
