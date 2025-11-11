import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    policies: Selectors.entity('globalVendors_*')(state),
    status: state.global.groups.status,
    globalVendorGroups: state.global.groups.data.items,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    updateGlobalVendorGroup: (id, data) => {
      return dispatch(Store.global.updateGlobalVendorGroup(id, data));
    },
    clearStatusErrors: () => {
      dispatch(Store.global.clearErrorsGlobalVendorGroup());
    },
  });
};

class components_entities_globalVendorGroup extends Component {

  state = {
    editBtnText: 'Edit',
  };

  componentDidMount() { }
  componentWillUnmount() { }

  onSubmit = () => {
    const { id } = this.props;
    const data = _try(() => this.props.forms['Components.forms.globalVendorGroup'][id]._values);
    if (!data) return;
    this.props.updateGlobalVendorGroup(id, data);
  };

  onCancel = () => {
    this.setState({
      blurAll: false,
    });
  };

  render() {
    const { policies, status, id, globalVendorGroups } = this.props;
    const form = _try(() => this.props.forms['Components.forms.globalVendorGroup'][id]) || {};
    const error = status.updatingError;
    const updating = status.updating;
    const updateDisabled = updating || !form._allValid || form._allInitial;

    const globalVendorGroup = globalVendorGroups[id] || {};

    return (
      <div className="p-3 pt-4 components_entities_globalVendorGroup">
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
          <Components.overviews.globalVendorGroup
            id={id}
          />
          <Components.forms.globalVendorGroup
            initialData={globalVendorGroup}
            formKey={id}
            blurAll={this.state.blurAll}
            disabled={updating}
          />
        </Components.entities.entitywrapper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_globalVendorGroup);


