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
    createGlobalVendorGroup: (data) => {
      return dispatch(Store.global.createGlobalVendorGroup(data));
    },
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
    clearStatusErrors: () => {
      dispatch(Store.global.clearErrorsGlobalVendorGroup());
    },
  });
};

class components_creators_globalVendorGroup extends Component {

  state = {
    showCreatedNotification: false,
  };




  onCreate = () => {
    this.setState({ showCreatedNotification: true });
    this.props.resetForm('Components.forms.globalVendorGroup', 'default', {
      name: '',
      active: true,
      tagIds: [],
      globalVendorIds: [],
    });
  };

  submit = () => {
    const data = _try(() => this.props.forms['Components.forms.globalVendorGroup'].default._values);
    if (!data) return;
    this.props.createGlobalVendorGroup(data);
    this.setState({ showCreatedNotification: false });
  };

  render() {
    const { status, forms } = this.props;
    const error = status.creatingError;
    const creating = status.creating;
    const form = _try(() => forms['Components.forms.globalVendorGroup'].default) || {};
    const disabled = creating || form._allInitial || !form._allValid;

    return (
      <Components.creators.creatorwrapper
        className="components_creators_globalVendorGroup"
        canCreate={this.props.policies.canCreate}
        createFormActive={!this.props.hideCreateForm}
        status={this.props.status}
        onCreate={this.onCreate}
        clearStatusErrors={this.props.clearStatusErrors}
      >
        <Fragment>
          <Components.forms.globalVendorGroup />
          {error &&
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Something Went Wrong</h4>
              Error: {error}
            </div>
          }
          {this.state.showCreatedNotification &&
            <div className="alert alert-primary" role="alert">
              Group successfully created! You can edit groups below, or create another.
            </div>
          }
          <Components.button
            className="btn btn-primary"
            buttonText="Create"
            onClick={this.submit}
            ariaLabel="Create Group"
            updating={creating}
            disabled={disabled}
            onDisabledClick={() => { this.setState({ blurAll: true }); }}
          />
        </Fragment>
      </Components.creators.creatorwrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_creators_globalVendorGroup);


