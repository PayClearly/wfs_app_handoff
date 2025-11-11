import {
  connect, Component, bindActionCreators, Fragment,
} from 'component';

// Third Party Imports ...

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  forms: state.forms,
  policies: Selectors.entity('globalVendors_*')(state),
  status: state.global.procedures.status,
  procedures: state.global.procedures.data.items,
});

const mapDispatchToProps = (dispatch, props) => ({
  updateGlobalVendorProcedure: (id, data, method) => dispatch(Store.global.updateGlobalVendorProcedure(id, data, method)),
  clearStatusErrors: () => {
    dispatch(Store.global.clearErrorsGlobalVendorProcedure());
  },
});

class components_entities_globalVendorProcedure extends Component {

  state = {
    editBtnText: 'Edit',
    formKey: `${this.props.method}-${this.props.procedureId}`,
    formDelegate: { getFormAttachments: () => { } },
    formMap: {
      vCard: 'Components.forms.globalVendorProcedureVCard',
      ACH: 'Components.forms.globalVendorProcedureACH',
      check: 'Components.forms.globalVendorProcedureCheck',
    },
  };





  onSubmit = () => {
    const formName = this.state.formMap[this.props.method];
    const data = _try(() => this.props.forms[formName][this.state.formKey]._values);
    if (!data) { return; }
    const updateData = { ...data, ...this.state.formDelegate.getFormAttachments(), groupId: this.props.groupId };
    this.props.updateGlobalVendorProcedure(this.props.procedureId, updateData, this.props.method);
  };

  onCancel = () => {
    this.setState({
      blurAll: false,
    });
  };

  render() {
    const {
      policies, status, procedureId, method, procedures,
    } = this.props;
    const formName = this.state.formMap[method];
    const form = _try(() => this.props.forms[formName][this.state.formKey]) || {};
    const error = status.updatingError;
    const { updating } = status;
    const updateDisabled = updating || !form._allValid;

    return (
      <div className="p-3 pt-4 components_entities_globalVendorProcedure">
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
          <Fragment>
            {method === 'vCard'
              && <Components.overviews.globalVendorProcedureVCard
                procedureId={procedureId}
              />}
            {method === 'ACH'
              && <Components.overviews.globalVendorProcedureACH
                procedureId={procedureId}
              />}
            {method === 'check'
              && <Components.overviews.globalVendorProcedureCheck
                procedureId={procedureId}
              />}
          </Fragment>
          <Fragment>
            {method === 'vCard'
              && <Components.forms.globalVendorProcedureVCard
                initialData={procedures[procedureId]}
                blurAll={this.state.blurAll}
                formKey={this.state.formKey}
                formDelegate={this.state.formDelegate}
                disabled={updating}
              />}
            {method === 'ACH'
              && <Components.forms.globalVendorProcedureACH
                initialData={procedures[procedureId]}
                blurAll={this.state.blurAll}
                formKey={this.state.formKey}
                disabled={updating}
              />}
            {method === 'check'
              && <Components.forms.globalVendorProcedureCheck
                initialData={procedures[procedureId]}
                blurAll={this.state.blurAll}
                formKey={this.state.formKey}
                disabled={updating}
              />}
          </Fragment>
        </Components.entities.entitywrapper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_globalVendorProcedure);


