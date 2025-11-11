import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import { Collapse } from 'react-collapse';
import numeral from 'numeral';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

const mapStateToProps = (state, props) => {
  return ({
    derived: _try(() => Selectors.paymentcardform(props.formKey || 'default')(state), null),
    forms: state.forms,
    types: state.validations.data.item,
    customFields: state.account.paymentCardCustomFields.data.item,
    paymentPipelinePreferences: state.account.paymentPipelinePreferences.data.item,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_createpaymentcard extends Component {

  state = {
    name: 'Components.forms.createpaymentcard',
  };

  componentDidMount() {
    const { initialize, validate, blurAll } = this.props;
    const { name, amount, validThrough, maxUses, region, triggerType, triggerMax, triggerMin, triggerFrequency, specificDate } = this.props.initialFormData || {};
    const formKey = this.props.formKey || 'default';
    const initialData = {
      name: name || '',
      amount: amount || '',
      validThrough: validThrough || Utils.dates.plusThreeYearsMinusOneDay(Date.now()),
      maxUses: maxUses || 99999,
      region: region || this.props.paymentPipelinePreferences.defaultCardRegion || 'USA',
      triggerType: triggerType || '',
      triggerMax: triggerType && triggerMax || '',
      triggerMin: triggerType && triggerType === 'threshold' && triggerMin || '',
      triggerFrequency: triggerType === 'periodic' && triggerFrequency || '',
      specificDate: triggerFrequency && specificDate || '',
    };
    const options = Utils.getPaymentCardFieldOptions();
    this.setState({ options }, () => {
      initialize(this.state.name, formKey, initialData);
      validate(this.state.name, formKey, this.validate);
      if (blurAll) {
        this.props.blur(this.state.name, formKey, initialData);
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, this.state.key, this.props.forms[this.state.name][this.state.key]._values);
    }

    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][nextProps.formKey || this.state.key || 'default'],
      key: nextProps.formKey || this.state.key || 'default',
    });
  }

  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  standardFormAction = (action, field, value) => {
    const fields = {};
    fields[field] = value;

    if (action === 'change') {
      if (field === 'triggerType') {
        fields.triggerFrequency = '';
        fields.specificDate = '';
        fields.triggerMax = '';
        fields.triggerMin = '';
      }

      if (field === 'triggerFrequency') {
        fields.specificDate = '';
      }
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
    const { types } = this.props;
    const {
      DAY_OF_WEEK_OPTIONS,
      MONTH_OPTIONS,
      FREQUENCY_OPTIONS,
      REGION_OPTIONS,
      TRIGGER_OPTIONS,
    } = this.state.options;
    const errors = {};

    // name
    if (!fields.name || fields.name.length < 1) {
      errors.name = 'This field is required';
    }

    // amount
    if (!this.checkType(types.VirtualCard.properties.amount, fields.amount) || fields.amount < 1) {
      errors.amount = 'Must be between 1 and 1 Billion dollars';
    }

    // maxUses
    if (fields.maxUses > 99999 || fields.maxUses < 0 || (fields.maxUses !== 'Max' && isNaN(parseInt(fields.maxUses, 10)))) {
      errors.maxUses = 'Invalid amount, select a valid value';
    }

    // validUntilDay
    const now = new Date();

    if (fields.validThrough <= now) {
      errors.validThrough = 'Must be later than today';
    }

    if (!this.checkType(types.VirtualCard.properties.validThrough, fields.validThrough)) {
      errors.validThrough = 'Must be a valid date';
    }

    if (fields.validThrough.getTime() > Utils.dates.plusThreeYears(Date.now())) {
      errors.validThrough = 'Must be less than 3 years in the future';
    }

    if (!Object.keys(REGION_OPTIONS).find(option => fields.region === option)) {
      errors.region = 'Must enter a valid region';
    }
    if (!Object.keys(TRIGGER_OPTIONS).includes(fields.triggerType)) {
      errors.triggerType = 'Must enter a valid trigger type';
    }

    // triggers
    if (fields.triggerType) {
      if (fields.triggerType === 'threshold') {
        if (!this.checkType(types.Trigger.properties.min, parseInt(fields.triggerMin, 10))) {
          errors.triggerMin = 'Must be valid number';
        }
        if (!fields.triggerMin) {
          errors.triggerMin = 'This field is required';
        }

        if (fields.triggerMin < 0) {
          errors.triggerMin = 'Cannot be less than 0';
        }

        if (fields.amount && Number(fields.triggerMin) >= Number(fields.amount)) {
          errors.triggerMin = 'Must be less than initial card amount';
        }

        if (fields.triggerMin && fields.triggerMax && Number(fields.triggerMin) >= Number(fields.triggerMax)) {
          errors.triggerMin = 'Must be less than target remaining balance';
          errors.triggerMax = 'Must be greater than minimum threshold';
        }
      }

      // triggerMax
      if (!this.checkType(types.Trigger.properties.max, parseInt(fields.triggerMax, 10))) {
        errors.triggerMax = 'Must be valid number';
      }
      if (!fields.triggerMax) {
        errors.triggerMax = 'This field is required';
      }
      // trigger timings
      if (fields.triggerType === 'periodic') {

        if (!fields.triggerFrequency) {
          errors.triggerFrequency = 'This field is required';
        } else if (!Object.keys(FREQUENCY_OPTIONS).find(option => fields.triggerFrequency === option)) {
          errors.triggerFrequency = 'Must enter a valid frequency selection';
        }

        if (fields.triggerFrequency !== 'daily' && !fields.specificDate) {
          errors.specificDate = 'This field is required';
        }
        if (fields.triggerFrequency === 'monthly' && isNaN(Number(fields.specificDate))) {
          errors.specificDate = 'Must be a numerial value';
        } else if (fields.triggerFrequency === 'monthly' && fields.specificDate < 1 || fields.specificDate > 28) {
          errors.specificDate = 'Please enter a valid selection.';
        }

        if (fields.triggerFrequency === 'weekly' && !Object.keys(DAY_OF_WEEK_OPTIONS).includes(fields.specificDate)) {
          errors.specificDate = 'Please enter a valid selection';
        }

        if (fields.triggerFrequency === 'annually' && !Object.keys(MONTH_OPTIONS).includes(fields.specificDate)) {
          errors.specificDate = 'Please enter a valid selection';
        }
      }
    }

    return errors;
  };

  generateDateSuffixes = (date) => {
    const j = date % 10;
    const k = date % 100;

    if (j === 1 && k !== 11) {
      return 'st';
    } else if (j === 2 && k !== 12) {
      return 'nd';
    } else if (j === 3 && k !== 13) {
      return 'rd';
    }
    return 'th';
  }

  renderCustomFields = () => {
    return (
      <Components.forms.custom
        initialData={{ ..._try(() => this.props.initialFormData.fields, {}) }}
        fields={this.props.customFields}
        formKey={`paymentCardFields-${this.props.formKey || this.state.key}`}
        blurAll={this.props.blurAll}
        disabled={this.props.status.creating}
      />
    );
  };

  render() {
    const form = this.state.form;
    const customFieldsForm = this.props.forms['Components.forms.custom'] && this.props.forms['Components.forms.custom'][`paymentCardFields-${this.state.key}`];
    if (!form) return null;
    const {
      DAY_OF_WEEK_OPTIONS,
      MONTH_OPTIONS,
      FREQUENCY_OPTIONS,
      REGION_OPTIONS,
      MAX_USES_OPTIONS,
      TRIGGER_OPTIONS,
    } = this.state.options;

    const { creating } = this.props.status;
    const { err: creatingError } = _try(() => this.props.status.creatingError, { err: '' });
    const disabled = creating || form._allInitial || !form._allValid || !customFieldsForm._allValid;

    const now = new Date();
    const maxValidThroughDate = Utils.dates.plusThreeYearsMinusOneDay(Date.now());

    return (
      <Collapse className="components_forms_createpaymentcard" hasNestedCollapse isOpened>
        <form className="floating-labels">
          <div className="row pt-4">
            <div className="col-12 col-md-6">
              <Components.forms.components.textinput
                form={form}
                type="string"
                field="name"
                action={this.standardFormAction}
                label="Card Name"
                disabled={creating}
                hideError={!form.name.touched}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <Components.forms.components.textinput
                form={form}
                type="number"
                field="amount"
                action={this.standardFormAction}
                label="Amount"
                disabled={creating}
                hideError={!form.amount.touched}
                required
              />
            </div>
            <div className="col-12 col-md-4">
              <Components.forms.components.daypicker
                dateRange={{ min: now, max: maxValidThroughDate }}
                form={form}
                type="number"
                field="validThrough"
                action={this.standardFormAction}
                label="Valid Through"
                disabled={creating}
                hideError={!form.validThrough.touched}
                required
              />
            </div>
            <div className="col-xs-12 col-md-4">
              <Components.forms.components.selectinput
                form={form}
                field="region"
                action={this.standardFormAction}
                label="Region"
                options={REGION_OPTIONS}
                disabled={this.props.disabled}
              />
            </div>
            <div className="col-12 col-md-4">
              <Components.forms.components.selectinput
                form={form}
                field="maxUses"
                action={this.standardFormAction}
                label="Maximum Uses"
                options={MAX_USES_OPTIONS}
                disabled={creating}
                hideError={!form.maxUses.touched}
                required
              />
            </div>
          </div>

          {this.props.customFields && <div className="row">
            <div className="col-12">
              {this.renderCustomFields()}
            </div>
          </div>}

          <div className="row">
            <div className="col-md-4 col-12">
              <Components.forms.components.selectinput
                form={form}
                field="triggerType"
                action={this.standardFormAction}
                options={TRIGGER_OPTIONS}
                label="Card Funding Triggers"
                disabled={creating}
                hideError={!form.triggerType.touched}
              />
            </div>
          </div>

          <Collapse isOpened={this.state.form.triggerType.value} >
            <div className="row">
              {this.state.form.triggerType.value === 'threshold' &&
                <div className="col mb-2">
                  <h6>An advanced purchase card funding strategy. Useful for <strong>non-scheduled</strong> or <strong>variable</strong> recurring payments, or for implementing an <strong>emergency balance injection</strong>. If the remaining balance drops below the <strong>minimum balance threshold</strong>, this trigger will activate and increase the remaining balance to the <strong>target remaining balance</strong>.</h6>
                </div>
              }
              {this.state.form.triggerType.value === 'periodic' &&
                <div className="col mb-2">
                  <h6>Useful for <strong>Subscription Payments</strong>, or scheduled recurring payments. Please specify the <strong>subscription frequency</strong> and <strong>target remaining balance (i.e. subscription cost)</strong> below. If applicable, a buffer of at least 3 days is recommend for monthly subscriptions.</h6>
                </div>
              }
            </div>
            <div className="row">
              {this.state.form.triggerType.value === 'threshold' &&
                <div className="col-md-4 col-12">
                  <Components.forms.components.textinput
                    action={this.standardFormAction}
                    disabled={creating}
                    field="triggerMin"
                    form={form}
                    hideError={!form.triggerMin.touched}
                    label="Minimum Balance Threshold"
                    type="number"
                    required
                  />
                </div>
              }
              {this.state.form.triggerType.value === 'periodic' &&
                <Fragment>
                  <div className="col-md-4 col-12">
                    <Components.forms.components.selectinput
                      action={this.standardFormAction}
                      disabled={creating}
                      field="triggerFrequency"
                      form={form}
                      hideError={!form.triggerFrequency.touched}
                      label="Subscription Frequency"
                      required
                      options={FREQUENCY_OPTIONS}
                    />
                  </div>
                  {(() => {
                    if (!form.triggerFrequency.value) return null;
                    let label;
                    let options;

                    const frequency = form.triggerFrequency.value;

                    switch (frequency) {
                      case 'weekly':
                        label = 'Day of week';
                        options = DAY_OF_WEEK_OPTIONS;
                        break;

                      case 'monthly':
                        label = 'Day of month';
                        options = (() => {
                          const array = Array.from({ length: 28 }, (v, k) => { return k + 1; });
                          return array.reduce((acc, item, index) => {
                            const day = index + 1;
                            acc[day] = { display: `${day}` };
                            return acc;
                          }, {});
                        })();
                        break;

                      case 'annually':
                        label = 'Month';
                        options = MONTH_OPTIONS;
                        break;

                      default:
                        return null;

                    }

                    return (
                      <div className="col-md-4 col-12">
                        <Components.forms.components.selectinput
                          action={this.standardFormAction}
                          disabled={creating}
                          field="specificDate"
                          form={form}
                          hideError={!form.specificDate.touched}
                          label={label}
                          options={options}
                          required
                        />
                      </div>
                    );
                  })()}
                </Fragment>
              }
              <div className="col-md-4 col-12">
                <Components.forms.components.textinput
                  action={this.standardFormAction}
                  disabled={creating}
                  field="triggerMax"
                  form={form}
                  hideError={!form.triggerMax.touched}
                  label="Target Remaining Balance"
                  type="number"
                  required
                />
              </div>
            </div>
            {form._allValid &&
              <div className="row">
                <div className="col mb-2">
                  {(() => {
                    if (form.triggerType.value === 'periodic') {
                      let specificDate;
                      const frequency = form.triggerFrequency.value;

                      switch (form.triggerFrequency.value) {
                        case 'annually':
                          specificDate = ` on the 1st of ${_try(() => MONTH_OPTIONS[form.specificDate.value].display)}`;
                          break;
                        case 'monthly':
                          specificDate = ` on the ${form.specificDate.value}${this.generateDateSuffixes(Number(form.specificDate.value))}`;
                          break;
                        case 'weekly':
                          specificDate = ` on ${_try(() => DAY_OF_WEEK_OPTIONS[form.specificDate.value].display)}`;
                          break;
                        default:
                          specificDate = '';
                          break;
                      }
                      return (
                        <Fragment>
                          <h6>Based on your selection, the trigger on this purchase card will occur <strong>{frequency}{specificDate}</strong> at 4:30pm EST. The trigger will make sure that there is at least <strong>{numeral(form.triggerMax.value).format('$0,0.00')}</strong> available on this purchase card.{form.triggerFrequency.value !== 'daily' && form.triggerFrequency.value !== 'weekly' ? ' Triggers scheduled for weeekends, or holidays, will instead be run on the preceding business day.' : ''}</h6>
                        </Fragment>
                      );
                    }
                    return <h6>Based on your selection, the trigger on this purchase card will occur when the remaining balance reaches, or drops below, <strong>{numeral(form.triggerMin.value).format('$0,0.00')}</strong>. The trigger will increase the remaining balance on this purchase card to <strong>{numeral(form.triggerMax.value).format('$0,0.00')}</strong>.</h6>;
                  })()}
                </div>
              </div>
            }
          </Collapse>

          <Collapse isOpened={creatingError}>
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Something Went Wrong</h4>
              Error: {creatingError}
            </div>
          </Collapse>

          <Collapse isOpened={this.props.showCreatedNotification}>
            <div className="alert alert-primary" role="alert">
              <div className="row align-items-center">
                <div className="col-xs-12 col-md-8 mt-1 mb-1">
                  Card successfully created! See details in purchase card table, or create another card.
                </div>
                <div className="col-xs-12 col-md-4 mt-1 mb-1 text-center">
                  <button className="btn btn-primary" type="button" onClick={() => { this.props.navigateToPaymentCardTable(); }}>View Purchase Card</button>
                </div>
              </div>
            </div>
          </Collapse>
          {this.props.uploadedBatch ?
            null :
            <div className="row">
              <div className="col">
                <Components.forms.components.button
                  className="btn btn-primary"
                  buttonText="Create"
                  onClick={this.props.onSubmit}
                  onDisabledClick={() => { this.props.onDisabledClick(); }}
                  ariaLabel="Create Purchase Card"
                  disabled={disabled}
                  updating={creating}
                />
              </div>
            </div>
          }
        </form>
      </Collapse>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_createpaymentcard);

