import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    policies: Selectors.entity('globalVendors_*')(state),
    status: state.global.groups.status,
    groups: state.global.groups.data.items,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    updateGlobalVendorGroupPSOP: (id, data, method) => {
      return dispatch(Store.global.updateGlobalVendorGroupPSOP(id, data, method));
    },
    clearStatusErrors: () => {
      dispatch(Store.global.clearErrorsGlobalVendorGroup());
    },
  });
};

class components_entities_globalVendorGroupPSOP extends Component {

  state = {
    editBtnText: 'Edit',
    formKey: `${this.props.method}-${this.props.groupId}`,
  };




  onSubmit = () => {
    const { method, groupId, groups, forms } = this.props;
    const data = _try(() => forms['Components.forms.globalVendorGroupPSOP'][this.state.formKey]._values);
    if (!data) return;
    const groupPSOP = _try(() => groups[groupId][method]);

    const updateData = {
      credentialSchema: data.credentialSchema || undefined,
      paymentSchema: data.paymentSchema || undefined,
      procedure: groupPSOP.procedure,
      accepts: data.accepts,
      fee: data.fee ?
        {
          type: data.feeType,
          value: Number(parseFloat(data.feeValue).toFixed(2)),
        }
        : null,
    };

    this.props.updateGlobalVendorGroupPSOP(groupId, updateData, method);
  };

  onCancel = () => {
    this.setState({
      blurAll: false,
    });
  };

  render() {
    const { policies, status, groupId, groups, method } = this.props;
    const form = _try(() => this.props.forms['Components.forms.globalVendorGroupPSOP'][this.state.formKey]) || {};
    const error = status.updatingError;
    const updating = status.updating;
    const updateDisabled = updating || !form._allValid;

    return (
      <div className="p-3 pt-4 components_entities_globalVendorGroupPSOP">
        <Components.entities.entitywrapper
          canRead={policies.canRead}
          canUpdate={policies.canUpdate}
          canDelete={policies.canDelete}
          onSubmit={this.onSubmit}
          onCancel={this.onCancel}
          clearStatusErrors={this.props.clearStatusErrors}
          updating={updating}
          error={error}
          updateDisabled={updateDisabled}
          editBtnText={this.state.editBtnText}
          onDisabledClick={() => { this.setState({ blurAll: true }); }}
        >
          <Components.overviews.globalVendorGroupPSOP
            method={method}
            groupId={groupId}
          />
          <Components.forms.globalVendorGroupPSOP
            method={method}
            initialData={_try(() => groups[groupId][method])}
            blurAll={this.state.blurAll}
            formKey={this.state.formKey}
            disabled={updating}
          />
        </Components.entities.entitywrapper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_globalVendorGroupPSOP);


