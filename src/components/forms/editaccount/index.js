import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Utils from 'utils';
import Store from 'store';
import Components from 'components';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    accounts: state.accounts,
    organization: state.organization,
    types: state.validations.data.item,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_editaccount extends Component {

  state = {
    name: 'Components.forms.editaccount',
  };

  componentDidMount() {
    const { initialize, validate, accountItem } = this.props;
    const { address = {} } = accountItem;
    const initialFields = {
      name: accountItem.name || '',
      externalId: accountItem.externalId || '',
      contactName: accountItem.contactName || '',
      contactEmail: accountItem.contactEmail || '',
      contactPhoneNumber: accountItem.contactPhoneNumber || '',
      streetAddress: address.streetAddress || '',
      unit: address.unit || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
      active: accountItem.active,
      suspended: accountItem.suspended || false,
    };

    if (_try(() => this.props.organization.data.id) === 'org-for-testing-policies' || _try(() => this.props.organization.data.id) === '57245f0a-7f86-4b55-9350-4a27a385f189' || _try(() => window.GLOBALCERT.projectId.includes('STAGING-ENV_CHANGE-ME'))) {
      // add sample dashboard option if test org
      initialFields.useSampleDashboard = _try(() => accountItem._options._useSampleDashboard) || false;
    }

    initialize(this.state.name, accountItem._id, initialFields);
    validate(this.state.name, accountItem._id, this.validate);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, nextProps.accountItem._id, this.props.forms[this.state.name][nextProps.accountItem._id]._values);
    }

    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][nextProps.accountItem._id],
      key: nextProps.accountItem._id,
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
    const accountTypes = this.props.types.Account;
    const errors = {};

    if (!this.checkType(accountTypes.properties.name, fields.name)) {
      errors.name = Utils.typesvalidator.validationErrorMsgs.string;
    }

    if (!this.checkType(accountTypes.properties.active, fields.active)) {
      errors.active = Utils.typesvalidator.validationErrorMsgs.boolean;
    }

    if (fields.contactEmail) {
      const invalidItem = fields.contactEmail.split(',').map(item => item.trim()).find(item => !this.checkType('EmailAddress', item));
      if (invalidItem) errors.contactEmail = `${invalidItem} - ${Utils.typesvalidator.validationErrorMsgs.email}`;
    }

    if (fields.contactPhoneNumber) {
      const invalidItem = fields.contactPhoneNumber.split(',').map(item => item.trim()).find(item => !this.checkType('PhoneNumber', item));
      if (invalidItem) errors.contactPhoneNumber = `${invalidItem} - ${Utils.typesvalidator.validationErrorMsgs.phoneNumber}`;
    }

    return errors;
  };

  render() {
    const form = this.state.form;
    if (!form) return null;

    return (
      <form className="floating-labels components_forms_editaccount">
        <div className="row">
          <div className="col-12">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="name"
              action={this.standardFormAction}
              label="Account Name"
              hideError={!form.name.touched}
              disabled={this.props.updating}
              required
            />
          </div>
        </div>
        <h4>Contact</h4>
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
        <h4>Address</h4>
        <div className="row mt-3">
          <div className="col-xs-12 col-md-9">
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
                  label="externalId"
                  hideError={!form.externalId.touched}
                  disabled={this.props.updating}
                />
              </div>
            </div>
          </div>
        </div>
        <Components.forms.components.checkbox
          form={form}
          field="active"
          action={this.standardFormAction}
          label="Active Account"
          disabled={this.props.updating}
        />
        <Components.forms.components.checkbox
          form={form}
          field="suspended"
          action={this.standardFormAction}
          label="Suspended Account"
          disabled={this.props.updating}
        />
        {((_try(() => this.props.organization.data.id) === 'org-for-testing-policies' || _try(() => this.props.organization.data.id) === '57245f0a-7f86-4b55-9350-4a27a385f189') || _try(() => window.GLOBALCERT.projectId.includes('STAGING-ENV_CHANGE-ME'))) &&
          <Fragment>
            <h4>Options</h4>
            <div className="row mt-3">
              <div className="col-12">
                <Components.forms.components.checkbox
                  form={form}
                  field="useSampleDashboard"
                  action={this.standardFormAction}
                  label="Use Sample Data for Dashboard"
                  disabled={this.props.updating}
                />
              </div>
            </div>
          </Fragment>
        }
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_editaccount);

