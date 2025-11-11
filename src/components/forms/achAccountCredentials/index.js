import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Utils from 'utils';
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

const bankTypeOptions = {
  Checking: {
    display: 'Checking',
  },
  Savings: {
    display: 'Savings',
  },
};

class components_forms_achAccountCredentials extends Component {
  state = {
    name: 'Components.forms.achAccountCredentials',
  };

  componentDidMount() {
    const { initialize, validate } = this.props;
    const key = this.props.formKey || 'default';

    initialize(this.state.name, key, {
      name: '',
      type: '',
      routingNumber: '',
      accountNumber: '',
      accountNumberVerify: '',
    });
    validate(this.state.name, key, this.validate);
  }

  componentWillReceiveProps(nextProps = {}) {
    const key = nextProps.formKey || 'default';
    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][key],
      key,
    });
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

    if (typeof values.name !== 'string') {
      errors.name = Utils.typesvalidator.validationErrorMsgs.string;
    }

    if (values.name.length < 3 || values.name.length > 50) {
      errors.name = 'Must be 3 to 50 characters';
    }

    if (/^[0-9]{9}$/.test(values.routingNumber) !== true) {
      errors.routingNumber = 'Must be 9 digits';
    }

    if (/^[0-9]{3,17}$/.test(values.accountNumber) !== true) {
      errors.accountNumber = 'Must be 3 to 17 digits';
    }

    if (values.accountNumberVerify !== values.accountNumber) {
      errors.accountNumberVerify = 'Account numbers do not match';
    }

    return errors;
  };

  render() {
    const form = this.state.form;
    if (!form) return null;

    return (
      <Fragment>
        <form className="floating-labels components_forms_achAccountCredentials">
          <div className="row">
            <div className="col-sm-12 col-md-6">
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="name"
                action={this.standardFormAction}
                label="Name"
                disabled={this.props.disabled}
                hideError={!form.name.touched}
                required
              />
            </div>
            <div className="col-sm-12 col-md-6">
              <Components.forms.components.selectinput
                form={form}
                action={this.standardFormAction}
                label="Type"
                field="type"
                options={bankTypeOptions}
                placeholder={form._values.type || '-'}
                disabled={this.props.disabled}
                hideError={!form.type.touched}
                required
              />
            </div>
            <div className="col-sm-12">
              <Components.forms.components.textinput
                form={form}
                type="number"
                field="routingNumber"
                action={this.standardFormAction}
                label="Routing Number"
                disabled={this.props.disabled}
                hideError={!form.routingNumber.touched}
                required
              />
            </div>
            <div className="col-sm-12">
              <Components.forms.components.textinput
                form={form}
                type="password"
                field="accountNumber"
                action={this.standardFormAction}
                label="Account Number"
                disabled={this.props.disabled}
                hideError={!form.accountNumber.touched}
                required
              />
            </div>
            <div className="col-sm-12">
              <Components.forms.components.textinput
                form={form}
                type="password"
                field="accountNumberVerify"
                action={this.standardFormAction}
                label="Verify Account Number"
                disabled={this.props.disabled}
                hideError={!form.accountNumberVerify.touched}
                required
              />
            </div>
          </div>
        </form>
        <Components.forms.fundingPreferences id="default" />
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_achAccountCredentials);


