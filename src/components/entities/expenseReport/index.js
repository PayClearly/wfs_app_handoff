import { connect, Component } from 'component';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

const mapStateToProps = (state) => ({
  expenseReports: state.account.expenseReports.data.items,
  status: state.account.expenseReports.status,
  policies: Selectors.entity('expenseReports_idOrganization_idAccount')(state),
  forms: state.forms,
  userId: _try(() => state.user.profile.data.item._id, ''),
});

const mapDispatchToProps = (dispatch) => ({
  updateExpenseReport: (id, data) => dispatch(Store.account.updateExpenseReport(id, data)),
  clearStatusErrors: () => dispatch(Store.account.clearErrorsExpenseReports()),
});

// eslint-disable-next-line camelcase
class components_entities_expenseReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formName: 'Components.forms.expenseReport',
      formKey: props.formKey || props.id,
      editBtnText: 'Edit Report',
    };
  }

  onSubmit = () => {
    const { id, forms } = this.props;
    const data = { ..._try(() => forms[this.state.formName][this.state.formKey]._values) || {} };
    this.props.updateExpenseReport(id, data);
  };

  onCancel = () => {
    this.setState({ blurAll: false });
  };

  submitExpenseReport = () => {
    this.props.updateExpenseReport(this.props.id, { submitted: true });
  };

  render() {
    const {
      id, expenseReports, status, policies, clearStatusErrors, forms,
    } = this.props;
    const expenseReport = _try(() => expenseReports[id], {});

    const form = _try(() => forms[this.state.formName][this.state.formKey]) || {};
    const error = status.updatingError;
    const { updating } = status;
    const updateDisabled = updating || !form._allValid || form._allInitial;

    let includeDelete = {
      item: 'expense report',
      onYes: () => { this.props.updateExpenseReport(id, { deleted: true, expenseIds: [] }); },
      checkForSuccess: (accountResources) => {
        if (_try(() => accountResources.expenseReports.data.items[id].deleted)) { return true; } return false;
      },
    };
    if (expenseReport.approvalId) { includeDelete = false; }

    return (
      <div className="components_entities_expenseReport p-3">
        <Components.entities.entitywrapper
          canRead={policies.canRead}
          canUpdate={!expenseReport.submitted
            && policies.canUpdate
            && !expenseReport.approvalId
            && _try(() => expenseReport.createdBy === this.props.userId)}
          canDelete={policies.canDelete}
          onSubmit={this.onSubmit}
          onCancel={this.onCancel}
          clearStatusErrors={clearStatusErrors}
          updating={updating}
          error={error}
          updateDisabled={updateDisabled}
          editBtnText={this.state.editBtnText}
          onDisabledClick={() => { this.setState({ blurAll: true }); }}
          includeDelete={_try(() => expenseReport.createdBy === this.props.userId) && includeDelete}
          additionalButtons={(!expenseReport.submitted && !expenseReport.approvalId)
            ? (
              <Components.button
                onClick={this.submitExpenseReport}
                className={'btn btn-secondary ms-2'}
                buttonText="Submit"
                updating={updating}
                disabled={updating}
              />
            ) : null}
        >
          <Components.overviews.expenseReport id={id} />
          <Components.forms.expenseReport
            formKey={this.state.formKey}
            blurAll={this.state.blurAll}
            initialData={expenseReport}
          />
        </Components.entities.entitywrapper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_expenseReport);
