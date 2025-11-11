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
    users: state.users,
    access: state.user.access,
    policies: Selectors.entity('privileges_grantedTo_*_*')(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    createUser: (data) => {
      dispatch(Store.users.create(data));
    },
    resetForm: (name, key) => {
      dispatch(Store.forms.reset(name, key, {
        email: '',
        firstName: '',
        lastName: '',
      }));
    },
    clearStatusErrors: () => {
      dispatch(Store.users.clearErrors());
    },
  });
};

class components_creators_user extends Component {

  state = {
    formKey: 'createsingleuserform',
    showUserCreatedNotification: false,
    createFormActive: true,
  };

  componentDidMount() { }
  componentWillUnmount() { }

  onCreate = () => {
    this.props.resetForm('Components.forms.useremail', this.state.formKey);
    this.setState({ showUserCreatedNotification: true });
  }

  submit = () => {
    const form = (this.props.forms['Components.forms.useremail'] && this.props.forms['Components.forms.useremail'][this.state.formKey]) || {};

    this.props.createUser({ ...form._values });
    this.setState({ showUserCreatedNotification: false });
  }

  render() {
    const error = this.props.users.status.creatingError;
    const creating = this.props.users.status.creating;
    const form = (this.props.forms['Components.forms.useremail'] && this.props.forms['Components.forms.useremail'][this.state.formKey]) || {};
    const disabled = creating || form._allInitial || !form._allValid;

    return (
      <Components.creators.creatorwrapper
        canCreate={this.props.policies.canCreate}
        createFormActive={this.state.createFormActive}
        status={this.props.users.status}
        onCreate={this.onCreate}
        clearStatusErrors={this.props.clearStatusErrors}
      >
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-5">Add a User</h5>
            <Components.forms.useremail
              formKey={this.state.formKey}
              showAddtionalOptions
              disabled={creating}
              blurAll={this.state.blurAll}
            />
            {error &&
              <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Something Went Wrong</h4>
                Error: {error}
              </div>
            }
            {this.state.showUserCreatedNotification &&
              <div className="alert alert-primary" role="alert">
                User successfully created! You can now modify their roles below, or create another user.
              </div>
            }
            <Components.button
              disabled={disabled}
              onClick={this.submit}
              buttonText="Add User"
              updating={creating}
              onDisabledClick={() => this.setState({ blurAll: true })}
            />
          </div>
        </div>
      </Components.creators.creatorwrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_creators_user);


