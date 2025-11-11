import { connect, Component, bindActionCreators, Fragment } from 'component';

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    status: state.transactionDetails.status,
  });
};

const mapDispatchToProps = { ...Store.forms };

const hourOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].reduce((acc, hour) => {
  acc[hour === 12 ? 0 : hour] = { display: hour };
  return acc;
}, {});

const minuteOptions = {
  0: { display: '00' },
  15: { display: '15' },
  30: { display: '30' },
  45: { display: '45' },
};

const ampm = {
  am: { display: 'AM' },
  pm: { display: 'PM' },
};

class components_forms_scheduler extends Component {

  state = {
    name: 'Components.forms.scheduler',
    key: 'default',
  }

  componentDidMount() {
    const { name, key } = this.state;
    const { initialize, validate, initialData = {} } = this.props;

    // tomorrow at 7:00 AM EST
    const initialTime = new Date();
    initialTime.setDate(initialTime.getDate() + 1);
    initialTime.setHours(7, 0, 0, 0);

    initialize(name, key, {
      time: initialData.time || initialTime,
      date: initialData.time || initialTime,
      hour: _try(() => (initialData.time.getHours() % 12).toString(), '7'),
      minutes: _try(() => initialData.time.getMinutes().toString(), '0'),
      ampm: (initialData.time && (initialData.time.getHours() > 11)) ? 'pm' : 'am',
    });

    validate(name, key, this.validate);
  }

  componentWillReceiveProps(nextProps) {
    const { name } = this.state;
    this.setState({
      form: nextProps.forms[name] && nextProps.forms[name][nextProps.formKey || 'default'],
    });
  }

  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  standardFormAction = (action, field, value) => {
    const { name, key } = this.state;
    const { time, ampm } = this.props.forms[name][key]._values;
    const newDate = new Date(time);
    if (action === 'change') {
      if (field === 'hour') {
        newDate.setHours(+value + (ampm === 'pm' ? 12 : 0));
        this.props[action](name, key, 'time', newDate);
      }
      if (field === 'minutes') {
        newDate.setMinutes(+value);
        this.props[action](name, key, 'time', newDate);
      }
      if (field === 'date') {
        newDate.setDate(value.getDate());
        this.props[action](name, key, 'time', newDate);
      }
      if (field === 'ampm') {
        newDate.setHours(time.getHours() + (value === 'pm' ? 12 : -12));
        this.props[action](name, key, 'time', newDate);
      }

      this.props[action](name, key, field, value);

    } else {
      this.props[action](name, key, field);
    }
  };

  validate = () => {
    const errors = {};
    return errors;
  };

  render() {
    const { form } = this.state;
    if (!form) return null;

    return (
      <div className="components_forms_scheduler">
        <div className="floating-labels mt-3 row">
          <div className="col-xs-12 col-md-4">
            <Components.forms.components.daypicker
              form={form}
              field="date"
              action={this.standardFormAction}
              label="Select Date"
              dateRange={{ min: new Date() }}
              required
              disabled={this.props.disabled}
            />
          </div>
          <div className="col-xs-12 col-md-6 d-flex">
            <Components.forms.components.selectinput
              form={form}
              field="hour"
              action={this.standardFormAction}
              options={hourOptions}
              required
              disabled={this.props.disabled}
              className="me-1"
            />
            <p className="pt-2">:</p>
            <Components.forms.components.selectinput
              form={form}
              field="minutes"
              action={this.standardFormAction}
              options={minuteOptions}
              required
              disabled={this.props.disabled}
              className="ms-1 me-1"
            />
            <Components.forms.components.selectinput
              form={form}
              field="ampm"
              action={this.standardFormAction}
              options={ampm}
              required
              disabled={this.props.disabled}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_scheduler);


