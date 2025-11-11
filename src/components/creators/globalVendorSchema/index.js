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
    status: state.global.schemas.status,
    schemas: state.global.schemas.data.items,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    createGlobalVendorSchema: (data) => {
      return dispatch(Store.global.createGlobalVendorSchema(data));
    },
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
    clearStatusErrors: () => {
      dispatch(Store.global.clearErrorsGlobalVendorSchemas());
    },
  });
};

class components_creators_globalVendorSchema extends Component {

  state = {
    showCreatedNotification: false,
    formKey: `${Date.now()}`,
  };




  onCreate = () => {
    this.props.resetForm('Components.forms.globalVendorSchema', this.state.formKey, {
      name: '',
      active: true,
    });

    this.setState(() => {
      return {
        showCreatedNotification: true,
        resetForm: true,
      };
    }, () => {
      this.setState({ resetForm: false });
    });
  };

  submit = () => {
    const values = _try(() => this.props.forms['Components.forms.globalVendorSchema'][this.state.formKey]._values);
    if (!values) return;

    const customFields = Object.keys(this.props.forms['Components.forms.createcustomfield'] || {}).filter((key) => {
      return key.split('_')[0] === this.state.formKey;
    }).reduce((acc, key) => {
      const _values = _try(() => this.props.forms['Components.forms.createcustomfield'][key]._values) || {};
      if (_values.fieldName) {
        acc[_values.fieldName] = {
          name: _values.fieldName,
          fieldType: _values.fieldType,
          required: _values.isFieldRequired || false,
          options: _values.hiddenOptions || null,
        };
      }
      return acc;
    }, {});

    const data = {
      name: values.name,
      active: values.active,
      customFields,
    };

    this.props.createGlobalVendorSchema(data);
    this.setState({ showCreatedNotification: false });
  };

  render() {
    const { status, forms } = this.props;

    const form = _try(() => forms['Components.forms.globalVendorSchema'][this.state.formKey]) || {};
    const customFieldForms = Object.keys(forms['Components.forms.createcustomfield'] || {}).filter((key) => {
      return key.split('_')[0] === this.state.formKey;
    }).map((key) => {
      return _try(() => forms['Components.forms.createcustomfield'][key]) || {};
    });
    const customFieldFormsNotValid = customFieldForms.some((customFieldFrom) => {
      return !customFieldFrom._allValid;
    });
    const error = status.creatingError;
    const creating = status.creating;
    const disabled = creating || !form._allValid || form._allInitial || customFieldFormsNotValid;

    return (
      <Fragment>
        <Components.creators.creatorwrapper
          className="components_creators_globalVendorSchema"
          canCreate={this.props.policies.canCreate}
          createFormActive={!this.props.hideCreateForm}
          status={this.props.status}
          onCreate={this.onCreate}
          clearStatusErrors={this.props.clearStatusErrors}
        >
          <Fragment>
            <Components.forms.globalVendorSchema
              formKey={this.state.formKey}
              resetCustomForms={this.state.resetForm}
            />
            {error &&
              <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Something Went Wrong</h4>
                Error: {error}
              </div>
            }
            {this.state.showCreatedNotification &&
              <div className="alert alert-primary" role="alert">
                Payment Field Schema successfully created! You can edit payment field schemas below, or create another.
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
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_creators_globalVendorSchema);


