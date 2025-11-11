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

const mapDispatchToProps = { ...Store.forms };

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_forms_erpIntegration_ADVANTAGE extends Component {

  state = {
    name: 'Components.forms.erpIntegration.ADVANTAGE',
  };

  componentDidMount() {
    const { initialize, validate } = this.props;
    const key = this.props.formKey || 'default';

    initialize(this.state.name, key, {
      serverName: _try(() => this.props.initialFormData.serverName) || '',
      databaseName: _try(() => this.props.initialFormData.databaseName) || '',
      username: _try(() => this.props.initialFormData.username) || '',
      password: _try(() => this.props.initialFormData.password) || '',
      host: _try(() => this.props.initialFormData.host) || '',
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

    Object.keys(values).forEach((key) => {
      if (!values[key]) errors[key] = 'This field is required';
    });

    return errors;
  };

  render() {
    const form = this.state.form;
    if (!form) return null;

    return (
      <form className="floating-labels components_forms_erpIntegration_ADVANTAGE">
        <br />
        <div className="row">
          <div className="col-sm">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="host"
              action={this.standardFormAction}
              label="Host"
              disabled={this.props.disabled}
              hideError={!form.host.touched}
              required
            />
          </div>
        </div>
        <div className="row">
          <div className="col-sm">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="serverName"
              action={this.standardFormAction}
              label="Server Name"
              disabled={this.props.disabled}
              hideError={!form.serverName.touched}
              required
            />
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="databaseName"
              action={this.standardFormAction}
              label="Database Name"
              disabled={this.props.disabled}
              hideError={!form.databaseName.touched}
              required
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
              required
            />
            <Components.forms.components.textinput
              form={form}
              type="password"
              field="password"
              action={this.standardFormAction}
              label="Password"
              disabled={this.props.disabled}
              hideError={!form.password.touched}
              required
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_erpIntegration_ADVANTAGE);


