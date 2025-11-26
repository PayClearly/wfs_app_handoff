import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Utils from 'utils';
import Store from 'store';
import Components from 'components';

import { cannedFields } from 'components/forms/components/customreportfield/reportFields';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    types: state.validations.data.item,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_editreporttemplate extends Component {

  state = {
    name: 'Components.forms.editreporttemplate',
    typeOptions: {
      transaction: { display: 'Transaction Report' },
      custom: { display: 'Custom Report' },
    },
    exportsOptions: {
      pdf: { display: 'PDF' },
      tab: { display: 'TAB' },
      xlsx: { display: 'XLSX' },
      csv: { display: 'CSV' },
    },
    scheduleOptions: {
      daily: { display: 'Daily' },
      weekly: { display: 'Weekly' },
      monthly: { display: 'Monthly' },
      quarterly: { display: 'Quarterly' },
      annually: { display: 'Annually' },
    },
    dayOptions: {
      sunday: { display: 'Sunday' },
      monday: { display: 'Monday' },
      tuesday: { display: 'Tuesday' },
      wednesday: { display: 'Wednesday' },
      thursday: { display: 'Thursday' },
      friday: { display: 'Friday' },
      saturday: { display: 'Saturday' },
    },
    orderByOptions: cannedFields.reduce(((acc, { name }) => {
      acc[name] = { display: name };
      return acc;
    }), {}),
    orderOptions: {
      asc: { display: 'Ascending' },
      desc: { display: 'Descending' },
    },
  }

  componentDidMount() {
    const { initialize, validate, template } = this.props;
    const { _id, filename, description = '', type, orderBy, exports, startDate, endDate } = template;

    let schedule = template.schedule;
    let dayOfTheWeek;
    if (schedule.substring(schedule.length - 3) === 'day') {
      dayOfTheWeek = schedule;
      schedule = 'weekly';
    }
    const emailContacts = template.emailContacts && template.emailContacts.join(',');
    const data = {
      filename,
      description,
      type,
      schedule,
      dayOfTheWeek,
      orderBy: orderBy.dataField,
      order: orderBy.direction,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      exports: exports[0],
      emailContacts,
    };
    initialize(this.state.name, _id, data);
    validate(this.state.name, _id, this.validate);
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, nextProps.template._id, this.props.forms[this.state.name][nextProps.template._id]._values);
    }

    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][nextProps.template._id],
      key: nextProps.template._id,
    });
  }
  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  standardFormAction = (action, field, value) => {
    const { name, key } = this.state;
    if (action === 'change') {
      this.props[action](name, key, field, value);
      this.props.validate(name, key, this.validate);
    } else {
      this.props[action](name, key, field);
    }
  };

  checkType = (type, against) => Utils.typesvalidator.validateType(this.props.types, type, against).valid;

  validate = (fields) => {
    const errors = {};
    const { form } = this.state;
    const dataIsMissing = fieldName => !fields[fieldName] || fields[fieldName] === '';
    if (form && form.schedule.value === 'weekly' && dataIsMissing('dayOfTheWeek')) {
      errors.dayOfTheWeek = 'Day of the Week required';
    }

    if (!fields.filename) errors.filename = 'This field cannot be blank';
    if (fields.emailContacts) {
      const emails = fields.emailContacts.split(',');
      if (emails.some(email => !this.checkType('EmailAddress', email))) {
        errors.emailContacts = emails.length > 1 ? 'All emails must be valid email addresses' : Utils.typesvalidator.validationErrorMsgs.email;
      }
    }

    return errors;
  };

  render() {
    const { form, typeOptions, scheduleOptions, dayOptions, exportsOptions, orderByOptions, orderOptions } = this.state;
    if (!form) return null;

    return (
      <form className="floating-labels">

        <div className="row">
          <div className="col-md-6 col-xs-12">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="filename"
              action={this.standardFormAction}
              label="File Name"
              hideError={!form.filename.touched}
              disabled={this.props.updating}
              required
            />
          </div>
          <div className="col-md-6 col-xs-12">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="description"
              action={this.standardFormAction}
              label="Description"
              hideError={!form.description.touched}
              disabled={this.props.updating}
            />
          </div>
        </div>

        <div className="row pt-3">
          <div className="col-md-6 col-xs-12">
            <Components.forms.components.selectinput
              form={form}
              type="text"
              field="type"
              action={this.standardFormAction}
              label="Report Type"
              options={typeOptions}
              disabled
              hideError={!form.type.touched}
              required
            />
          </div>
          <div className="col-md-6 col-xs-12">
            {
              form.schedule.value === 'immediate' ?
                <Components.forms.components.selectinput
                  form={form}
                  type="text"
                  field="schedule"
                  action={this.standardFormAction}
                  label="Schedule"
                  options={{ immediate: { display: 'Immediate' } }}
                  disabled
                  hideError={!form.schedule.touched}
                  required
                /> :
                <Components.forms.components.selectinput
                  form={form}
                  type="text"
                  field="schedule"
                  action={this.standardFormAction}
                  label="Schedule"
                  options={scheduleOptions}
                  disabled={this.props.updating}
                  hideError={!form.schedule.touched}
                  required
                />
            }
          </div>
        </div>

        <div className="row pt-3">
          <div className="col-md-3 col-xs-12">
            <Components.forms.components.selectinput
              form={form}
              type="text"
              field="orderBy"
              action={this.standardFormAction}
              label="Order By"
              options={orderByOptions}
              disabled={this.props.updating}
              hideError={!form.orderBy.touched}
              required
            />
          </div>
          <div className="col-md-3 col-xs-12">
            <Components.forms.components.selectinput
              form={form}
              type="text"
              field="order"
              action={this.standardFormAction}
              label=""
              options={orderOptions}
              disabled={this.props.updating}
              hideError={!form.order.touched}
              required
            />
          </div>
          {
            form.schedule.value === 'weekly' &&
            <div className="col-md-6 col-xs-12">
              <Components.forms.components.selectinput
                form={form}
                type="text"
                field="dayOfTheWeek"
                action={this.standardFormAction}
                label="Day of the Week"
                options={dayOptions}
                disabled={this.props.updating}
                hideError={!form.schedule.touched}
                required
              />
            </div>
          }
          {
            form.schedule.value === 'immediate' &&
            <Fragment>
              <div className="col-md-3 col-xs-12">
                <Components.forms.components.daypicker
                  form={form}
                  type="number"
                  field="startDate"
                  action={this.standardFormAction}
                  label="From"
                  dateRange={{ max: form.endDate.value }}
                  disabled={this.props.updating}
                />
              </div>
              <div className="col-md-3 col-xs-12">
                <Components.forms.components.daypicker
                  form={form}
                  type="number"
                  field="endDate"
                  action={this.standardFormAction}
                  label="To"
                  dateRange={{ min: form.startDate.value }}
                  disabled={this.props.updating}
                />
              </div>
            </Fragment>
          }
        </div>

        <div className="row pt-3">
          <div className="col-md-6 col-xs-12">
            <Components.forms.components.selectinput
              form={form}
              type="text"
              field="exports"
              action={this.standardFormAction}
              label="Export Format"
              options={exportsOptions}
              disabled={this.props.updating}
              hideError={!form.exports.touched}
              required
            />
          </div>
          <div className="col-md-6 col-xs-12">
            <Components.forms.components.textinput
              form={form}
              field="emailContacts"
              action={this.standardFormAction}
              label="Email Address(es)"
              hideError={!form.emailContacts.touched}
              detailedInformation="Comma separate multiple emails, i.e. x,y,z"
              disabled={this.props.updating}
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_editreporttemplate);

