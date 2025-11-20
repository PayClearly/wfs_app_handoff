import {
  connect, Component, bindActionCreators,
} from 'component';

import Utils from 'utils';
import Store from 'store';
import Components from 'components';


const mapStateToProps = (state) => ({
  forms: state.forms,
  types: state.validations.data.item,
});

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators(Store.forms, dispatch),
});

const mapResourcesToProps = () => ({});

class components_integrationcomps_cardsIntegration_GALILEO_forms_businessEnrollment extends Component {

  state = {
    name: 'Components.integrationcomps.cardsIntegration.GALILEO.forms.businessEnrollment',
  };

  componentDidMount() {
    const { initialize, validate } = this.props;
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';
    const initialData = this.props.initialData || {};

    initialize(this.state.name, key, {
      businessName: initialData.businessName || '',
      businessAddress1: initialData.businessAddress1 || '',
      businessAddress2: initialData.businessAddress2 || '',
      businessCity: initialData.businessCity || '',
      businessStateProv: initialData.businessStateProv || '',
      businessPostalCode: initialData.businessPostalCode || '',
    });
    validate(this.state.name, key, this.validate);
  }

  componentWillReceiveProps(nextProps = {}) {
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';
    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][key],
      key,
    });

    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, this.state.key, this.props.forms[this.state.name][this.state.key]._values);
    }
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

  checkType = (type, against) => Utils.typesvalidator.validateType(this.props.types, type, against).valid;

  validate = (values) => {
    const enrollmentType = this.props.types.BusinessEnrollment.properties;
    const errors = {};

    if (!this.checkType(enrollmentType.businessName, values.businessName)) {
      errors.businessName = Utils.typesvalidator.validationErrorMsgs.string;
    }

    /**
     * 30 Character limit is because we now pass the kyc businessName as the 'description' field
     * for the 'createAchTransaction' endpoint, and this field has a 30 character limit.
     */
    if (!values.businessName.match(/^[a-zA-Z\d\s'-.,?@&!#~*;+]{1,30}$/)) {
      errors.businessName = 'Must be 1 to 30 letters, numbers, spaces, \'-.,?@&!#~*;+';
    }

    if (!this.checkType(enrollmentType.businessAddress1, values.businessAddress1)) {
      errors.businessAddress1 = Utils.typesvalidator.validationErrorMsgs.string;
    }

    if (values.businessAddress1.match(/\b(?:APOB?|POB?|post office|call box|gpobox)\b/i)) {
      errors.businessAddress1 = 'Must not be a PO box';
    }

    if (!values.businessAddress1.match(/^[a-zA-Z\d\s'-.,?@!#~*;+"_$%=:`/\\|]{4,40}$/)) {
      errors.businessAddress1 = 'Must be 4 to 40 letters, numbers, spaces, \'-.,?@!#~*;+"_$%=:`/\\|';
    }

    if (values.businessAddress2) {

      if (!this.checkType(enrollmentType.businessAddress2, values.businessAddress2)) {
        errors.businessAddress2 = Utils.typesvalidator.validationErrorMsgs.string;
      }

      if (values.businessAddress2.match(/\b(?:APOB?|POB?|post office|call box|gpobox)\b/i)) {
        errors.businessAddress2 = 'Must not be a PO box';
      }

      if (!values.businessAddress2.match(/^[a-zA-Z\d\s'-.,?@!#~*;+"_$%=:`/\\|]{1,30}$/)) {
        errors.businessAddress2 = 'Must be 1 to 30 letters, numbers, spaces, \'-.,?@!#~*;+"_$%=:`/\\|';
      }
    }

    if (!this.checkType(enrollmentType.businessCity, values.businessCity)) {
      errors.businessCity = Utils.typesvalidator.validationErrorMsgs.string;
    }

    if (!values.businessCity.match(/^[a-zA-Z\s-.]{2,30}$/)) {
      errors.businessCity = 'Must be 2 to 30 letters, spaces, -.';
    }


    if (!this.checkType('BusinessState', values.businessStateProv)) {
      errors.businessStateProv = Utils.typesvalidator.validationErrorMsgs.businessState;
    }

    if (!this.checkType(enrollmentType.businessPostalCode, values.businessPostalCode)) {
      errors.businessPostalCode = 'Must be less than 11 characters';
    }

    if (!values.businessPostalCode.match(/^(\d{4}|\d{5}|\d{5}-\d{4}|[A-Z]\d[A-Z]-\d[A-Z]\d)$/)) {
      errors.businessPostalCode = 'Must match pattern 1234, 12345, 12345-1234, or K1A-1A1';
    }

    return errors;
  };

  render() {
    const { form } = this.state;
    if (!form) { return null; }

    return (
      <form className="floating-labels components_integrationcomps_cardsIntegration_GALILEO_forms_businessEnrollment">
        <h3>Business Information</h3>
        <div className="row">
          <div className="col-sm-12 col-md-6">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="businessName"
              action={this.standardFormAction}
              label="Business Name"
              disabled={this.props.disabled}
              hideError={!form.businessName.touched}
              required
            />
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 col-md-6">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="businessAddress1"
              action={this.standardFormAction}
              label="Street Address"
              disabled={this.props.disabled}
              hideError={!form.businessAddress1.touched}
              required
            />
          </div>
          <div className="col-xs-12 col-md-6">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="businessAddress2"
              action={this.standardFormAction}
              label="Apt, Floor, Suite, Bldg. #"
              disabled={this.props.disabled}
              hideError={!form.businessAddress2.touched}
            />
          </div>
          <div className="col-xs-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="businessCity"
              action={this.standardFormAction}
              label="City"
              disabled={this.props.disabled}
              hideError={!form.businessCity.touched}
              required
            />
          </div>
          <div className="col-xs-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="businessStateProv"
              action={this.standardFormAction}
              label="State"
              disabled={this.props.disabled}
              hideError={!form.businessStateProv.touched}
              required
            />
          </div>
          <div className="col-xs-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="businessPostalCode"
              action={this.standardFormAction}
              label="Postal Code"
              disabled={this.props.disabled}
              hideError={!form.businessPostalCode.touched}
              required
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_integrationcomps_cardsIntegration_GALILEO_forms_businessEnrollment);


