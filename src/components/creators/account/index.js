import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';


const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    policies: Selectors.entity('accounts_idOrganization')(state),
    accounts: state.accounts,
    access: state.user.access,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    createAccount: (data) => {
      dispatch(Store.accounts.create(data));
    },
    resetForm: (name, key) => {
      dispatch(Store.forms.reset(name, key, {
        name: '',
        externalId: '',
      }));
    },
    clearStatusErrors: () => {
      dispatch(Store.accounts.clearErrors());
    },
  });
};

class components_creators_account extends Component {

  state = {
    createFormActive: true,
    showAccountCreatedNotification: false,
  };




  onCreate = () => {
    this.props.resetForm('Components.forms.createaccount', 'default');
    this.setState({ showAccountCreatedNotification: true });
  }

  onDisabledClick = () => {
    this.setState({ blurAll: true });
  }

  submit = () => {
    const form = this.props.forms['Components.forms.createaccount'].default;

    let data = { name: form.name.value };

    if (form._values.active) {
      const activeData = {
        active: form.active.value,
        contactName: form.contactName.value,
        contactEmail: form.contactEmail.value,
        contactPhoneNumber: form.contactPhoneNumber.value,
        suspended: form.suspended && form.suspended.value || false,
        externalId: form.externalId.value,
        address: {
          streetAddress: form.streetAddress.value || '',
          unit: form.unit.value || '',
          city: form.city.value || '',
          state: form.state.value || '',
          zipCode: form.zipCode.value || '',
        },
      };
      data = Object.assign({}, data, activeData);
    }
    this.props.createAccount(data);
    this.setState({ showAccountCreatedNotification: false });
  }

  render() {
    return (
      <Components.creators.creatorwrapper
        canCreate={this.props.policies.canCreate}
        createFormActive={this.state.createFormActive}
        onCreate={this.onCreate}
        status={this.props.accounts.status}
        clearStatusErrors={this.props.clearStatusErrors}
      >
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">Create an Account</h5>
            <Components.forms.createaccount
              blurAll={this.state.blurAll}
              onDisabledClick={this.onDisabledClick}
              submit={this.submit}
              showAccountCreatedNotification={this.state.showAccountCreatedNotification}
            />
          </div>
        </div>
      </Components.creators.creatorwrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_creators_account);


