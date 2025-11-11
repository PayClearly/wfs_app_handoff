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
    types: state.validations.data.item,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_sendemail extends Component {
  state = {
    name: 'Components.forms.sendemail',
  };

  componentDidMount() {
    const { initialize, validate } = this.props;
    const formKey = this.props.formKey || 'default';

    let emails = '';

    if (this.props.type && this.props.type === 'confirmation') {
      emails = this.props.vendor && this.props.vendor.repEmail || '';
    }

    initialize(this.state.name, formKey, {
      emails,
    });
    validate(this.state.name, formKey, this.validate);

    this.setState({ key: formKey });
  }

  componentWillReceiveProps(nextProps = {}) {
    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, this.state.key, this.props.forms[this.state.name][this.state.key]._values);
    }

    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][nextProps.formKey || 'default'],
      key: nextProps.formKey || 'default',
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

    if (values.emails) {
      const emails = values.emails.split(',');
      if (emails.some((email) => { return !this.checkType('EmailAddress', email); })) {
        errors.emails = emails.length > 1 ? 'All emails must be valid email addresses' : Utils.typesvalidator.validationErrorMsgs.email;
      }
    } else {
      errors.emails = 'At least one valid email address is required';
    }

    return errors;
  }

  render() {
    const form = this.state.form;
    if (!form) return null;

    let label = 'On The Way Notification Emails';

    if (this.props.type && this.props.type === 'confirmation') {
      label = 'Confirmation Delivery Emails';
    }

    return (
      <form className="floating-labels components_forms_sendemail">
        <Components.forms.components.textinput
          form={form}
          field="emails"
          action={this.standardFormAction}
          label={label}
          hideError={!form.emails.touched}
          detailedInformation="Comma separate multiple emails, i.e. x,y,z"
          disabled={this.props.disabled}
        />
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_sendemail);


