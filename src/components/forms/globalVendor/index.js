import {
  connect, Component, bindActionCreators, Fragment,
} from 'component';

// Third Party Imports ...

import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  forms: state.forms,
  types: state.validations.data.item,
  globalVendors: state.global.vendors.data.items,
  globalVendorMetadata: state.global.metadata.data.items,
  globalVendorGroups: state.global.groups.data.items,
});

const mapDispatchToProps = { ...Store.forms };

class components_forms_globalVendor extends Component {
  state = {
    name: 'Components.forms.globalVendor',
  };

  componentDidMount() {
    const {
      initialize,
      validate,
    } = this.props;
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    const globalVendor = _try(() => this.props.globalVendors[this.props.globalVendorId], {});
    const metadata = _try(() => this.props.globalVendorMetadata[this.props.globalVendorId], {});

    initialize(this.state.name, key, {
      name: globalVendor.name || '',
      groupIds: _try(() => globalVendor.groupIds.length) ? globalVendor.groupIds : [],
      groups: '',
      website: metadata.website || '',
      phoneNumber: metadata.phoneNumber || '',
      streetAddress: _try(() => metadata.address.streetAddress) || '',
      unit: _try(() => metadata.address.unit) || '',
      city: _try(() => metadata.address.city) || '',
      state: _try(() => metadata.address.state) || '',
      zipCode: _try(() => metadata.address.zipCode) || '',
      country: _try(() => metadata.address.country) || '',
      email: metadata.email || '',
      active: Object.prototype.hasOwnProperty.call(globalVendor, 'active') ? !!globalVendor.active : true,
      contacts: metadata.contacts || '',
      notifyOnCreation: Object.prototype.hasOwnProperty.call(globalVendor, 'notifyOnCreation') ? !!globalVendor.notifyOnCreation : false,
      notifyOnCreationEmails: _try(() => globalVendor.notifyOnCreationEmails.length) ? globalVendor.notifyOnCreationEmails.join(',') : '',
      notifyOnCompletion: Object.prototype.hasOwnProperty.call(globalVendor, 'notifyOnCompletion') ? !!globalVendor.notifyOnCompletion : false,
      notifyOnCompletionEmails: _try(() => globalVendor.notifyOnCompletionEmails.length) ? globalVendor.notifyOnCompletionEmails.join(',') : '',
      notificationFields: globalVendor.notificationFields ? _try(() => Object.keys(globalVendor.notificationFields).map((notificationKey) => `${notificationKey}:${globalVendor.notificationFields[notificationKey]}`).join(';')) : '',
    });

    validate(this.state.name, key, this.validate);
  }

  componentWillReceiveProps(nextProps = {}) {
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, key, this.props.forms[this.state.name][key]._values);
    }

    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][key],
      key,
    });
  }

  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  onTypeAheadChange = (options) => {
    const data = options.length ? options.map((option) => option._id) : [];
    this.props.change(this.state.name, this.state.key, 'groupIds', data);
    this.props.validate(this.state.name, this.state.key, this.validate);
  };

  checkForConflicts = (groupIds = []) => {
    const { globalVendorGroups } = this.props;
    let conflict = false;
    const clashingGroups = [];
    const tags = {};
    conflict = groupIds.some((groupId) => {
      const tagsInGroup = globalVendorGroups[groupId].tagIds || [];
      tagsInGroup.forEach((tagId) => {
        if (tags[tagId]) {
          conflict = true;
          clashingGroups.push(tags[tagId], groupId);
        } else {
          tags[tagId] = groupId;
        }
      });

      return conflict;
    });
    return { conflict, clashingGroups };
  };

  validate = (values) => {
    const { globalVendorGroups } = this.props;
    const vendorType = this.props.types.Vendor.properties;
    const errors = {};

    if (!this.checkType(vendorType.name, values.name)) {
      errors.name = Utils.typesvalidator.validationErrorMsgs.string;
    }

    if (!this.checkType(vendorType.website, values.website)) {
      errors.website = Utils.typesvalidator.validationErrorMsgs.string;
    }

    if (!this.checkType(vendorType.phoneNumber, values.phoneNumber)) {
      errors.phoneNumber = Utils.typesvalidator.validationErrorMsgs.string;
    }

    if (!this.checkType(vendorType.streetAddress, values.streetAddress)) {
      errors.streetAddress = Utils.typesvalidator.validationErrorMsgs.string;
    }

    if (!this.checkType(vendorType.unit, values.unit)) {
      errors.unit = Utils.typesvalidator.validationErrorMsgs.string;
    }

    if (!this.checkType(vendorType.city, values.city)) {
      errors.city = Utils.typesvalidator.validationErrorMsgs.string;
    }

    if (values.city && !/^[a-zA-Z]+(?:(?:\s+|-)[a-zA-Z]+)*$/.test(values.city)) {
      errors.city = 'Must be valid city';
    }

    if (!this.checkType(vendorType.state, values.state)) {
      errors.state = Utils.typesvalidator.validationErrorMsgs.string;
    }

    if (!this.checkType(vendorType.zipCode, values.zipCode)) {
      errors.zipCode = Utils.typesvalidator.validationErrorMsgs.string;
    }

    // country validation
    // if (!this.checkType(vendorType.zipCode, values.zipCode)) {
    //   errors.zipCode = Utils.typesvalidator.validationErrorMsgs.string;
    // }

    if (!this.checkType(vendorType.email, values.email)) {
      errors.email = Utils.typesvalidator.validationErrorMsgs.email;
    }

    if (!values.name) {
      errors.name = 'Vendor name is required';
    }

    if (_try(() => values.groupIds.length)) {
      const { conflict, clashingGroups } = this.checkForConflicts(values.groupIds);

      if (conflict) {
        errors.groups = `${_try(() => globalVendorGroups[clashingGroups[0]].name) || 'A group'} and ${_try(() => globalVendorGroups[clashingGroups[1]].name) || 'another group'} share the same tag`;
      }
    }

    // Notification preference validations
    const notifyOnCreationEmails = values.notifyOnCreationEmails.split(',');
    if (values.notifyOnCreationEmails && notifyOnCreationEmails.some((email) => !this.checkType('EmailAddress', email))) {
      errors.notifyOnCreationEmails = notifyOnCreationEmails.length > 1 ? 'All emails must be valid email addresses' : Utils.typesvalidator.validationErrorMsgs.email;
    }
    if (values.notifyOnCreation && !values.notifyOnCreationEmails) { errors.notifyOnCreationEmails = 'Email address required'; }

    const notifyOnCompletionEmails = values.notifyOnCompletionEmails.split(',');
    if (values.notifyOnCompletionEmails && notifyOnCompletionEmails.some((email) => !this.checkType('EmailAddress', email))) {
      errors.notifyOnCompletionEmails = notifyOnCompletionEmails.length > 1 ? 'All emails must be valid email addresses' : Utils.typesvalidator.validationErrorMsgs.email;
    }
    if (values.notifyOnCompletion && !values.notifyOnCompletionEmails) { errors.notifyOnCompletionEmails = 'Email address required'; }

    return errors;
  };

  checkType = (type, against) => Utils.typesvalidator.validateType(this.props.types, type, against).valid;

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, field, value);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  render() {
    const { form } = this.state;
    if (!form) { return null; }

    return (
      <form className="floating-labels components_forms_globalVendor pt-2">
        <div className="row">
          <div className="col-xs-12 col-md-10">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="name"
              action={this.standardFormAction}
              label="Global Vendor Name"
              disabled={this.props.disabled || this.props.isExistingGlobalVendor}
              hideError={!form.name.touched}
              required
            />
          </div>
          <div className="col-xs-12 col-md-2">
            <Components.forms.components.switch
              form={form}
              field="active"
              action={this.standardFormAction}
              label="Active"
              disabled={this.props.updating}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 col-md-10">
            <Components.forms.components.typeahead
              form={form}
              type="text"
              field="groups"
              action={() => { }}
              disabled={this.props.disabled}
              selected={form.groupIds.value.map((val) => this.props.globalVendorGroups[val]).filter((item) => item)}
              multiple
              options={Object.values(this.props.globalVendorGroups) || {}}
              labelKey="name"
              onTypeAheadChange={this.onTypeAheadChange}
              label="Groups"
              noItemsText="Not Found"
              floatLabel={Boolean(form.groupIds.value.length)}
            />
          </div>
        </div>
        <h3>Notification Settings</h3>
        <div className="row">
          <div className="col-12 col-md-3">
            <Components.forms.components.checkbox
              form={form}
              field="notifyOnCreation"
              action={this.standardFormAction}
              label="Notify On Payment Creation"
              disabled={this.props.disabled}
              hideError={!form.notifyOnCreation.touched}
            />
          </div>
          <div className="col-12 col-md-9">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="notifyOnCreationEmails"
              action={this.standardFormAction}
              label="Creation Notification Delivery Emails"
              detailedInformation="Comma separate multiple emails, i.e. x,y,z"
              disabled={this.props.disabled || !_try(() => form._values.notifyOnCreation)}
              hideError={!form.notifyOnCreationEmails.touched}
              required={_try(() => form._values.notifyOnCreation)}
            />
          </div>
          <div className="col-12 col-md-3">
            <Components.forms.components.checkbox
              form={form}
              field="notifyOnCompletion"
              action={this.standardFormAction}
              label="Notify On Payment Completion"
              disabled={this.props.disabled}
              hideError={!form.notifyOnCompletion.touched}
            />
          </div>
          <div className="col-12 col-md-9">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="notifyOnCompletionEmails"
              action={this.standardFormAction}
              label="Completion Notification Delivery Emails"
              detailedInformation="Comma separate multiple emails, i.e. x,y,z"
              disabled={this.props.disabled || !_try(() => form._values.notifyOnCompletion)}
              hideError={!form.notifyOnCompletionEmails.touched}
              required={_try(() => form._values.notifyOnCompletion)}
            />
          </div>
          <div className="col-12">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="notificationFields"
              action={this.standardFormAction}
              label="Custom Notification Fields"
              detailedInformation="Separate field key and value with a colon. Separate multiple fields with semi-colons, i.e. DMA:Portland;Test:This is a test value;Key:value"
              disabled={this.props.disabled}
              hideError={!form.notificationFields.touched}
            />
          </div>
        </div>
        <Components.forms.components.accordion
          showLabel="Show Metadata Fields"
          hideLabel="Hide Metadata Fields"
        >
          <div className="row pt-4">
            <div className="col-xs-12 col-md-4">
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="website"
                action={this.standardFormAction}
                label="Website"
                disabled={this.props.disabled}
                hideError={!form.website.touched}
              />
            </div>
            <div className="col-xs-12 col-md-4">
              <Components.forms.components.maskedinput
                form={form}
                type="tel"
                mask={['1', '-', /[1-9]/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
                maskPlaceholder="1-555-555-5555"
                field="phoneNumber"
                action={this.standardFormAction}
                label="Phone Number"
                disabled={this.props.disabled}
                hideError={!form.phoneNumber.touched}
              />
            </div>
            <div className="col-xs-12 col-md-4">
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="email"
                action={this.standardFormAction}
                label="Contact Email"
                disabled={this.props.disabled}
                hideError={!form.zipCode.touched}
              />
            </div>
          </div>
          <h5 className="box-title">Global Vendor Address</h5>
          <div className="row">
            <div className="col-xs-12 col-md-4">
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="streetAddress"
                action={this.standardFormAction}
                label="Street Address"
                disabled={this.props.disabled}
                hideError={!form.streetAddress.touched}
              />
            </div>
            <div className="col-xs-12 col-md-4">
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="unit"
                action={this.standardFormAction}
                label="Unit"
                disabled={this.props.disabled}
                hideError={!form.unit.touched}
              />
            </div>
            <div className="col-xs-12 col-md-4">
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="city"
                action={this.standardFormAction}
                label="City"
                disabled={this.props.disabled}
                hideError={!form.city.touched}
              />
            </div>
            <div className="col-xs-12 col-md-4">
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="state"
                action={this.standardFormAction}
                label="State"
                disabled={this.props.disabled}
                hideError={!form.state.touched}
              />
            </div>
            <div className="col-xs-12 col-md-4">
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="zipCode"
                action={this.standardFormAction}
                label="Zip Code"
                disabled={this.props.disabled}
                hideError={!form.zipCode.touched}
              />
            </div>
            <div className="col-xs-12 col-md-4">
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="country"
                action={this.standardFormAction}
                label="Country"
                disabled={this.props.disabled}
                hideError={!form.country.touched}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12 col-md-12">
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="contacts"
                action={this.standardFormAction}
                label="Contacts"
                disabled={this.props.disabled}
                hideError={!form.contacts.touched}
              />
            </div>
          </div>
        </Components.forms.components.accordion>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_globalVendor);


