import { connect, Component } from 'component';

// Third Party Imports ...

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
    forms: state.forms,
    status: state.account.reportTemplates.status,
    organizations: state.organizations.data.items,
    organizationId: state.organization.data.id,
    accounts: state.accounts.data.items,
    accountId: state.account.data.id,
    profile: state.user.profile.data.item,
    policies: Selectors.entity('reports_idOrganization_idAccount')(state),
  });

const mapDispatchToProps = (dispatch) => ({
    createReport: (organizationId, accountId, data) => {
      dispatch(Store.account.reporttemplates.create(organizationId, accountId, data));
    },
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
    clearStatusErrors: () => {
      dispatch(Store.account.reporttemplates.clearErrors());
    },
    destroyForm: (name, key) => {
      dispatch(Store.forms.destroy(name, key));
    },
  });

class components_modals_reportschedule extends Component {
  state = {
    createFormActive: true,
    showCreatedNotification: false,
    reportOptions: {
      transaction: { display: 'Transaction Details' },
      spendByVendor: { display: 'Spend By Merchant' },
      spendByCard: { display: 'Spend By Card' },
      recon: { display: 'Recon' },
      ac28: { display: 'AC28' },
      ac29: { display: 'AC29' },
      vapCleared: { display: 'VAPCleared' },
      pctrAch: { display: 'PCTR (ACH)' },
      pctrCheck: { display: 'PCTR (Check)' },
      pctrCard: { display: 'PCTR (Card)' },
      checkActivity: { display: 'Check Activity' },
    },
  };

  onDisabledClick = () => this.setState({ blurAll: true });

  onSubmit = () => {
    const {
      createReport,
      organizationId,
      accountId,
      forms,
      columns = [],
      renderColumns = [],
      orderBy, type,
      includeLineItems, 
    } = this.props;

    const form = forms['Components.forms.schedulereport'].default._values;
    const { schedule, dayOfTheWeek, exports } = form;

    const startDate = (schedule === 'immediate') ? form.startDate.toISOString() : null;
    const endDate = (schedule === 'immediate') ? form.endDate.toISOString() : null;
    const filename = (schedule === 'immediate' || type === 'vapCleared') ? this._defaultName(type) : form.filename;
    const description = (schedule === 'immediate') ? 'Transaction Report' : form.description;

    const emailContacts = form.emailContacts ? form.emailContacts.split(',') : null;

    const data = {
      type,
      schedule: schedule === 'weekly' ? dayOfTheWeek : schedule,
      startDate,
      endDate,
      exports: [exports],
      filename,
      description,
      emailContacts,
      orderBy: orderBy || { dataField: 'Process Date', direction: 'desc' },
      includeLineItems,
      uploadToFTP: form.uploadToFTP,
    };

    if (columns.length) {
 data.selectFields = columns.map((column) => ({
 dataField: column.dataField, customName: column.text || false, isCustomField: column.isCustomField, skipQuery: column.skipQuery || false, 
})); 
}
    if (renderColumns.length) {
 data.renderFields = renderColumns.map((column) => ({
 dataField: column.dataField, customName: column.text || false, isCustomField: column.isCustomField, skipQuery: column.skipQuery || false, 
})); 
}

    createReport(organizationId, accountId, data);
  };

  onCreate = () => {
    const { forms, resetForm, destroyForm } = this.props;
    resetForm('Components.forms.schedulereport', 'default', forms['Components.forms.schedulereport'].default._values);

    Object.keys(forms['Components.forms.schedulereport']).forEach((formKey) => {
      if (formKey !== 'default') { 
        destroyForm('Components.forms.schedulereport', formKey); 
      }
    });
    this.setState({ showCreatedNotification: true });
    this.props.close();
  };

  _defaultName = (type) => {
    const {
      organizations,
      organizationId,
      accounts,
      accountId, 
    } = this.props;
    const today = Utils.dates.dateToDay(Date.now(), 'validThroughDay');
    const accountName = accounts[accountId].name.replace(/\s/g, '_').trim();
    if (type === 'vapCleared') { return formatVAPClearedFilename(accountName, today); }
    const orgName = organizations[organizationId].name.replace(/\s/g, '_').trim();
    return `PCTR_${orgName}_${today}`;
  };

  render() {
    const { close, forms } = this.props;
    const allValid = _try(() => forms['Components.forms.schedulereport'].default._allValid, false);

    const initialScheduleData = { 
      exports: this.props.exports || 'pdf',
      schedule: this.props.schedule || 'immediate',
    };

    return (
      <div className="modal-dialog" style={{ width: '75%', maxWidth: '100%' }} role="document">
        <div className="modal-content components_modals_reportschedule">
          <div className="modal-header">
            <h4 className="modal-title" id="reportschedule">
              {`Schedule A Report: ${_try(() => this.state.reportOptions[this.props.type].display)}`}
            </h4>
            <button onClick={close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body" style={{ overflowX: 'scroll', overflowY: 'scroll' }}>
            <Components.creators.creatorwrapper
              canCreate={this.props.policies.canCreate}
              createFormActive={this.state.createFormActive}
              status={this.props.status}
              onCreate={this.onCreate}
              clearStatusErrors={this.props.clearStatusErrors}
            >
              <Components.forms.schedulereport
                reportType={this.props.type}
                initialData={initialScheduleData}
                uniqueExportFormat={this.props.uniqueExportFormat}
                blurAll={this.state.blurAll}
                onDisabledClick={this.onDisabledClick}
                closeSchedulerModal={close}
              />
            </Components.creators.creatorwrapper>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
              onClick={close}
            >
              Close
            </button>
            <button
              aria-label="submit"
              disabled={!allValid}
              type="button"
              className="btn btn-primary"
              data-dismiss="modal"
              onClick={this.onSubmit}
              style={{ minWidth: '85px' }}
            >
              { this.props.status.creating && <Components.spinner height={'20px'} /> || 'Schedule' }
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_reportschedule);

// Internal Helper Functions ...
function formatVAPClearedFilename(accountName, date) {
  const name = accountName.replace(/\s/g, '_').trim();
  const formatDate = `${date}0000`;
  const fileType = 'VAPCleared';
  const ext = 'dat';
  return `${name}.${formatDate}.${fileType}.${ext}`;
}
