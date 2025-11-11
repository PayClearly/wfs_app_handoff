import {
 connect,
 Component,
} from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
    policies: Selectors.entity('accountVendors_idOrganization_idAccount')(state),
    vendorNamesToId: Selectors.globalTaggedItems(state).vendorNamesToId,
    forms: state.forms,
    status: state.account.accountVendors.status,
    erpIntegration: _try(() => Selectors.integrations(state).erpIntegration, {}),
  });

const mapDispatchToProps = (dispatch) => ({
    create: (data) => {
      dispatch(Store.account.createAccountVendors([data]));
    },
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
    blurForm: (name, key, fields) => {
      dispatch(Store.forms.blur(name, key, fields));
    },
    clearStatusErrors: () => {
     dispatch(Store.account.clearErrorsAccountVendors());
    },
  });

class components_creators_accountvendor extends Component {

  state = {
    createFormActive: true,
    formName: 'Components.forms.accountvendor',
    formId: 'default',
  };


  onCreate = () => {
    this.props.resetForm(this.state.formName, this.state.formId, this.props.forms[this.state.formName][this.state.formId]._values);
    // for modal only
    if (this.props.close && typeof this.props.close === 'function') { this.props.close(); }
  };

  onDisabledClick = () => {
    this.props.blurForm(this.state.formName, this.state.formId, this.props.forms[this.state.formName][this.state.formId]._values);
  };

  onSubmit = () => {
    const { _values } = this.props.forms[this.state.formName][this.state.formId];

    // Adapt
    const createData = {
      ..._values,
      globalVendorRef: this.props.vendorNamesToId[_values.globalVendorRef] || null,
      vCardEmails: (_values.vCardEmails || '').split(',').filter((item) => item.length),
      vCardFaxNumbers: (_values.vCardFaxNumbers || '').split(',').filter((item) => item.length),
      repEmails: (_values.repEmails || '').split(',').filter((item) => item.length),
      galileoVCardDefaultMaxUses: _values.galileoVCardDefaultMaxUses ? Number(_values.galileoVCardDefaultMaxUses) : null,
      vCardDefaultMaxUses: _values.vCardDefaultMaxUses ? Number(_values.vCardDefaultMaxUses) : null, // WEX only
    };

    ['vCard', 'check', 'ACH'].forEach((method) => {
      // PSOP aggregations
      // Fee
      if (_values[`${method}Fee`]) {
        createData[`${method}Fee`] = {
          type: _values[`${method}FeeType`],
          value: Number(parseFloat(_values[`${method}FeeValue`]).toFixed(2)),
        };
      }
    });

    this.props.create(createData);
  };

  render() {
    const { canCreate } = this.props.policies;

    if (_try(() => this.props.erpIntegration.settings.createAccountVendorsFromERPVendors.default)) {
      return null;
    }
    if (!canCreate) { 
      return <Components.invalidpermissions />; 
    }

    const form = (this.props.forms[this.state.formName] && this.props.forms[this.state.formName][this.state.formId]) || {};

    return (
      <Components.creators.creatorwrapper
        className="components_creators_accountvendor"
        canCreate={canCreate}
        createFormActive={this.state.createFormActive}
        status={this.props.status}
        includeButton
        onCreateNotification="Vendor successfully created! You can edit vendors below, or create another."
        showErrorNotification
        createDisabled={!form._allValid}
        clearStatusErrors={this.props.clearStatusErrors}
        onCreate={this.onCreate}
        onDisabledClick={this.onDisabledClick}
        onSubmit={this.onSubmit}
      >
        <Components.forms.accountvendor
          initialData={this.props.initialData}
          forModal={this.props.forModal}
        />
      </Components.creators.creatorwrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_creators_accountvendor);

// GENERATOR_TYPE='component';
