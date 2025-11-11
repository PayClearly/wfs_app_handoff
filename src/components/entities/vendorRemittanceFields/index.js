import {
  connect, Component, bindActionCreators,
} from 'component';

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  paymentStatuses: state.account.paymentStatuses,
  form: _try(() => state.forms['Components.forms.vendorRemittanceFields'][props.id], {}),
  existingVendorRemittanceFields: _resolve(state, `account.paymentStatuses.data.items.${props.id}.sent.vendorRemittanceFields`),
  paymentPipelinePreferences: state.account.paymentPipelinePreferences.data.item,
});

const mapDispatchToProps = (dispatch) => ({
  updateVendorRemittanceFields: (id, params) => dispatch(Store.account.updatePaymentPipelines([id], 'updateVendorRemittanceFields', params)),
  clearStatusErrors: () => {
    dispatch(Store.global.clearErrorsGlobalVendor());
  },
  openAreYouSureModal: (data) => { dispatch(Store.router.openModal('Components.modals.areyousure', data)); },
  ...bindActionCreators(Store.forms, dispatch),
});

const mapResourcesToProps = () => ({});

class components_entities_vendorRemittanceFields extends Component {
  state = {
    formName: 'Components.forms.vendorRemittanceFields',
    vendorRemittanceFields: {
      'Confirmation Number': {
        name: 'Confirmation Number',
        key: 'Confirmation Number',
        required: true,
      },
    },
  };





  onSubmit = () => {
    const { _values } = this.props.form;

    this.props.updateVendorRemittanceFields(this.props.id, _values);
  };

  render() {
    const { form } = this.props;

    const formKey = this.props.id || 'default';

    const { updating } = this.props.paymentStatuses.status;
    const error = this.props.paymentStatuses.status.updatingError;
    const updateDisabled = updating || !form._allValid;

    return (
      <div className="components_entities_vendorRemittanceFields">
        <Components.entities.entitywrapper
          canRead
          canUpdate
          canDelete
          onSubmit={this.onSubmit}
          onCancel={this.onCancel}
          clearStatusErrors={this.props.clearStatusErrors}
          updating={updating}
          error={error}
          updateDisabled={updateDisabled}
          editBtnText="Edit"
          onDisabledClick={() => { this.setState({ blurAll: true }); }}
        >
          <Components.overviews.vendorRemittanceFields
            fields={this.state.vendorRemittanceFields}
            initialData={this.props.existingVendorRemittanceFields || {}}
            id={this.props.id}
            heightOverride={this.props.heightOverride}
          />
          <Components.forms.vendorRemittanceFields
            fields={this.state.vendorRemittanceFields}
            initialData={this.props.existingVendorRemittanceFields || {}}
            id={this.props.id}
            formKey={formKey}
            blurAll={this.state.blurAll}
            disabled={updating}
          />
        </Components.entities.entitywrapper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_entities_vendorRemittanceFields);


