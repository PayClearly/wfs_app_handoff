import { connect, Component, bindActionCreators, Fragment } from 'component';
import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    derived: _try(() => Selectors.uploaders.clientForm(Utils.getFormKey(props))(state), null),
    form: _try(() => state.forms['Components.forms.client'][Utils.getFormKey(props)], {}),
    types: state.validations.data.item,
    clientsCollections: _resolve(state, 'account.clients.collections', {}),
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

class components_forms_client extends Component {

  state = {
    name: 'Components.forms.client',
  }

  componentDidMount() {
    const { initialize, validate, blurOnInit } = this.props;
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';
    const initialData = this.props.initialData || {};

    const formInitData = {
      name: initialData.name || '',
      displayName: initialData.displayName || '',
      contactName: initialData.contactName || '',
      contactEmail: initialData.contactEmail || '',
    };

    initialize(this.state.name, key, formInitData);
    validate(this.state.name, key, this.validate);

    if (_try(() => this.props.parent.formName && this.props.parent.formKey)) {
      this.props.addChild(this.props.parent.formName, this.props.parent.formKey, this.state.name, key);
    }

    if (blurOnInit) {
      this.props.blur(this.state.name, Utils.getFormKey(this.props), formInitData);
    }
  }
  componentWillReceiveProps(nextProps = {}) {
    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, Utils.getFormKey(this.props), this.props.form._values);
    }
  }
  componentDidUpdate(prevProps = {}) {
    if (this.props.duplicateNamesUsedInUpload && prevProps.duplicateNamesUsedInUpload && Object.keys(this.props.duplicateNamesUsedInUpload).length !== Object.keys(prevProps.duplicateNamesUsedInUpload).length) {
      this.props.validate(this.state.name, Utils.getFormKey(this.props), this.validate);
    }
  }
  componentWillUnmount() {
    this.props.destroy(this.state.name, Utils.getFormKey(this.props));
  }

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      const fields = {};
      fields[field] = value;

      this.props[action](this.state.name, Utils.getFormKey(this.props), fields);
      this.props.validate(this.state.name, Utils.getFormKey(this.props), this.validate);
    } else {
      this.props[action](this.state.name, Utils.getFormKey(this.props), field);
    }
  };

  checkType = (type, against) => {
    return Utils.typesvalidator.validateType(this.props.types, type, against).valid;
  };

  validate = (values) => {
    const errors = {};

    if (!values.name) {
      errors.name = 'This field is required';
    }

    if (values.name && this.props.clientsCollections.names[values.name] && !this.props.forUpdate) {
      errors.name = 'This client already exists';
    } else if (values.name && !this.props.forUpdate && this.props.duplicateNamesUsedInUpload) {
      const duplicateNameInUpload = Object.keys(this.props.duplicateNamesUsedInUpload).some((name) => {
        return values.name === name;
      });
      if (duplicateNameInUpload) errors.name = 'This client is duplicated in current upload';
    }

    if (values.contactEmail && !this.checkType('EmailAddress', values.contactEmail)) {
      errors.contactEmail = Utils.typesvalidator.validationErrorMsgs.email;
    }

    return errors;
  };

  render() {
    const { form } = this.props;
    if (!form._key) return null;

    return (
      <form className="components_forms_client floating-labels">
        <div className="row">
          <div className="col-12 col-md">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="name"
              action={this.standardFormAction}
              label="Name"
              disabled={this.props.forUpdate || this.props.disabled}
              hideError={!form.name.touched}
              required
            />
          </div>
          <div className="col-12 col-md">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="displayName"
              action={this.standardFormAction}
              label="Display Name (Optional)"
              disabled={this.props.disabled}
              hideError={!form.displayName.touched}
            />
          </div>
          <div className="col-12 col-md">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="contactName"
              action={this.standardFormAction}
              label="Contact Name"
              disabled={this.props.disabled}
              hideError={!form.contactName.touched}
            />
          </div>
          <div className="col-12 col-md">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="contactEmail"
              action={this.standardFormAction}
              label="Contact Email"
              disabled={this.props.disabled}
              hideError={!form.contactEmail.touched}
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_forms_client);


