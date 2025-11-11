import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    resource: _try(() => state.integrationDefinitions.data.items[props.integrationName].resources[props.resourceName]),
    forms: state.forms,
    status: state.mockedIntegrations.status,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    setMockResource: (integrationName, resourceType, data) => {
      return dispatch(Store.mockedIntegrations.setMock({ integration: integrationName, item: data, type: resourceType }));
    },
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
  });
};

class components_creators_integrationManager extends Component {
  state = {
    showCreatedNotification: false,
  };

  componentDidMount() {
    this.setState({ formKey: `${this.props.integrationName}-${this.props.resourceName}` });
  }


  onCreate = () => {
    this.setState({ showCreatedNotification: true });
  };

  submit = () => {
    const data = this.props.forms['Components.forms.integrationManager'][this.state.formKey]._values;
    this.props.setMockResource(this.props.integrationName, this.props.resource.type, data);
    this.setState({ showCreatedNotification: false });
  };

  render() {
    const { status, forms } = this.props;
    const error = status.creatingError;
    const creating = status.creating;
    const form = _try(() => forms['Components.forms.integrationManager'][this.state.formKey]) || {};
    const disabled = creating || form._allInitial || !form._allValid;

    return (
      <Components.creators.creatorwrapper
        className="components_creators_integrationManager"
        canCreate
        createFormActive={!this.props.hideCreateForm}
        status={this.props.status}
        onCreate={this.onCreate}
        onSubmit={this.submit}
        onDisabledClick={() => { this.setState({ blurAll: true }); }}
        clearStatusErrors={this.props.clearStatusErrors}
        createDisabled={disabled}
        includeButton
      >
        <Fragment>
          <Components.forms.integrationManager formKey={`${this.props.integrationName}-${this.props.resourceName}`} />
          {error &&
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Something Went Wrong</h4>
              Error: {error}
            </div>
          }
          {this.state.showCreatedNotification &&
            <div className="alert alert-primary" role="alert">
              Resource successfully created! You can edit resources in the next tab, or create another.
            </div>
          }
        </Fragment>
      </Components.creators.creatorwrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_creators_integrationManager);


