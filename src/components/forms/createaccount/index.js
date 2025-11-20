import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import { Collapse } from 'react-collapse';

import Utils from 'utils';
import Store from 'store';
import Components from 'components';


const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    accounts: state.accounts,
    types: state.validations.data.item,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_createaccount extends Component {

  state = {
    name: 'Components.forms.createaccount',
    key: 'default',
  };

  componentDidMount() {
    const { initialize, validate } = this.props;

    initialize(this.state.name, 'default', {
      name: '',
      contactName: '',
      contactEmail: '',
      contactPhoneNumber: '',
      streetAddress: '',
      unit: '',
      city: '',
      state: '',
      zipCode: '',
      externalId: '',
      active: false,
    });

    validate(this.state.name, 'default', this.validate);
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, this.state.key, this.props.forms[this.state.name][this.state.key]._values);
    }

    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][nextProps.formKey || 'default'],
      key: 'default',
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

  validate = (fields) => {
    const errors = {};

    if (!this.checkType(this.props.types.Account.properties.name, fields.name)) {
      errors.name = Utils.typesvalidator.validationErrorMsgs.string;
    }

    if (fields.contactEmail) {
      const invalidItem = fields.contactEmail.split(',').map(item => item.trim()).find(item => !this.checkType('EmailAddress', item));
      if (invalidItem) errors.contactEmail = `${invalidItem} - ${Utils.typesvalidator.validationErrorMsgs.email}`;
    }

    if (fields.contactPhoneNumber) {
      const invalidItem = fields.contactPhoneNumber.split(',').map(item => item.trim()).find(item => !this.checkType('PhoneNumber', item));
      if (invalidItem) errors.contactPhoneNumber = `${invalidItem} - ${Utils.typesvalidator.validationErrorMsgs.phoneNumber}`;
    }

    if (!fields.name) {
      errors.name = 'This field cannot be blank';
    }

    return errors;
  };

  render() {
    const form = this.state.form;
    if (!form) return null;

    const {
      submit,
      accounts,
    } = this.props;

    const creating = accounts.status.creating;
    const createDisabled = creating || !form._allValid;
    const error = accounts.status.creatingError;

    return (
      <div className="floating-labels mt-5">
        <div className="row">
          <div className="col-12 col-md-9">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="name"
              action={this.standardFormAction}
              label="Name"
              disabled={creating}
              hideError={!form.name.touched}
              required
            />
          </div>
          <div className="col-12 col-md-3">
            <Components.forms.components.checkbox
              form={form}
              field="active"
              action={this.standardFormAction}
              label="Active Account"
              disabled={this.props.updating}
            />
          </div>
        </div>
        <Collapse isOpened={form._values.active} >
          <h6>Contact</h6>
          <div className="row mt-3">
            <div className="col-xs-12 col-md-4">
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="contactName"
                action={this.standardFormAction}
                label="Contact Name"
                hideError={!form.contactName.touched}
                disabled={this.props.updating}
              />
            </div>
            <div className="col-xs-12 col-md-4">
              <Components.forms.components.textinput
                form={form}
                type="email"
                field="contactEmail"
                action={this.standardFormAction}
                label="Contact Email"
                hideError={!form.contactEmail.touched}
                disabled={this.props.updating}
              />
            </div>
            <div className="col-xs-12 col-md-4">
              <Components.forms.components.maskedinput
                mask={['1', '-', /[1-9]/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
                maskPlaceholder="1-555-555-5555"
                form={form}
                type="tel"
                field="contactPhoneNumber"
                action={this.standardFormAction}
                label="Contact Phone Number"
                hideError={!form.contactPhoneNumber.touched}
                disabled={this.props.updating}
              />
            </div>
          </div>
          <h6>Address</h6>
          <div className="row mt-3">
            <div className="col-xs-12 col-md-7">
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="streetAddress"
                action={this.standardFormAction}
                label="Street"
                hideError={!form.streetAddress.touched}
                disabled={this.props.updating}
              />
            </div>
            <div className="col-xs-12 col-md-3">
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="unit"
                action={this.standardFormAction}
                label="Unit"
                hideError={!form.unit.touched}
                disabled={this.props.updating}
              />
            </div>
            <div className="col-xs-12 col-md-4">
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="city"
                action={this.standardFormAction}
                label="City"
                hideError={!form.city.touched}
                disabled={this.props.updating}
              />
            </div>
            <div className="col-xs-12 col-md-4">
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="state"
                action={this.standardFormAction}
                label="State"
                hideError={!form.state.touched}
                disabled={this.props.updating}
              />
            </div>
            <div className="col-xs-12 col-md-4">
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="zipCode"
                action={this.standardFormAction}
                label="Zip Code"
                hideError={!form.zipCode.touched}
                disabled={this.props.updating}
              />
            </div>
          </div>
        </Collapse>
        <div className="row">
          <div className="col-12 col-md-9">
            <h6>ExternalId</h6>
            <div className="row mt-3">
              <div className="col-xs-12 col-md-7">
                <Components.forms.components.textinput
                  form={form}
                  type="text"
                  field="externalId"
                  action={this.standardFormAction}
                  label="ExternalId"
                  hideError={!form.externalId.touched}
                  disabled={this.props.updating}
                />
              </div>
            </div>
          </div>
        </div>
        {error &&
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Something Went Wrong</h4>
            Error: {error}
          </div>
        }
        {this.props.showAccountCreatedNotification &&
          <div className="alert alert-primary" role="alert">
            Account successfully created! View and edit accounts below, or create another account.
          </div>
        }
        <Components.forms.components.button
          disabled={createDisabled}
          onClick={submit}
          onDisabledClick={this.props.onDisabledClick}
          buttonText="Create"
          updating={creating}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_createaccount);


