import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import FuzzySet from 'fuzzyset.js';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_custom extends Component {
  state = {
    name: 'Components.forms.custom',
  };

  componentDidMount() {
    this.initializeForm(this.props);
  }

  componentWillReceiveProps(nextProps = {}) {
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, key, this.props.forms[this.state.name][key]._values);
    }

    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][key],
      key,
    });

    // if the intial data changed then re initilize the form
    if (nextProps.fields && nextProps.fields && nextProps.fields !== this.props.fields && !(Object.keys(nextProps.fields).length === 0 && Object.keys(this.props.fields).length === 0)) {
      this.props.destroy(this.state.name, this.state.key);
      this.initializeForm(nextProps);
    }
  }

  componentDidUpdate(prevProps = {}) {
    // this is used by the payment form to retrigger the custom field form validation for check number collisions
    if (this.props.validationTrigger !== prevProps.validationTrigger) {
      this.props.validate(this.state.name, this.state.key, this.validate(this.props.fields));
    }
  }

  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  initializeForm(props) {
    const {
      initialize,
      validate,
      fields,
      blurOnInit,
    } = props;

    const key = props.formKey || 'default';
    const initialFields = this.initializeFields(fields || {});
    initialize(this.state.name, key, initialFields);
    validate(this.state.name, key, this.validate(fields));

    if (blurOnInit) {
      props.blur(this.state.name, key, initialFields);
    }
  }

  validate = (fields) => {

    return (values) => {
      const errors = {};
      Object.keys(values).forEach((key) => {
        const field = fields[key];

        if (field.name.includes('efs-customField')) {
          if (field.fieldType !== 'string') {
            errors[field.name] = 'EFS custom fields must be strings';
          }
          if (field.fieldType === 'string' && values[key].length > 20) {
            errors[field.name] = 'EFS custom fields have a 20 character max';
          }
        }

        switch (field.fieldType) {
          case 'date':
            if (field.required && !values[key]) {
              errors[field.name] = 'This field is required';
            }
            if (values[key].getTime() < Date.now() + _1Day) {
              errors[field.name] = 'Must be later than today';
            }
            if (values[key].getTime() > (Date.now() + _180Days)) {
              errors[field.name] = 'Must be less then 180 days in the future';
            }
            break;
          default:
            if (field.required && !values[key]) {
              errors[field.name] = 'This field is required';
            }
            break;
        }

        if (this.props.customValidate) {
          const error = this.props.customValidate(field, values[key]);
          if (error) errors[field.name] = error;
        }

      });

      return errors;
    };

  };

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, field, value);
      this.props.validate(this.state.name, this.state.key, this.validate(this.props.fields));
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  initializeFields = (fields) => {
    const { requireExactMatch } = this.props;
    const initialFields = {};
    // { 
    //   Invoice Number:
    //     fieldType: "string"
    //     name: "Invoice Number"
    //     required: true
    // }
    // {
    //   invoiceNumber: 'asdf1234',
    // }
    Object.keys(fields || {}).forEach((key) => {
      const field = fields[key];
      const match = requireExactMatch ? key : _fuzzyMatch(key, Object.keys(this.props.initialData || {}));

      switch (field.fieldType) {
        case 'number':
        case 'string':
          initialFields[field.name] = (this.props.initialData && this.props.initialData[match]) || '';
          break;
        case 'date':
          initialFields[field.name] = new Date((this.props.initialData && this.props.initialData[match]) || new Date());
          break;
        case 'options':
          initialFields[field.name] = field.options.split(',').find((option) => { return option === (this.props.initialData && this.props.initialData[match]); }) || field.options.split(',')[0];
          break;
        case 'static':
          initialFields[field.name] = field.options;
          break;
        default:
          break;
      }
    });

    return initialFields;
  };

  renderFields = (fields, form) => {
    if (!fields) {
      return (<span />);
    }
    return Object.keys(fields).map((key) => {
      const field = fields[key];
      const formAction = this.standardFormAction;
      if (!form[key]) {
        return (<span />);
      }
      const disabled = field.fieldType === 'static' || this.props.disabled;
      return (
        <Components.forms.components.dynamicfield
          field={field}
          fieldKey={key}
          form={this.state.form}
          formAction={formAction}
          disabled={disabled}
          disablePrefix={this.props.disablePrefix}
        />
      );
    });
  };

  render() {
    const form = this.state.form;

    if (!form || !this.props.isShowing) return null;

    return (
      <form className="floating-labels">
        <div className="row">
          {this.renderFields(this.props.fields, form)}
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_custom);

// Internal Helper Functions ... 
const _1Day = 1 * 24 * 60 * 60 * 1000;
const _180Days = 180 * 24 * 60 * 60 * 1000;

// GENERATOR_TYPE='component';
const _fuzzyMatch = (key, fields = []) => {
  const fuzzySet = FuzzySet(fields);
  const result = fuzzySet.get(key, null, 0.5);
  return result ? result[0][1] : key;
};
