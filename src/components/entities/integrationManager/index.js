import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    policies: { canUpdate: true, canDelete: true, canRead: true },
    status: state.mockedIntegrations.status,
    resource: _try(() => Selectors.integrations(state)[props.integrationName].data.resources[props.resourceName][props.id], {}),
    resourceDef: _try(() => Selectors.integrations(state)[props.integrationName].possibleResources[props.resourceName], {}),
    formKey: `${props.integrationName}-${props.resourceName}-${props.id}`,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    setMockResource: (integrationName, resourceType, item, id, error) => {
      const mock = {
        integration: integrationName,
        id,
        type: resourceType,
      };
      if (item) mock.item = item;
      if (error) mock.error = error;

      return dispatch(Store.mockedIntegrations.setMock(mock));
    },
  });
};

class components_entities_integrationManager extends Component {
  state = {
    editBtnText: 'Edit',
  };

  componentDidMount() {
    const formKey = `${this.props.integrationName}-${this.props.resourceName}-${this.props.id}`;
    this.setState({ formKey });
  }
  componentWillUnmount() { }

  onSubmit = () => {
    const item = _try(() => this.props.forms['Components.forms.integrationManager'][this.props.formKey]._values);
    const error = _try(() => this.props.forms['Components.forms.integrationManagerError'][this.props.formKey]._values);

    this.props.setMockResource(this.props.integrationName, this.props.resourceDef.type, item, this.props.id, error);
  };

  onCancel = () => {
    this.setState({
      blurAll: false,
    });
  };

  render() {
    const { policies, resource, status, forError } = this.props;

    let form = _try(() => this.props.forms['Components.forms.integrationManager'][this.props.formKey]) || {};
    if (forError) form = _try(() => this.props.forms['Components.forms.integrationManagerError'][this.props.formKey], {});
    const error = status.updatingError;
    const updating = status.updating;
    const updateDisabled = updating || !form._allValid || form._allInitial;

    return (
      <div className="p-3 pt-4 components_entities_integrationManager">
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
          <Components.overviews.integrationManager
            data={resource}
            resourceDef={this.props.resourceDef}
          />
          <Components.forms.integrationManager
            formKey={this.props.formKey}
            initialData={resource}
          />
          { /* forError /*
            <Components.overviews.integrationManagerError
              integrationName={this.props.integrationName}
              resourceName={this.props.resourceName}
              id={resource.id}
            />
          */ }

        </Components.entities.entitywrapper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_integrationManager);


