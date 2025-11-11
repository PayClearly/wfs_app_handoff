import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

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

class components_forms_createApiKey extends Component {
  state = {
    name: 'Components.forms.createApiKey',
  }

  componentDidMount() {
    const {
      initialize,
      validate,
    } = this.props;

    const key = this.props.formKey || 'default';

    initialize(this.state.name, key, {
      description: '',
    });

    validate(this.state.name, key, this.validate);
  }

  componentWillReceiveProps(nextProps) {
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

  validate = (values) => {
    const errors = {};

    if (!values.description || values.description === '') {
      errors.description = 'Please enter a description';
    }

    if (values.description.length > 100) {
      errors.description = 'Decription must be fewer than 100 characters';
    }

    return errors;
  }

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, field, value);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  }

  render() {
    const { form } = this.state;
    if (!form) return null;

    return (
      <div className="components_forms_createApiKey floating-labels pt-3">
        <Components.forms.components.textinput
          form={form}
          field="description"
          type="text"
          action={this.standardFormAction}
          label="Description"
          placeholder="What is this key for?"
          disabled={this.props.disabled}
          hideError={!form.description.touched}
          required
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_createApiKey);


