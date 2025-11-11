import { connect, Component, bindActionCreators, Fragment } from 'component';
import Utils from 'utils';
import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    form: _try(() => state.forms['Components.forms.globalCredentialSchema'][Utils.getFormKey(props)], {}),
    types: state.validations.data.item,
    standardCredentialFields: _resolve(state, 'global.standardCredentialFields.data.items', {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    ...bindActionCreators(Store.forms, dispatch),
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_forms_globalCredentialSchema extends Component {
  state = {
    name: 'Components.forms.globalCredentialSchema',
  }

  componentDidMount() {
    const { initialize, validate, standardCredentialFields } = this.props;
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';
    const initialData = this.props.initialData || {};
    const credentialFields = initialData.fields || {};

    initialize(this.state.name, key, Object.values(standardCredentialFields).reduce((acc, field) => {
      acc[`${field.key}IsUsed`] = credentialFields[field.key] || false;
      acc[`${field.key}IsRequired`] = credentialFields[field.key] ? credentialFields[field.key].required : false;

      return acc;
    }, { name: initialData.name || '', active: Object.prototype.hasOwnProperty.call(initialData, 'active') ? !!initialData.active : true }));
    validate(this.state.name, key, this.validate);

    if (_try(() => this.props.parent.formName && this.props.parent.formKey)) {
      this.props.addChild(this.props.parent.formName, this.props.parent.formKey, this.state.name, key);
    }
  }
  componentWillReceiveProps(nextProps = {}) {
    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, Utils.getFormKey(this.props), this.props.form._values);
    }
  }
  componentWillUnmount() {
    this.props.destroy(this.state.name, Utils.getFormKey(this.props));
  }

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      const fields = {};
      fields[field] = value;

      if (field.split('IsUsed').length && value === false) {
        const [key] = field.split('IsUsed');
        fields[[`${key}IsRequired`]] = false;
      }

      this.props[action](this.state.name, Utils.getFormKey(this.props), fields);
      this.props.validate(this.state.name, Utils.getFormKey(this.props), this.validate);
    } else {
      this.props[action](this.state.name, Utils.getFormKey(this.props), field);
    }
  };

  checkType = (type, against) => {
    return Utils.typesvalidator.validateType(this.props.types, type, against).valid;
  };

  validate = (values) => {
    const errors = {};

    if (!values.name.length) {
      errors.name = 'Name is required';
    }

    Object.values(this.props.standardCredentialFields).forEach((standardCredentialField) => {
      if (!values[`${standardCredentialField.key}IsUsed`] && values[`${standardCredentialField.key}IsRequired`]) errors[`${standardCredentialField.key}IsUsed`] = 'Field cannot be required if not made available';
    });

    return errors;
  };

  render() {
    const { form } = this.props;
    if (!form._key) return null;

    return (
      <form className="components_forms_globalCredentialSchema floating-labels pt-2">
        <div className="row">
          <div className="col-12 col-md-9">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="name"
              action={this.standardFormAction}
              label="Name"
              hideError={!form.name.touched}
              required
            />
          </div>
          <div className="col-12 col-md-3">
            <Components.forms.components.switch
              form={form}
              type="text"
              field="active"
              action={this.standardFormAction}
              label="Active"
              hideError={!form.active.touched}
              required
            />
          </div>
        </div>
        <div className="row">
          {Object.values(this.props.standardCredentialFields).map((standardCredentialField) => {
            return (
              <div className="col-12 col-md-6 mb-3">
                <div className="card card-with-label small-padding">
                  <p className="card-label px-1"><strong>{standardCredentialField.name} ({standardCredentialField.key})</strong></p>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-12 col-md-6">
                        <Components.forms.components.switch
                          form={form}
                          field={`${standardCredentialField.key}IsUsed`}
                          action={this.standardFormAction}
                          label="Enabled"
                          disabled={this.props.updating}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <Components.forms.components.switch
                          form={form}
                          field={`${standardCredentialField.key}IsRequired`}
                          action={this.standardFormAction}
                          label="Required Field"
                          disabled={this.props.updating || !form._values[`${standardCredentialField.key}IsUsed`]}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_forms_globalCredentialSchema);


