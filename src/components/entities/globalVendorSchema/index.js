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
    status: state.global.schemas.status,
    schemas: state.global.schemas.data.items,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    updateSchema: (id, data) => {
      return dispatch(Store.global.updateGlobalVendorSchema(id, data));
    },
    clearStatusErrors: () => {
      return dispatch(Store.global.clearErrorsGlobalVendorSchemas());
    },
  });
};

class components_entities_globalVendorSchema extends Component {
  state = {
    editBtnText: 'Edit',
  };




  onSubmit = () => {
    const { id } = this.props;
    const formKey = id;

    const values = _try(() => this.props.forms['Components.forms.globalVendorSchema'][formKey]._values);
    if (!values) return;

    const customFields = Object.keys(this.props.forms['Components.forms.createcustomfield'] || {}).filter((key) => {
      return key.split('_')[0] === formKey;
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


    this.props.updateSchema(id, data);
  };

  onCancel = () => {
    this.setState({
      blurAll: false,
    });
  };

  render() {
    const { schemas, policies, status, id, forms } = this.props;

    const formKey = id;
    const form = _try(() => forms['Components.forms.globalVendorSchema'][formKey]) || {};
    const customFieldForms = Object.keys(forms['Components.forms.createcustomfield'] || {}).filter((key) => {
      return key.split('_')[0] === formKey;
    }).map((key) => {
      return _try(() => forms['Components.forms.createcustomfield'][key]) || {};
    });
    const customFieldFormsNotValid = customFieldForms.some((customFieldFrom) => {
      return !customFieldFrom._allValid;
    });

    const error = status.updatingError;
    const updating = status.updating;

    const updateDisabled = updating || !form._allValid || customFieldFormsNotValid;

    const schema = schemas[id] || {};

    return (
      <div className="p-3 pt-4 components_entities_globalVendorSchema">
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
          <Components.overviews.globalVendorSchema
            id={id}
          />
          <Components.forms.globalVendorSchema
            blurAll={this.state.blurAll}
            initialFormData={schema}
            formKey={formKey}
          />
        </Components.entities.entitywrapper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_globalVendorSchema);


