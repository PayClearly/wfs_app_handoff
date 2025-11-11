import { connect, Component, bindActionCreators, Fragment } from 'component';
import Utils from 'utils';
import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    types: state.validations.data.item,
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

class components_forms_vendorRemittanceFields extends Component {

  state = {
    name: 'Components.forms.vendorRemittanceFields',
    key: 'default',
  }

  componentDidMount() {
    const {
      initialize,
      validate,
      initialData = {},
      fields = {},
    } = this.props;

    const key = this.props.formKey || this.state.key;
    this.setState({ key });

    const data = Object.values(fields).reduce((acc, curr) => {
      acc[curr.key] = initialData[curr.key] || null;
      return acc;
    }, {});

    initialize(this.state.name, key, data);
    validate(this.state.name, key, this.validate);

    this.props.blur(this.state.name, this.props.formKey, data);
  }

  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  validate = (fields) => {
    const errors = {};

    Object.entries(fields).forEach((field) => {
      const key = field.key;
      const value = field.value;
      const required = field.required;

      if (required && !value) errors[key] = 'This field is required';
    });

    return errors;
  }

  standardFormAction = (action, field, value) => {
    const form = _try(() => this.props.forms[this.state.name][this.state.key], null);
    if (!form) return null;

    const fields = {};
    fields[field] = value;

    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, fields);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  }

  render() {
    const form = _try(() => this.props.forms[this.state.name][this.state.key], null);
    if (!form) return null;

    return (
      <form className="floating-labels components_forms_vendorRemittanceFields">
        {
          Object.values(this.props.fields).map((field, index) =>
          (
            <div className="row">
              <div className="col-xs-10 col-md-12">
                <Components.forms.components.textinput
                  form={form}
                  type="text"
                  field={field.key}
                  action={this.standardFormAction}
                  label={field.name}
                  hideError={form[field.key] && !form[field.key].touched}
                  disabled={this.props.disabled}
                  required
                />
              </div>
            </div>
          ))
        }
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_forms_vendorRemittanceFields);


