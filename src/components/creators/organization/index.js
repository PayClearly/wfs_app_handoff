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
    policies: Selectors.entity('organizations_idOrganization')(state),
    organizations: state.organizations,
    organizationCreatePolicy: state.user.policies.data.item['organizations_create'],
    access: state.user.access,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    createOrganization: (name) => {
      dispatch(Store.organizations.create(name));
    },
    resetForm: (name, key) => {
      dispatch(Store.forms.reset(name, key, {
        name: '',
      }));
    },
    clearStatusErrors: () => {
      dispatch(Store.organizations.clearErrors());
    },
  });
};

class components_creators_organization extends Component {

  state = {
    createFormActive: true,
    showOrganizationCreatedNotification: false,
  };

  componentDidMount() { }
  componentWillUnmount() { }

  onCreate = () => {
    this.props.resetForm('Components.forms.createorganization', 'default');
    this.setState({ showOrganizationCreatedNotification: true });
  }

  onDisabledClick = () => {
    this.setState({ blurAll: true });
  }

  submit = () => {
    const form = this.props.forms['Components.forms.createorganization'].default;
    const data = { name: form.name.value };
    if (form.active.value) {
      data.active = form.active.value;
    }

    this.props.createOrganization(data);
    this.setState({ showOrganizationCreatedNotification: false });
  };

  render() {
    return (
      <Components.creators.creatorwrapper
        canCreate={this.props.organizationCreatePolicy}
        createFormActive={this.state.createFormActive}
        status={this.props.organizations.status}
        onCreate={this.onCreate}
        clearStatusErrors={this.props.clearStatusErrors}
      >
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">Create an Organization</h5>
            <Components.forms.createorganization
              submit={this.submit}
              showCreatedNotification={this.state.showOrganizationCreatedNotification}
              blurAll={this.state.blurAll}
              onDisabledClick={this.onDisabledClick}
            />
          </div>
        </div>
      </Components.creators.creatorwrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_creators_organization);


