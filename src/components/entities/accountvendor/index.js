import { connect, Component } from 'component';

// Third Party Imports ...

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  orgId: state.organization.data.id,
  accountId: state.account.data.id,
  vendor: state.account.accountVendors.data.items[props.id] || {},

  forms: state.forms,
  policies: Selectors.entity('accountVendors_idOrganization_idAccount')(state),
  status: state.account.accountVendors.status,

  vendorNamesToId: Selectors.globalTaggedItems(state).vendorNamesToId,
});

const mapDispatchToProps = (dispatch) => ({
  updateVendor: (vendor) => {
    dispatch(Store.account.updateAccountVendor(vendor));
  },
  clearStatusErrors: () => dispatch(Store.account.clearErrorsAccountVendors()),
});

class components_entities_accountvendor extends Component {

  state = {
    formName: 'Components.forms.accountvendor',
    editBtnText: 'Edit',
  };



  onSubmit = () => {
    const { _values } = this.props.forms['Components.forms.accountvendor'][this.props.id];

    const updateData = {
      ..._values,
      globalVendorRef: this.props.vendorNamesToId[_values.globalVendorRef] || null,
      vCardEmails: (_values.vCardEmails || '').split(',').filter((item) => item.length),
      vCardFaxNumbers: (_values.vCardFaxNumbers || '').split(',').filter((item) => item.length),
      repEmails: (_values.repEmails || '').split(',').filter((item) => item.length),
      galileoVCardDefaultMaxUses: Number(_values.galileoVCardDefaultMaxUses),
      vCardDefaultMaxUses: Number(_values.vCardDefaultMaxUses), // WEX only
    };

    ['vCard', 'check', 'ACH'].forEach((method) => {
      // PSOP aggregations
      // Fee
      if (_values[`${method}Fee`]) {
        updateData[`${method}Fee`] = {
          type: _values[`${method}FeeType`],
          value: Number(parseFloat(_values[`${method}FeeValue`]).toFixed(2)),
        };
      }
    });

    this.props.updateVendor(updateData);
  };

  onCancel = () => {
    this.setState({ blurAll: false });
  };

  render() {

    const { canRead, canUpdate, canDelete } = this.props.policies;

    const error = this.props.status.updatingError;
    const { updating } = this.props.status;
    const form = (this.props.forms[this.state.formName] && this.props.forms[this.state.formName][this.props.id]) || {};
    const updateDisabled = updating || !form._allValid || form._allInitial;

    const initialData = this.props.vendor;

    const wrapperClasses = this.props.wrapperClasses || 'p-4';


    return (
      <Components.entities.entitywrapper
        canRead={canRead}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onSubmit={this.onSubmit}
        updating={updating}
        error={error}
        updateDisabled={updateDisabled}
        editBtnText={this.state.editBtnText}
        orgId={this.props.orgId}
        accountId={this.props.accountId}
        wrapperClasses={wrapperClasses}
        onDisabledClick={() => { this.setState({ blurAll: true }); }}
        onCancel={this.onCancel}
        clearStatusErrors={this.props.clearStatusErrors}
      >
        <Components.accountvendor id={this.props.id} />
        <Components.forms.accountvendor
          formKey={this.props.id}
          initialData={initialData}
          forUpdate
          forModal={this.props.forModal}
          blurAll={this.state.blurAll}
        />
      </Components.entities.entitywrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_accountvendor);


