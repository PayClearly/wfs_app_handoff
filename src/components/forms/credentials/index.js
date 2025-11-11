import { connect, Component, bindActionCreators, Fragment } from 'component';
import Utils from 'utils';
import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    form: _try(() => state.forms['Components.forms.credentials'][Utils.getFormKey(props)], {}),
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

class components_forms_credentials extends Component {

  state = {
    name: 'Components.forms.credentials',
  }

  componentDidMount() {
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    this.initializeForm(this.props);

    if (_try(() => this.props.parent.formName && this.props.parent.formKey)) {
      this.props.addChild(this.props.parent.formName, this.props.parent.formKey, this.state.name, key);
    }
  }
  componentWillReceiveProps(nextProps = {}) {
    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, Utils.getFormKey(this.props), this.props.form._values);
    }

    if (nextProps.credentialSchemaFields && nextProps.credentialSchemaFields && nextProps.credentialSchemaFields !== this.props.credentialSchemaFields && !(Object.keys(nextProps.credentialSchemaFields).length === 0 && Object.keys(this.props.credentialSchemaFields).length === 0)) {
      this.props.destroy(this.state.name, Utils.getFormKey(this.props));
      this.initializeForm(nextProps);
    }
  }
  componentWillUnmount() {
    this.props.destroy(this.state.name, Utils.getFormKey(this.props));
  }

  initializeForm(props) {
    const {
      initialize,
      validate,
      credentialSchemaFields,
      blurOnInit,
    } = props;

    const key = Utils.getFormKey(props);
    const initialFields = this.initializeFields(credentialSchemaFields || {});
    initialize(this.state.name, key, initialFields);
    validate(this.state.name, key, this.validate(credentialSchemaFields));
    if (blurOnInit) {
      this.props.blur(this.state.name, key, initialFields);
    }
  }

  initializeFields = (credentialSchemaFields) => {
    const initialFields = {};
    Object.keys(credentialSchemaFields || {}).forEach((key) => {
      const field = credentialSchemaFields[key];
      switch (field.fieldType) {
        case 'date':
          initialFields[field.key] = new Date((this.props.initialData && this.props.initialData[field.key]) || new Date());
          break;
        case 'options':
          initialFields[field.key] = field.options.split(',').find((option) => { return option === (this.props.initialData && this.props.initialData[field.key]); }) || field.options.split(',')[0];
          break;
        default:
        case 'number':
        case 'string':
          initialFields[field.key] = (this.props.initialData && this.props.initialData[field.key]) || '';
          break;
      }
    });

    return initialFields;
  };

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      const fields = {};
      fields[field] = value;

      this.props[action](this.state.name, Utils.getFormKey(this.props), fields);
      this.props.validate(this.state.name, Utils.getFormKey(this.props), this.validate(this.props.credentialSchemaFields));
    } else {
      this.props[action](this.state.name, Utils.getFormKey(this.props), field);
    }
  };

  checkType = (type, against) => {
    return Utils.typesvalidator.validateType(this.props.types, type, against).valid;
  };

  validate = (fields) => {

    return (values) => {
      const errors = {};
      Object.keys(values).forEach((key) => {
        const field = fields[key];

        switch (field.fieldType) {
          case 'date':
            if (field.required && !values[key]) {
              errors[key] = 'This field is required';
            }
            if (values[key].getTime() < Date.now() + _1Day) {
              errors[key] = 'Must be later than today';
            }
            if (values[key].getTime() > (Date.now() + _180Days)) {
              errors[key] = 'Must be less then 180 days in the future';
            }
            break;
          default:
            if (field.required && !values[key]) {
              errors[key] = 'This field is required';
            }
            break;
        }

        if (this.props.customValidate) {
          const error = this.props.customValidate(field, values[key]);
          if (error) errors[key] = error;
        }

      });

      return errors;
    };

  };

  renderFields = () => {
    const { form, credentialSchemaFields, standardCredentialFields } = this.props;
    if (!credentialSchemaFields) {
      return (<span />);
    }
    return Object.keys(credentialSchemaFields).map((key) => {
      const field = credentialSchemaFields[key];
      const formAction = this.standardFormAction;
      if (!form[key]) {
        return (<span />);
      }
      return (
        <Components.forms.components.dynamicfield
          field={{ ...field, name: standardCredentialFields[key].name }}
          fieldKey={key}
          form={form}
          formAction={formAction}
          disabled={this.props.disabled}
          disablePrefix={this.props.disablePrefix}
        />
      );
    });
  };

  render() {
    const { form } = this.props;
    if (!form._key) return null;

    return (
      <form className="components_forms_credentials floating-labels">
        <div className="row">
          {this.renderFields()}
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_forms_credentials);

// Internal Helper Functions ... 
const _1Day = 1 * 24 * 60 * 60 * 1000;
const _180Days = 180 * 24 * 60 * 60 * 1000;

