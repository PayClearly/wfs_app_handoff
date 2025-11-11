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
    status: state.global.vendors.status,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    updateGlobalVendor: (id, data) => {
      return dispatch(Store.global.updateGlobalVendor(id, data));
    },
    clearStatusErrors: () => {
      dispatch(Store.global.clearErrorsGlobalVendor());
    },
  });
};

class components_entities_globalVendor extends Component {

  state = {
    editBtnText: 'Edit',
  };




  onSubmit = () => {
    const { globalVendorId } = this.props;
    const data = this.props.forms['Components.forms.globalVendor'][globalVendorId]._values;
    this.props.updateGlobalVendor(globalVendorId, data);
  };

  onCancel = () => {
    this.setState({
      blurAll: false,
    });
  };

  render() {
    const { policies, status, globalVendorId } = this.props;
    const form = _try(() => this.props.forms['Components.forms.globalVendor'][globalVendorId]) || {};
    const error = status.updatingError;
    const updating = status.updating;
    const updateDisabled = updating || !form._allValid || form._allInitial;

    return (
      <div className="p-3 pt-4 components_entities_globalVendor">
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
          <Components.overviews.globalVendor
            globalVendorId={globalVendorId}
          />
          <Components.forms.globalVendor
            formKey={globalVendorId}
            blurAll={this.state.blurAll}
            globalVendorId={globalVendorId}
            isExistingGlobalVendor
          />
        </Components.entities.entitywrapper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_globalVendor);


