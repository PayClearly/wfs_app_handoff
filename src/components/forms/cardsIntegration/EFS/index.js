import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

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

const mapDispatchToProps = { ...Store.forms };

class components_forms_cardsIntegration_EFS extends Component {

  state = {
    name: 'Components.forms.cardsIntegration.EFS',
  };

  componentDidMount() {
    const { initialize, validate } = this.props;
    const key = this.props.formKey || 'default';

    initialize(this.state.name, key, {
      accountId: this.props.initialFormData.accountId || '',
      companyId: this.props.initialFormData.companyId || '',
      password: this.props.initialFormData.password || '',
      username: this.props.initialFormData.accountId || '',
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
    const { types } = this.props;
    const errors = {};

    if (!values.password) {
      errors.password = 'Password is required';
    }

    return errors;
  };

  render() {
    const form = this.state.form;
    if (!form) return null;

    return (
      <Fragment>
        <form className="floating-labels">
          <div className="row">
            <div className="col-sm">
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="accountId"
                action={this.standardFormAction}
                label="Account ID"
                disabled={this.props.disabled}
                hideError={!form.accountId.touched}
              />
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="companyId"
                action={this.standardFormAction}
                label="Company ID"
                disabled={this.props.disabled}
                hideError={!form.companyId.touched}
              />
            </div>
            <div className="col-sm">
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="username"
                action={this.standardFormAction}
                label="Username"
                disabled={this.props.disabled}
                hideError={!form.username.touched}
              />
              <Components.forms.components.textinput
                form={form}
                type="password"
                field="password"
                action={this.standardFormAction}
                label="Password"
                disabled={this.props.disabled}
                hideError={!form.password.touched}
              />
            </div>
          </div>
        </form>
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_cardsIntegration_EFS);


