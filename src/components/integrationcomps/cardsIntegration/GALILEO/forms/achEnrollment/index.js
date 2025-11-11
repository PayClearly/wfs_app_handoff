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

class components_integrationcomps_cardsIntegration_GALILEO_forms_achEnrollment extends Component {

  state = {
    name: 'Components.integrationcomps.cardsIntegration.GALILEO.forms.achEnrollment',
  }

  componentDidMount() {
    const { initialize, validate } = this.props;
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';
    const initialData = this.props.initialData || {
      name: '',
      type: '',
      routingNumber: '',
      accountNumber: '',
      accountNumberVerify: '',
    };

    initialize(this.state.name, key, initialData);
    validate(this.state.name, key, this.validate);
  }
  componentWillReceiveProps(nextProps = {}) {
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';
    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][key],
      key,
    });

    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, this.state.key, this.props.forms[this.state.name][this.state.key]._values);
    }
  }
  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, field, value);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  checkType = (type, against) => {
    return Utils.typesvalidator.validateType(this.props.types, type, against).valid;
  };

  validate = (values) => {
    const errors = {};

    if (values.name && values.name.length > 22) {
      errors.name = 'Must be at most 22 characters';
    }

    return errors;
  };

  render() {
    const form = this.state.form;
    if (!form) return null;
    return (
      <form className="floating-labels components_integrationcomps_cardsIntegration_GALILEO_forms_achEnrollment">
        <div className="row">
          <div className="col-sm-12 col-md-6">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="name"
              action={this.standardFormAction}
              label="Account Name"
              disabled={this.props.disabled}
              hideError={!form.name.touched}
              required
            />
          </div>
          <div className="col-sm-12 col-md-6">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="type"
              action={this.standardFormAction}
              label="Account Type"
              disabled={this.props.disabled}
              hideError={!form.type.touched}
              required
            />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-6">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="accountNumber"
              action={this.standardFormAction}
              label="Account Number"
              disabled={this.props.disabled}
              hideError={!form.accountNumber.touched}
              required
            />
          </div>
          <div className="col-sm-12 col-md-6">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="accountNumberVerify"
              action={this.standardFormAction}
              label="Account Number Verify"
              disabled={this.props.disabled}
              hideError={!form.accountNumberVerify.touched}
              required
            />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-6">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="routingNumber"
              action={this.standardFormAction}
              label="Routing Number"
              disabled={this.props.disabled}
              hideError={!form.routingNumber.touched}
              required
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_integrationcomps_cardsIntegration_GALILEO_forms_achEnrollment);


