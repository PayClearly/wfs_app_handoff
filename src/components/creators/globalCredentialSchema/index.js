import { connect, Component, bindActionCreators, Fragment } from 'component';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    policies: Selectors.entity('globalVendors_*')(state),
    status: state.global.credentialSchemas.status,
    standardCredentialFields: _resolve(state, 'global.standardCredentialFields.data.items', {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    create: (data) => {
      return dispatch(Store.global.createGlobalCredentialSchema(data));
    },
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
    blurForm: (name, key, fields) => {
      dispatch(Store.forms.blur(name, key, fields));
    },
    clearStatusErrors: () => {
      dispatch(Store.global.clearErrorsGlobalCredentialSchemas());
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_creators_globalCredentialSchema extends Component {

  constructor(props) {
    super(props);
    this.state = {
      formName: 'Components.forms.globalCredentialSchema',
      formKey: props.formKey || 'create',
    };
  }




  onCreate = () => {
    this.props.resetForm(this.state.formName, this.state.formKey, Object.keys(this.props.forms[this.state.formName][this.state.formKey]._values).reduce((acc, cur) => { acc[cur] = undefined; return acc; }, {}));
  };

  onDisabledClick = () => {
    this.props.blurForm(this.state.formName, this.state.formKey, this.props.forms[this.state.formName][this.state.formKey]._values);
  }

  onSubmit = () => {
    const values = _try(() => this.props.forms[this.state.formName][this.state.formKey]._values, {});

    const data = {
      name: values.name,
      active: values.active,
      fields: Object.values(this.props.standardCredentialFields).reduce((acc, field) => {
        if (values[`${field.key}IsUsed`]) {
          acc[field.key] = {
            key: field.key,
            required: values[`${field.key}IsRequired`] || null,
          };
        }

        return acc;
      }, {}),
    };

    return this.props.create(data);
  }

  render() {
    const { status } = this.props;
    const error = status.creatingError;
    const { canCreate } = this.props.policies;
    if (!canCreate) return <Components.invalidpermissions />;

    const form = _try(() => this.props.forms[this.state.formName][this.state.formKey], {});

    return (
      <Components.creators.creatorwrapper
        className="components_creators_globalCredentialSchema"
        canCreate={canCreate}
        createFormActive={!this.props.hideCreateForm}
        status={status}
        onCreateNotification="Credential Schema successfully created!"
        createDisabled={!form._allValid || form._allInitial || status.creating}
        clearStatusErrors={this.props.clearStatusErrors}
        includeButton

        onCreate={this.onCreate}
        onDisabledClick={this.onDisabledClick}
        onSubmit={this.onSubmit}
      >
        <Fragment>
          <Components.forms.globalCredentialSchema
            formKey={this.state.formKey}
          />
          {error &&
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Something Went Wrong</h4>
              Error: {error}
            </div>
          }
        </Fragment>
      </Components.creators.creatorwrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_creators_globalCredentialSchema);


