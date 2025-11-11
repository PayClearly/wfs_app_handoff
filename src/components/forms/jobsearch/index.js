import { connect, Component } from 'component';

// Third Party Imports ...

import Store from 'store';
import Components from 'components';

import './index.scss';


const mapStateToProps = (state, props) => ({
  forms: state.forms,
  organizationId: state.organization.data.id,
  accountId: state.account.data.id,
});

const mapDispatchToProps = {
  clearJobs: Store.jobs.clear,
  fetchJobs: Store.jobs.fetch,
  ...Store.forms,
};

class components_forms_jobsearch extends Component {

  state = {
    name: 'Components.forms.jobsearch',
    key: 'default',
    tableData: [],
  };

  componentDidMount() {
    const {
      initialize,
      validate,
    } = this.props;

    const { name, key } = this.state;

    const jobId = _try(() => window.store.getState().router.route.params.id, '');
    const jobType = _try(() => window.store.getState().router.route.params.type, null);
    const jobStatus = _try(() => window.store.getState().router.route.params.status, null);
    const jobDate = _try(() => window.store.getState().router.route.params.date, null);
    const startDate = jobDate ? new Date(jobDate) : new Date(new Date(new Date().setMonth(new Date().getMonth() - 1)).setHours(0, 0, 0, 0));
    const endDate = jobDate ? new Date(new Date(jobDate).setDate(new Date(jobDate).getDate() + 1)) : new Date(new Date().setHours(0, 0, 0, 0));

    initialize(name, key, {
      startDate,
      endDate,
      search: jobId,
      typeFilter: jobType,
      statusFilter: jobStatus,
    });

    validate(name, key, this.validate);
    const data = {
      startDate: _dateToCreatedAtValue(startDate),
      endDate: _dateToCreatedAtValue(endDate),
      status: jobStatus,
    };
    this.props.fetchJobs(data);
  }

  componentWillReceiveProps(nextProps) {
    const { accountId, organizationId, forms } = nextProps;

    if (organizationId && accountId && (this.props.accountId !== accountId || this.props.organizationId !== organizationId)) {
      this.getJobs(forms);
    }
    if (forms[this.state.name] && forms[this.state.name].default && this.props.forms[this.state.name] && this.props.forms[this.state.name].default) {
      const { startDate, endDate } = forms[this.state.name].default;
      if (
        this.props.forms[this.state.name].default._values.startDate !== nextProps.forms[this.state.name].default._values.startDate && /* !startDate.focused && */ !startDate.error
        || this.props.forms[this.state.name].default._values.endDate !== nextProps.forms[this.state.name].default._values.endDate && /* !endDate.focused && */ !endDate.error
      ) {
        this.getJobs(forms);
      }
    }

    const { name, key } = this.state;
    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(name, key, this.props.forms[name][key]._values);
    }

    this.setState({
      form: nextProps.forms[name] && nextProps.forms[name][nextProps.formKey || 'default'],
      key: 'default',
    });
  }

  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  getJobs = (forms) => {
    const { _values } = forms[this.state.name].default;
    const data = { status: _values.statusFilter, startDate: _dateToCreatedAtValue(_values.startDate), endDate: _dateToCreatedAtValue(_values.endDate) };
    this.props.fetchJobs(data);
  };

  standardFormAction = (action, field, value) => {
    if (value === 'all') {
      value = null;
    }
    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, field, value);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  validate = (fields) => {
    const errors = {};
    if (fields.startDate > fields.endDate) {
      errors.startDate = 'Invalid dates.';
      errors.endDate = 'Invalid dates.';
    }
    return errors;
  };

  render() {
    const { form } = this.state;
    if (!form) {
      return null;
    }

    const typeOptions = {
      all: { display: 'All' },
      transactionDetails: { display: 'Transaction Details' },
      statements: { display: 'Statements' },
      reports: { display: 'Reports' },
      payments: { display: 'Payments' },
      paymentPipeline: { display: 'Payment Pipeline' },
      createBatchPayment: { display: 'Batch Create' },
      updateBatchPayment: { display: 'Batch Update' },
      wfsTransfers: { display: 'WFS Account Relief' },
      wfsTransactions: { display: 'WFS Settlement' },
    };
    const filterOptions = {
      all: { display: 'All' },
      error: { display: 'Error' },
      processing: { display: 'Processing' },
      processed: { display: 'Processed' },
      queued: { display: 'Queued' },
      cancelled: { display: 'Cancelled' },
    };

    return (
      <div className="components_forms_jobsearch floating-labels">
        <div className="row">
          <div className={'col-6'}>
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="search"
              action={this.standardFormAction}
              label="Search"
              hideError={!form.search.touched}
              required={false}
            />
          </div>
          <div className="col-3">
            <Components.forms.components.selectinput
              form={form}
              type="text"
              field="typeFilter"
              action={this.standardFormAction}
              label="Type"
              options={typeOptions}
              required
            />
          </div>
          <div className="col-3">
            <Components.forms.components.selectinput
              form={form}
              type="text"
              field="statusFilter"
              action={this.standardFormAction}
              label="Status"
              options={filterOptions}
              required
            />
          </div>
        </div>
        <div className="row">
          <div className="col-5">
            <Components.forms.components.daypicker
              form={form}
              type="number"
              field="startDate"
              action={this.standardFormAction}
              label="From"
              dateRange={{ max: form.endDate.value }}
            />
          </div>
          <div className="col-5">
            <Components.forms.components.daypicker
              form={form}
              type="number"
              field="endDate"
              action={this.standardFormAction}
              label="To"
              dateRange={{ min: form.startDate.value }}
            />
          </div>
          <div className="col-2">
            <Components.forms.components.button
              onClick={() => this.props.retryAll()}
              buttonText="Retry All"
              className="btn btn-outline-danger w-100 mb-4"
              icon="pe-1 mdi mdi-alert-circle-check-outline"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_jobsearch);

// Internal Helper Functions ...
const _dateToCreatedAtValue = (date) => date.setHours(0, 0, 0, 0);

