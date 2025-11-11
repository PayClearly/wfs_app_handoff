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
    status: state.global.vendors.status,
    vendors: state.global.vendors.data.items,
    groups: state.global.groups.data.items,
    access: state.user.access,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    createGlobalVendor: (files) => {
      return dispatch(Store.global.createGlobalVendor(files));
    },
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
    clearStatusErrors: () => {
      dispatch(Store.global.clearErrorsGlobalVendor());
    },
  });
};

class components_creators_globalVendor extends Component {

  state = {
    showCreatedNotification: false,
  };

  componentDidMount() { }
  componentWillUnmount() { }

  onCreate = () => {
    this.setState({ showCreatedNotification: true });
    this.props.resetForm('Components.forms.globalVendor', 'default', {
      name: '',
      groupIds: [],
      website: '',
      phoneNumber: '',
      streetAddress: '',
      unit: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      email: '',
      active: true,
      contacts: '',
      notifyOnCreation: false,
      notifyOnCreationEmails: '',
      notifyOnCompletion: false,
      notifyOnCompletionEmails: '',
      notificationFields: '',
    });
  };

  submit = () => {
    const data = this.props.forms['Components.forms.globalVendor'].default._values;
    this.props.createGlobalVendor(data);
    this.setState({ showCreatedNotification: false });
  };

  render() {
    const { status, forms } = this.props;
    const error = status.creatingError;
    const creating = status.creating;
    const form = _try(() => forms['Components.forms.globalVendor'].default) || {};
    const disabled = creating || form._allInitial || !form._allValid;

    return (
      <Components.creators.creatorwrapper
        className="components_creators_globalVendor"
        canCreate={this.props.policies.canCreate}
        createFormActive={!this.props.hideCreateForm}
        status={this.props.status}
        onCreate={this.onCreate}
        clearStatusErrors={this.props.clearStatusErrors}
      >
        <Fragment>
          <Components.forms.globalVendor />
          {error &&
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Something Went Wrong</h4>
              Error: {error}
            </div>
          }
          {this.state.showCreatedNotification &&
            <div className="alert alert-primary" role="alert">
              Vendor successfully created! You can edit vendors below, or create another.
            </div>
          }
          <Components.button
            className="btn btn-primary"
            buttonText="Create"
            onClick={this.submit}
            ariaLabel="Create Global Schema"
            updating={creating}
            disabled={disabled}
            onDisabledClick={() => { this.setState({ blurAll: true }); }}
          />
        </Fragment>
      </Components.creators.creatorwrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_creators_globalVendor);


