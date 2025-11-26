import {
  connect, Component,
} from 'component';

// Third Party Imports ...

import Utils from 'utils';
import Store from 'store';
import Components from 'components';

import { getSftpUser } from '../../../store/account/sftp';

const mapStateToProps = (state) => ({
  forms: state.forms,
  status: state.account.reportTemplates.status,
  organizations: state.organizations.data.items,
  organizationId: state.organization.data.id,
  accounts: state.accounts.data.items,
  accountId: state.account.data.id,
  types: state.validations.data.item,
  ftpAccountDetails: state.account.ftpAccountDetails.data.item,
  sftp: state.account.sftp.data.items,
  sftpFetchStatus: state.account.sftp.status,
  sftpFetchError: state.account.sftp.status.fetchingError,
});

const mapDispatchToProps = (dispatch) => ({
  openFtpAccountSetupModal: () => {
    dispatch(Store.router.openModal('Components.modals.setupftpaccount', { sftp: true }));
  },
  updateFtpAccount: (data) => {
    dispatch(Store.account.updateFtpAccount(data));
  },
  destroy: (name, key) => {
    dispatch(Store.forms.destroy(name, key));
  },
  resetForm: (name, key, fields) => {
    dispatch(Store.forms.reset(name, key, fields));
  },
  validate: (name, key, validate) => {
    dispatch(Store.forms.validate(name, key, validate));
  },
  initialize: (name, key, fields) => {
    dispatch(Store.forms.initialize(name, key, fields));
  },
  focus: (name, key, fieldName) => {
    dispatch(Store.forms.focus(name, key, fieldName));
  },
  blur: (name, key, fieldData) => {
    dispatch(Store.forms.blur(name, key, fieldData));
  },
  change: (name, key, fieldData, newValue) => {
    dispatch(Store.forms.change(name, key, fieldData, newValue));
  },
  fetchSftpUser: () => {
    dispatch(getSftpUser());
  },
});

class components_forms_schedulereport extends Component {

  state = {
    name: 'Components.forms.schedulereport',
    key: 'default',
    isImmediate: true,
    scheduleOptions: {
      immediate: { display: 'Immediately' },
      daily: { display: 'Daily' },
      weekly: { display: 'Weekly' },
      monthly: { display: 'Monthly' },
      quarterly: { display: 'Quarterly' },
      annually: { display: 'Annually' },
    },
    exportsOptions: {
      pdf: { display: 'PDF' },
      tab: { display: 'TAB' },
      xlsx: { display: 'XLSX' },
      csv: { display: 'CSV' },
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
    loadingSftpAccountDetails: false,
  };

  reportTypeToDescriptionMap = {
    checkActivity: 'Check Activity Report',
    pctrCard: 'PCTR Card Report',
    pctrAch: 'PCTR ACH Report',
    pctrCheck: 'PCTR Check Report',
    spendByVendor: 'Spend by Merchant Report',
    spendByCard: 'Spend by Card Report',
  };

  componentDidMount() {
    // ftps account details load using the sync method when the app loads, but sftp account details
    // are lazy loaded in components that need to access them
    if (!Object.keys(this.props.ftpAccountDetails).length && !Object.keys(this.props.sftp).length) {
      this.setState((prev) => ({ ...prev, loadingSftpAccountDetails: true }));
      this.props.fetchSftpUser();
    }
    const {
      initialize, validate, organizations, organizationId, initialData = {}, reportType, accounts, accountId,
    } = this.props;
    const { name, key } = this.state;
    const { startDate = {}, endDate = {} } = this.props.forms['Components.forms.reportsearch'].default;
    const orgName = organizations[organizationId].name.replace(/\s/g, '_').trim();
    const accountName = accounts[accountId].name.replace(/\s/g, '_').trim();
    const today = Utils.dates.dateToDay(Date.now(), 'validThroughDay');
    const filename = reportType === 'vapCleared'
      ? `${accountName}.[YYYYMMDDHHMM].VAPCleared.dat`
      : `PCTR_${orgName}_${today}`;
    const description = this.reportTypeToDescriptionMap[reportType] || 'Transaction Report';
    const schedule = initialData.schedule || 'immediate';
    const isImmediate = schedule === 'immediate';

    initialize(name, key, {
      filename,
      description,
      emailContacts: null,
      uploadToFTP: false,
      schedule,
      startDate: startDate.value || new Date(),
      endDate: endDate.value || new Date(),
      dayOfTheWeek: null,
      exports: initialData.exports || 'pdf',
      isImmediate,
    });
    validate(name, key, this.validate);

    const stateToSet = { isImmediate };
    if (this.props.uniqueExportFormat) {
      stateToSet.exportsOptions = { ...this.state.exportsOptions, ...this.props.uniqueExportFormat };
    }
    this.setState(stateToSet);
  }

  componentWillReceiveProps(nextProps) {
    const { name, key, loadingSftpAccountDetails } = this.state;
    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(name, key, this.props.forms[name][key]._values);
    }
    if (loadingSftpAccountDetails && (nextProps.sftpFetchStatus.fetched || nextProps.sftpFetchError)) {
      this.setState((prev) => ({ ...prev, loadingSftpAccountDetails: false }));
    }
    this.setState({
      form: nextProps.forms[name] && nextProps.forms[name][nextProps.formKey || 'default'],
      key: 'default',
    });
  }

  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  onToggleFtpActive = ({ active }) => {
    this.props.updateFtpAccount({ ...this.props.ftpAccountDetails, active });
  };

  setupFtpAccount = () => {
    this.props.closeSchedulerModal();
    this.props.openFtpAccountSetupModal();
  };

  standardFormAction = (action, field, value) => {
    const { name, key } = this.state;
    if (action === 'change') {
      if (field === 'organization') {
        this.props[action](name, key, 'account', '');
      }

      if (field === 'schedule') { this.setState({ isImmediate: value === 'immediate' }); }

      this.props[action](name, key, field, value);
      this.props.validate(name, key, this.validate);
    } else {
      this.props[action](name, key, field);
    }
  };

  checkType = (type, against) => Utils.typesvalidator.validateType(this.props.types, type, against).valid;

  validate = (fields) => {
    const errors = {};
    const { form, isImmediate } = this.state;
    const dataIsMissing = (fieldName) => !fields[fieldName] || fields[fieldName] === '';
    if (dataIsMissing('exports')) {
      errors.exports = 'Export format required';
    }
    if (form && !isImmediate && dataIsMissing('schedule')) {
      errors.schedule = 'Schedule required';
    }
    if (form && form.schedule.value === 'weekly' && dataIsMissing('dayOfTheWeek')) {
      errors.dayOfTheWeek = 'Day of the Week required';
    }
    if (!fields.filename) {
      errors.filename = 'This field cannot be blank';
    }

    // periods in filenames will break the file extension when downloaded
    // vapCleared reports need to be able to have periods to support IronPay/Valicom
    if (this.props.reportType !== 'vapCleared') {
      const regex = /^[A-Za-z0-9_-]+$/;
      const isFilenameValid = regex.test(fields.filename);
      if (!isFilenameValid) {
        errors.filename = 'Filename can only contain alphanumeric characters - and _';
      }
    }
    if (fields.emailContacts) {
      const emails = fields.emailContacts.split(',');
      if (emails.some((email) => !this.checkType('EmailAddress', email))) {
        errors.emailContacts = emails.length > 1
          ? 'All emails must be valid email addresses'
          : Utils.typesvalidator.validationErrorMsgs.email;
      }
    }
    return errors;
  };

  isFtpActive = (ftpAccountDetails = {}) => (ftpAccountDetails.active);

  doesFtpAccountExist = (ftpAccountDetails = {}) => ('active' in ftpAccountDetails);

  isSftpActive = (sftpAccountDetails = {}) => (sftpAccountDetails.active);

  doesSftpAccountExist = (sftpAccountDetails = {}) => ('active' in sftpAccountDetails);

  render() {
    const {
      form,
      scheduleOptions,
      dayOptions,
      exportsOptions,
      isImmediate,
      loadingSftpAccountDetails,
    } = this.state;

    if (loadingSftpAccountDetails) {
      return <Components.spinner />;
    }

    if (!form || this.state.loadingSftpAccountDetails) {
      return null;
    }

    const { creating } = this.props.status;
    const error = this.props.status?.creatingError || this.props.sftpFetchError;

    const isFtpActive = this.isFtpActive(this.props.ftpAccountDetails);
    const isSftpActive = this.isSftpActive(this.props.sftp);
    const ftpExists = this.doesFtpAccountExist(this.props.ftpAccountDetails);
    const sftpExists = this.doesSftpAccountExist(this.props.sftp);

    return (
      <div className="components_forms_schedulereport floating-labels">
        <div className="row pt-3">
          <div className="col-md-6">
            <Components.forms.components.selectinput
              form={form}
              type="text"
              field="schedule"
              action={this.standardFormAction}
              label="Frequency"
              options={scheduleOptions}
              disabled={creating}
              hideError={!form.schedule.touched}
              required
            />
          </div>
          {
            isImmediate
            && (
              <>
                <div className="col-md-3">
                  <Components.forms.components.daypicker
                    form={form}
                    type="number"
                    field="startDate"
                    action={this.standardFormAction}
                    label="From"
                    dateRange={{ max: form.endDate.value }}
                    disabled={creating}
                  />
                </div>
                <div className="col-md-3">
                  <Components.forms.components.daypicker
                    form={form}
                    type="number"
                    field="endDate"
                    action={this.standardFormAction}
                    label="To"
                    dateRange={{ min: form.startDate.value }}
                    disabled={creating}
                  />
                </div>
              </>
            )
          }
          {
            !isImmediate && form.schedule.value === 'weekly'
            && (
              <div className="col-md-6">
                <Components.forms.components.selectinput
                  form={form}
                  type="text"
                  field="dayOfTheWeek"
                  action={this.standardFormAction}
                  label="Day of the Week"
                  options={dayOptions}
                  disabled={creating}
                  hideError={!form.schedule.touched}
                  required
                />
              </div>
            )
          }
        </div>
        <div className="row">
          <div className="col-6">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="filename"
              action={this.standardFormAction}
              label="File Name"
              disabled={creating || this.props.reportType === 'vapCleared'}
              hideError={!form.filename.touched}
              required
            />
          </div>
          <div className="col-6">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="description"
              action={this.standardFormAction}
              label="Description"
              disabled={creating}
              hideError={!form.description.touched}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-6">
            <Components.forms.components.textinput
              form={form}
              field="emailContacts"
              action={this.standardFormAction}
              label="Email Address(es)"
              hideError={!form.emailContacts.touched}
              detailedInformation="Comma separate multiple emails, i.e. x,y,z"
              disabled={creating}
            />
          </div>
          <div className="col-md-6">
            <Components.forms.components.selectinput
              form={form}
              type="text"
              field="exports"
              action={this.standardFormAction}
              label="Export Format"
              options={exportsOptions}
              disabled={creating || this.props.reportType === 'ac29' || this.props.reportType === 'vapCleared'}
              hideError={!form.exports.touched}
              required
            />
          </div>
        </div>
        <div className="row">
          <div className="col-6">
            <Components.forms.components.switch
              form={form}
              field="uploadToFTP"
              action={this.standardFormAction}
              label="Upload Report to FTP Server"
              disabled={creating
                || (!ftpExists && !sftpExists)
                || (ftpExists && !isFtpActive)
                || (sftpExists && !isSftpActive)
                || this.props.sftpFetchError}
            />
          </div>
        </div>
        {
          error
          && (
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Something Went Wrong</h4>
              {this.props.sftpFetchError
                ? 'Error fetching FTP details. Report can be created but cannot be uploaded to the FTP server.'
                : `Error: ${error}`}
            </div>
          )
        }
        {
          this.props.showCreatedNotification
          && (
            <div className="alert alert-primary" role="alert">
              {`Report ${isImmediate ? '' : 'Template'} successfully created! ${isImmediate ? 'Click here to view completed report,' : 'View and edit Report Templates below,'} or create another Report.`}
            </div>
          )
        }
        {
          (!ftpExists && !sftpExists && !this.props.sftpFetchError)
          && (
            <div className="alert alert-warning" role="alert">
              <h4 className="alert-heading">No FTP Configured</h4>
              <div>
                <span style={{ cursor: 'pointer' }} onClick={this.setupFtpAccount}>
                  <u>Click here</u>
                </span> to configure FTP for this account.
              </div>
            </div>
          )
        }
        {
          ((ftpExists && !isFtpActive) || (sftpExists && !isSftpActive))
          && (
            <div className="alert alert-warning" role="alert">
              <h4 className="alert-heading">FTP is Disabled</h4>
              <div>
                <span style={{ cursor: 'pointer' }} onClick={() => this.onToggleFtpActive({ active: true })}>
                  <u>Click here</u>
                </span> to reactivate FTP for this account.
              </div>
            </div>
          )
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_schedulereport);

