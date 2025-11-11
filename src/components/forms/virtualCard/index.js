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
    paymentPipelinePreferences: state.account.paymentPipelinePreferences.data.item,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_virtualCard extends Component {
  state = {
    name: 'Components.forms.virtualCard',
  };

  componentDidMount() {
    const { initialize, validate } = this.props;
    const initialFormData = this.props.initialFormData || {};
    const formKey = this.props.formKey || 'default';

    const plusOneWeek = new Date();
    plusOneWeek.setDate(plusOneWeek.getDate() + 7);

    const initialData = {
      amount: initialFormData.amount || '',
      validThrough: (initialFormData.validThrough && new Date(initialFormData.validThrough)) || plusOneWeek,
      numberOfUses: initialFormData.maxUses || '1',
      region: initialFormData.region || this.props.paymentPipelinePreferences.defaultCardRegion || 'USA',
      requireExactMatch: (initialFormData.exactMatch && 'yes') || 'no',
      status: initialFormData.status || 'active',
    };
    
    // Hack for RedBox to have custom fields
    if (this.props.orgId === 'e9eea221-c5b7-4fd4-9f9b-dcf42060050b') {
      initialData.customField1 = initialFormData.customFields && initialFormData.customFields['efs-customField1'] || '';
      initialData.customField2 = initialFormData.customFields && initialFormData.customFields['efs-customField2'] || '';
    }
    
    initialize(this.state.name, formKey, initialData);
    validate(this.state.name, formKey, this.validate);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][nextProps.formKey || 'default'],
      key: nextProps.formKey || 'default',
    });
  }

  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  standardFormAction = (action, field, value) => {
    const fields = {};
    fields[field] = value;

    if (field === 'requireExactMatch') {
      fields.numberOfUses = '1';
    }
    if (field === 'numberOfUses' && value > 1) {
      fields.sendField = '';
      fields.sendMethod = 'none';
    }
    if (field === 'sendMethod') {
      fields.sendField = '';
    }
    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, fields);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  checkType = (type, against) => {
    return Utils.typesvalidator.validateType(this.props.types, type, against).valid;
  };

  validate = (fields) => {
    const { types, initialFormData } = this.props;
    const errors = {};

    // amount
    if (!this.checkType(types.VirtualCard.properties.amount, fields.amount)) {
      errors.amount = 'Must be between 1 and 1 Million dollars';
    }

    // numberOfUses
    if (fields.numberOfUses > 99999) {
      errors.numberOfUses = 'Must be between 1 and 99999';
    }

    // region - temporarily disabled
    // if (!this.checkType(types.VirtualCard.properties.region, fields.region)) {
    //   errors.region = 'Must be a valid region';
    // }

    // sendField
    if (fields.sendMethod === 'email') {
      if (!this.checkType(types.EmailAddress.name, fields.sendField)) {
        errors.sendField = Utils.typesvalidator.validationErrorMsgs.email;
      }

      if (!fields.sendField.length) {
        errors.sendField = 'Email address is required';
      }
    }

    if (fields.sendMethod === 'fax') {
      // TODO = use a better fax number validator
      if (!fields.sendField.length) {
        errors.sendField = 'Fax number is required';
      }
    }

    // validThroughDay
    if (fields.validThrough.getTime() > Utils.dates.plusThreeYears(Date.now())) {
      errors.validThrough = 'Must be less than 3 years in the future';
    }
    const now = new Date();

    if ((fields.validThrough.getDate() <= now.getDate()) && fields.validThrough.getMonth() === now.getMonth() && fields.validThrough.getFullYear() === now.getFullYear()) {
      errors.validThrough = 'Must be later than today';
    }
    if (fields.validThrough.getTime() > Utils.dates.plusThreeYears(_try(() => initialFormData.createdAt) || Date.now())) {
      errors.validThrough = _try(() => initialFormData.createdAt) ? 'Must be less than 3 years from creation date' : 'Must be less than 3 years in the future';
    }
    // if (!this.checkType(types.VirtualCard.properties.validThroughDay, fields.validThroughDay)) {
    //   errors.validThroughDay = 'Must be a valid date';
    // }

    // Previous validators

    // amount
    // if (fields.amount < 1 || fields.amount > 5) {
    //   errors.amount = 'Must be between 1 and 5 dollars';
    // }
    // numberOfUses
    // if (fields.numberOfUses < 1 || fields.numberOfUses > 99) {
    //   errors.numberOfUses = 'Must be between 1 and 99';
    // }
    // sendField
    // if (fields.sendMethod === 'email' && !fields.sendField.length) {
    //   // TODO = use a better email address vaildator
    //   errors.sendField = 'Must be a vaild email address';
    // }
    return errors;
  };

  render() {
    const form = this.state.form;
    if (!form) return null;

    return (
      <form className="floating-labels mb-4 components_forms_virtualCard">
        <div className="row pt-4">
          <div className="col-12 col-md">
            <Components.forms.components.textinput
              form={form}
              type="number"
              field="amount"
              action={this.standardFormAction}
              label="Amount"
              disabled={this.props.disabled}
              hideError={!form.amount.touched}
            />
          </div>
          <div className="col-12 col-md">
            <Components.forms.components.daypicker
              dateRange={{ min: (new Date()), max: Utils.dates.plusThreeYearsMinusOneDay(Date.now()) }}
              form={form}
              type="number"
              field="validThrough"
              action={this.standardFormAction}
              label="Expires On"
              disabled={this.props.disabled}
            />
          </div>
          {this.props.initialFormData.id &&
            <div className="col-12 col-md-4">
              <Components.forms.components.selectinput
                form={form}
                field="status"
                action={this.standardFormAction}
                label="Card Status"
                options={statusOptions}
                disabled={this.props.updating}
                required
              />
            </div>
          }
        </div>
        <div className="row">
          <div className="col-12 col-md-4">
            <Components.forms.components.selectinput
              form={form}
              field="requireExactMatch"
              action={this.standardFormAction}
              label="Requires Exact Match"
              options={exactMatchOptions}
              disabled={this.props.disabled}
              required
            />
          </div>
          <div className="col-12 col-md-4">
            <Components.forms.components.textinput
              form={form}
              type="number"
              field="numberOfUses"
              action={this.standardFormAction}
              label="Max Uses"
              disabled={form._values.requireExactMatch === 'yes' || this.props.disabled}
            />
          </div>
          <div className="col-12 col-md-4">
            <Components.forms.components.selectinput
              form={form}
              field="region"
              action={this.standardFormAction}
              label="Region"
              options={regionOptions}
              placeholder={regionOptions[form.region.value].display}
              disabled={this.props.disabled}
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_virtualCard);

// Internal Helper Functions ... 
const regionOptions = {
  USA: {
    display: 'United States',
  },
  CAN: {
    display: 'Canada',
  },
  USC: {
    display: 'US and Canada',
  },
  INT: {
    display: 'International',
  },
  NAM: {
    display: 'North America',
  },
};

const exactMatchOptions = {
  yes: {
    display: 'Yes',
  },
  no: {
    display: 'No',
  },
};

const statusOptions = {
  active: {
    display: 'Active',
  },
  on_hold: {
    display: 'Hold',
  },
};

// GENERATOR_TYPE='component';
