import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import { Collapse } from 'react-collapse';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    derived: Selectors.plasticCardForm(props.formKey || 'default')(state),
    forms: state.forms,
    types: state.validations.data.item,
    account: _resolve(state, `accounts.data.items.${state.account.data.id}`),
    users: Selectors.usersWithoutAssignedCards(state),
  });
};

const mapDispatchToProps = { ...Store.forms };


class components_forms_plasticcard extends Component {

  state = {
    name: 'Components.forms.plasticcard',
  };

  componentDidMount() {
    const { initialize, validate, account = {}, initialFormData = {}, formKey = 'default' } = this.props;
    const { address = {}, contactName, contactPhoneNumber } = account;
    const { streetAddress, unit = '', city, state, zipCode } = address;

    const initialData = {
      cardGroup: initialFormData.cardGroup || '',
      cardMemo: initialFormData.cardMemo || '',
      cardHolderName: initialFormData.cardHolderName || '',
      rushOrder: initialFormData.rushOrder || '1',
      addressLine: initialFormData.addressLine || streetAddress ? `${streetAddress} ${unit}` : '',
      city: initialFormData.city || city || '',
      stateProv: initialFormData.stateProv || _try(() => STATE_PROV_OPTIONS[initialFormData.country || 'USA'][state].display, ''),
      postalCode: initialFormData.postalCode || zipCode || '',
      country: initialFormData.country || 'USA',
      contactName: initialFormData.contactName || contactName || '',
      phoneNumber: initialFormData.phoneNumber || contactPhoneNumber,
      region: initialFormData.region || 'USA',
      cycleIndicator: initialFormData.cycleIndicator || 'None',
      cycleRefreshDay: initialFormData.cycleRefreshDay || '',
      cycleTransactionAmountLimit: initialFormData.cycleTransactionAmountLimit || '',
      cycleTransactionCountLimit: initialFormData.cycleTransactionCountLimit || '',
      dailyTransactionAmountLimit: initialFormData.dailyTransactionAmountLimit || '',
      dailyTransactionCountLimit: initialFormData.dailyTransactionCountLimit || '',
      transactionLimit: initialFormData.transactionLimit || '',
      assignedTo: initialFormData.assignedTo || '',
      cardType: initialFormData.cardType || '100',
    };

    initialize(this.state.name, formKey, initialData);
    validate(this.state.name, formKey, this.validate);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, this.state.key, this.props.forms[this.state.name][this.state.key]._values);
    }
    // }
    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][nextProps.formKey || 'default'],
      key: nextProps.formKey || 'default',
    });
  }

  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  onTypeAheadChange = (options, fieldName) => {
    const data = options[0] && options[0]._id;
    if (data) {
      this.props.change(this.state.name, this.state.key, fieldName, data);
      this.props.validate(this.state.name, this.state.key, this.validate);
    }
  }


  //     paymentOptions,
  //     tagOptions,
  //     selectedVendor,
  //     PSOP,
  //     // fee,
  //   } = derived;

  //     initial,
  //     value,
  //     touched,
  //   } = field;




  //     }

  //   }




  //     }

  //   }

  //       resolved[key] = '';
  //     }
  //       resolved[key] = `${(selectedVendor.repEmails || []).join(',')},${initial || ''}`.split(',').filter(item => item).map(item => item.trim()).join(',');
  //     }
  //   }

  //   }

  //     resolved[key] = false;
  //   }

  //     resolved[key] = '';
  //   }

  // }


  //       ...acc,
  //       ...this.resolver(key, derived.form[key], values, derived),
  //     };
  //   }, {});

  //   }
  // }

  standardFormAction = (action, field, value) => {
    const fields = {};
    fields[field] = value;

    if (action === 'change') {
      if (field === 'cycleIndicator') {
        fields.cycleRefreshDay = '';
        fields.cycleTransactionAmountLimit = '';
        fields.cycleTransactionCountLimit = '';
      }

      if (field === 'country') {
        fields.stateProv = '';
      }

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
    const errors = {};



    // Details
    if (!fields.cardHolderName) errors.cardHolderName = 'Card Holder Name is required.';
    if (!fields.cardType) errors.cardType = 'Card Type is required. Default is 100';

    // Limits
    if (!fields.dailyTransactionCountLimit) errors.dailyTransactionCountLimit = 'Daily Transaction Count Limit is required';
    if (fields.cycleIndicator && fields.cycleIndicator === 'Weekly' && !fields.cycleRefreshDay) errors.cycleRefreshDayOfWeek = 'Cycle Refresh Day is required.';
    if (fields.cycleIndicator && fields.cycleIndicator === 'Monthly' && !fields.cycleRefreshDay) errors.cycleRefreshDate = 'Cycle Refresh Date is required.';
    if (fields.cycleIndicator !== 'None' && !fields.cycleTransactionAmountLimit) errors.cycleTransactionAmountLimit = 'Cycle Transaction Amount Limit is required.';
    if (fields.cycleIndicator !== 'None' && !fields.cycleTransactionCountLimit) errors.cycleTransactionCountLimit = 'Cycle Transaction Count limit is required.';

    // Delivery
    if (!fields.contactName) errors.contactName = 'Contact Name is required.';
    if (!fields.addressLine) errors.addressLine = 'Address Line is required.';
    if (!fields.city) errors.city = 'City is required.';
    if (!fields.country) errors.country = 'Country is required';
    if (!fields.stateProv) errors.stateProv = 'State / Province is required.';
    if (!fields.postalCode) errors.postalCode = 'Postal Code is required.';
    // }
    if (!fields.phoneNumber) errors.phoneNumber = 'Phone Number is required.';
    if (fields.phoneNumber) {
      const invalidItem = fields.phoneNumber.split(',').map(item => item.trim()).find(item => !this.checkType('PhoneNumber', item));
      if (invalidItem) errors.phoneNumber = `${invalidItem} - ${Utils.typesvalidator.validationErrorMsgs.phoneNumber}`;
    }

    _checkFieldLengths(fields, errors);

    return errors;
  };


  render() {
    const form = this.state.form;

    if (!form) return null;
    const { forCreate, forUpdate, forReissue, users, account = {} } = this.props;
    const { creating, creatingError, updating } = this.props.status;
    const disabled = creating || ((forCreate || forUpdate) && form._allInitial) || !form._allValid;

    const inProgress = creating || updating;

    return (
      <Collapse className="components_forms_plasticcard" hasNestedCollapse isOpened>
        <form className="floating-labels">

          <div className="row pt-4">
            <div className="col-12 col-md-4">
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="cardHolderName"
                action={this.standardFormAction}
                label="Card Holder Name"
                disabled={!forCreate || inProgress}
                hideError={!form.cardHolderName.touched}
                enforce={/^.{0,21}$/}
                required
              />
            </div>
            <div className="col-12 col-md-4">
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="cardType"
                action={this.standardFormAction}
                label="Card Type"
                disabled={forReissue || inProgress}
                hideError={!form.cardType.touched}
                enforce={/^[0-9]{0,5}$/}
                required
              />
            </div>
            <div className="col-12 col-md-4">
              <Components.forms.components.selectinput
                form={form}
                type="text"
                field="region"
                action={this.standardFormAction}
                label="Region"
                options={REGION_OPTIONS}
                disabled={forReissue || inProgress}
                hideError={!form.region.touched}
                required
              />
            </div>
            <div className="col-12 col-md-4">
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="cardMemo"
                action={this.standardFormAction}
                label="Card Memo"
                disabled={inProgress}
                hideError={!form.cardMemo.touched}
                enforce={/^.{0,16}$/}
              />
            </div>
            <div className="col-12 col-md-4">
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="cardGroup"
                action={this.standardFormAction}
                label="Card Group"
                disabled={forReissue || inProgress}
                hideError={!form.cardGroup.touched}
                enforce={/^[0-9]{0,10}$/}
              />
            </div>
            <div className="col-12 col-md-4">
              <Components.forms.components.typeahead
                form={form}
                type="text"
                field="assignedTo"
                action={() => { }}
                label="Assigned To"
                options={Object.values(users)}
                selected={_try(() => [users[form.assignedTo.value].label])}
                onTypeAheadChange={this.onTypeAheadChange}
                disabled={forReissue || inProgress}
                hideError={!form.assignedTo.touched}
              />
            </div>
          </div>

          {
            (forCreate || forUpdate) &&
            <Fragment>
              <h2>Limits</h2>
              <div className="row">
                <div className="col-12 col-md-4">
                  <Components.forms.components.textinput
                    form={form}
                    type="text"
                    field="dailyTransactionCountLimit"
                    action={this.standardFormAction}
                    label="Daily Transaction Count Limit"
                    disabled={inProgress}
                    hideError={!form.dailyTransactionCountLimit.touched}
                    required={!forReissue}
                    enforce={/^[0-9]{0,5}$/}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <Components.forms.components.textinput
                    form={form}
                    type="text"
                    field="dailyTransactionAmountLimit"
                    action={this.standardFormAction}
                    label="Daily Transaction Amount Limit"
                    disabled={inProgress}
                    hideError={!form.dailyTransactionAmountLimit.touched}
                    enforce={/^[0-9]{0,7}$/}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <Components.forms.components.textinput
                    form={form}
                    type="text"
                    field="transactionLimit"
                    action={this.standardFormAction}
                    label="Transaction Limit"
                    disabled={inProgress}
                    hideError={!form.transactionLimit.touched}
                    enforce={/^[0-9]{0,5}$/}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-12 col-md-4">
                  <Components.forms.components.selectinput
                    form={form}
                    type="text"
                    field="cycleIndicator"
                    action={this.standardFormAction}
                    label="Refresh Cycle Indicator"
                    options={CYCLE_INDICATOR_OPTIONS}
                    disabled={inProgress}
                    hideError={!form.cycleIndicator.touched}
                  />
                </div>
              </div>
              <Collapse isOpened={form.cycleIndicator.value !== 'None'}>
                <div className="row">
                  {
                    form.cycleIndicator.value === 'Weekly' &&
                    <div className="col-12 col-md-4">
                      <Components.forms.components.selectinput
                        form={form}
                        type="text"
                        field="cycleRefreshDay"
                        action={this.standardFormAction}
                        label="Cycle Refresh Day"
                        options={CYCLE_REFRESH_WEEK_OPTIONS}
                        disabled={inProgress}
                        hideError={!form.cycleRefreshDay.touched}
                        required={form.cycleIndicator.value !== 'None'}
                      />
                    </div>
                  }
                  {
                    form.cycleIndicator.value === 'Monthly' &&
                    <div className="col-12 col-md-4">
                      <Components.forms.components.selectinput
                        form={form}
                        type="text"
                        field="cycleRefreshDay"
                        action={this.standardFormAction}
                        label="Cycle Refresh Date"
                        options={CYCLE_REFRESH_DAY_OPTIONS}
                        disabled={inProgress}
                        hideError={!form.cycleRefreshDay.touched}
                        required={form.cycleIndicator.value !== 'None'}
                      />
                    </div>
                  }
                  <div className="col-12 col-md-4">
                    <Components.forms.components.textinput
                      form={form}
                      type="text"
                      field="cycleTransactionAmountLimit"
                      action={this.standardFormAction}
                      label="Cycle Transaction Amount Limit"
                      disabled={inProgress}
                      hideError={!form.cycleTransactionAmountLimit.touched}
                      required={form.cycleIndicator.value !== 'None'}
                      enforce={/^[0-9]{0,7}$/}
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <Components.forms.components.textinput
                      form={form}
                      type="text"
                      field="cycleTransactionCountLimit"
                      action={this.standardFormAction}
                      label="Cycle Transaction Count Limit"
                      disabled={inProgress}
                      hideError={!form.cycleTransactionCountLimit.touched}
                      required={form.cycleIndicator.value !== 'None'}
                      enforce={/^[0-9]{0,5}$/}
                    />
                  </div>
                </div>
              </Collapse>
            </Fragment>
          }

          {
            (forCreate || forReissue) &&
            <Fragment>
              <h2>Delivery</h2>
              <div className="row">
                <div className="col-12 col-md-8">
                  <Components.forms.components.selectinput
                    form={form}
                    type="text"
                    field="rushOrder"
                    action={this.standardFormAction}
                    label="Rush Order"
                    options={RUSH_ORDER_OPTIONS}
                    disabled={inProgress}
                    hideError={!form.rushOrder.touched}
                  />
                </div>
              </div>

              <Collapse isOpened={form.rushOrder.value !== '1'}>
                <div className="row px-4 pb-4">
                  <div className="col-12 alert alert-warning" role="alert">
                    <h4 className="alert-heading">Rush Order Fee Alert</h4>
                    <div>
                      {`For "${RUSH_ORDER_OPTIONS[form.rushOrder.value].display}", there will be a service fee of ${form.rushOrder.value === '2' ? '$75' : '$45'}.`}
                    </div>
                  </div>
                </div>
              </Collapse>

              <div className="row">
                <div className="col-12 col-md-12">
                  <Components.forms.components.textinput
                    form={form}
                    type="text"
                    field="contactName"
                    action={this.standardFormAction}
                    label="Contact Name"
                    disabled={inProgress}
                    hideError={!form.contactName.touched}
                    required
                    enforce={/^.{0,21}$/}
                  />
                </div>
                <div className="col-12 col-md-12">
                  <Components.forms.components.textinput
                    form={form}
                    type="text"
                    field="addressLine"
                    action={this.standardFormAction}
                    label="Address Line"
                    disabled={inProgress}
                    hideError={!form.addressLine.touched}
                    required
                    enforce={/^.{0,21}$/}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <Components.forms.components.textinput
                    form={form}
                    type="text"
                    field="city"
                    action={this.standardFormAction}
                    label="City"
                    disabled={inProgress}
                    hideError={!form.city.touched}
                    required
                    enforce={/^.{0,12}$/}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <Components.forms.components.selectinput
                    form={form}
                    type="text"
                    field="stateProv"
                    action={this.standardFormAction}
                    label="State / Province"
                    options={STATE_PROV_OPTIONS[form.country.value]}
                    disabled={inProgress}
                    hideError={!form.stateProv.touched}
                    required
                  />
                </div>
                <div className="col-12 col-md-4">
                  <Components.forms.components.textinput
                    form={form}
                    type="text"
                    field="postalCode"
                    action={this.standardFormAction}
                    label="Postal Code"
                    disabled={inProgress}
                    hideError={!form.postalCode.touched}
                    required
                    enforce={/^.{0,10}$/}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <Components.forms.components.selectinput
                    form={form}
                    type="text"
                    field="country"
                    action={this.standardFormAction}
                    label="Country"
                    options={COUNTRY_OPTIONS}
                    disabled={inProgress}
                    hideError={!form.country.touched}
                    required
                  />
                </div>
                <div className="col-12 col-md-4">
                  <Components.forms.components.maskedinput
                    mask={['1', '-', /[1-9]/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
                    maskPlaceholder="1-555-555-5555"
                    form={form}
                    type="tel"
                    field="phoneNumber"
                    action={this.standardFormAction}
                    label="Phone Number"
                    disabled={inProgress}
                    hideError={!form.phoneNumber.touched}
                    required
                  />
                </div>
              </div>
            </Fragment>
          }

          <Collapse isOpened={creatingError}>
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Something Went Wrong</h4>
              Error: {creatingError}
            </div>
          </Collapse>

          {
            (forCreate || forReissue) &&
            <Fragment>
              <Collapse isOpened={this.props.showCreatedNotification}>
                <div className="alert alert-primary" role="alert">
                  <div className="row align-items-center">
                    <div className="col-xs-12 col-md-8 mt-1 mb-1">
                      {
                        forCreate ?
                          'Card successfully created! See details in plastic cards table, or create another card.' :
                          'Card successfully reissued.'
                      }
                    </div>
                    <div className="col-xs-12 col-md-4 mt-1 mb-1 text-center">
                      <button className="btn btn-primary" type="button" onClick={() => { this.props.navigateToPlasticCardTable(); }}>View Plastic Card</button>
                    </div>
                  </div>
                </div>
              </Collapse>
              {
                forReissue &&
                <div className="row">
                  <div className="col">
                    <Components.button
                      className="btn btn-primary"
                      buttonText={'Reissue'}
                      onClick={this.props.onSubmit}
                      onDisabledClick={this.props.onDisabledClick}
                      ariaLabel="Reissue Plastic Card"
                      disabled={disabled}
                      updating={updating}
                    />
                  </div>
                </div>
              }
            </Fragment>
          }
        </form>
      </Collapse>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_plasticcard);




const CYCLE_REFRESH_DAY_OPTIONS = {
  1: { display: '01' },
  2: { display: '02' },
  3: { display: '03' },
  4: { display: '04' },
  5: { display: '05' },
  6: { display: '06' },
  7: { display: '07' },
  8: { display: '08' },
  9: { display: '09' },
  10: { display: '10' },
  11: { display: '11' },
  12: { display: '12' },
  13: { display: '13' },
  14: { display: '14' },
  15: { display: '15' },
  16: { display: '16' },
  17: { display: '17' },
  18: { display: '18' },
  19: { display: '19' },
  20: { display: '20' },
  21: { display: '21' },
  22: { display: '22' },
  23: { display: '23' },
  24: { display: '24' },
  25: { display: '25' },
  26: { display: '26' },
  27: { display: '27' },
  28: { display: '28' },
};

const REGION_OPTIONS = {
  USA: { display: 'United States' },
  CAN: { display: 'Canada' },
  USC: { display: 'USA and Canada' },
  INT: { display: 'International' },
  NAM: { display: 'North America' },
};
const COUNTRY_OPTIONS = {
  USA: { display: 'United States' },
  CAN: { display: 'Canada' },
};

const CYCLE_INDICATOR_OPTIONS = {
  None: { display: 'None' },
  Weekly: { display: 'Weekly' },
  Monthly: { display: 'Monthly' },
};

const CYCLE_REFRESH_WEEK_OPTIONS = {
  Monday: { display: 'Monday' },
  Tuesday: { display: 'Tuesday' },
  Wednesday: { display: 'Wednesday' },
  Thursday: { display: 'Thursday' },
  Friday: { display: 'Friday' },
  Saturday: { display: 'Saturday' },
  Sunday: { display: 'Sunday' },
};

const RUSH_ORDER_OPTIONS = {
  1: { display: 'No Rush Order' },
  2: { display: 'Same Day Processing / Overnight Shipping' },
  3: { display: 'Standard Processing / Overnight Shipping' },
};

const CAN_OPTIONS = [
  'NL', 'PE', 'NS', 'NB', 'QC', 'ON', 'MB', 'SK', 'AB', 'BC', 'YT', 'NT', 'NU',
].sort().reduce(((acc, cur) => {
  acc[cur] = { display: cur };
  return acc;
}), {});

const USA_OPTIONS = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WV', 'WA', 'WI', 'WY', 'AS', 'DC', 'FM', 'GU', 'MH', 'MP', 'PW', 'PR', 'VI',
].sort().reduce(((acc, cur) => {
  acc[cur] = { display: cur };
  return acc;
}), {});

const STATE_PROV_OPTIONS = {
  CAN: CAN_OPTIONS,
  USA: USA_OPTIONS,
};

const FIELD_LENGTH_LIMITS = {
  cardHolderName: 21,
  cardType: 5,
  cardMemo: 16,
  cardGroup: 10,
  dailyTransactionCountLimit: 5,
  dailyTransactionAmountLimit: 7,
  transactionLimit: 5,
  cycleTransactionAmountLimit: 7,
  cycleTransactionCountLimit: 5,
  contactName: 21,
  addressLine: 21,
  city: 12,
  postalCode: 10,
};
const _checkFieldLengths = (fields, errors) => {
  Object.keys(FIELD_LENGTH_LIMITS).forEach((fieldName) => {
    const limit = FIELD_LENGTH_LIMITS[fieldName];
    if (fields[fieldName] && fields[fieldName].length > limit) errors[fieldName] = `${Utils.snakeCaseToCapitalCase(fieldName)} cannot be longer than ${limit} characters.`
  });
}