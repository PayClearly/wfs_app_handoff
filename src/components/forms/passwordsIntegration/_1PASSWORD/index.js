import { connect, Component, bindActionCreators, Fragment } from 'component';

import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

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

class components_forms_passwordsIntegration_1PASSWORD extends Component {

  state = {
    name: 'Components.forms.passworsdIntegration._1PASSWORD',
  };

  componentDidMount() {
    const { initialize, validate } = this.props;
    const key = this.props.formKey || 'default';

    initialize(this.state.name, key, {
      url: _try(() => this.props.initialFormData.Url) || '',
      token: _try(() => this.props.initialFormData.token) || '',
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
      <form className="floating-labels components_forms_passwordsIntegration_1PASSWORD">
        <br />
        <div className="row">
          <div className="col-sm">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="url"
              action={this.standardFormAction}
              label="Server URL"
              disabled={this.props.disabled}
              hideError={!form.url.touched}
              required
            />
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="token"
              action={this.standardFormAction}
              label="Token"
              disabled={this.props.disabled}
              hideError={!form.token.touched}
              required
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_passwordsIntegration_1PASSWORD);


