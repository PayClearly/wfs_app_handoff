import { connect, Component, bindActionCreators, Fragment } from 'component';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';


const mapStateToProps = (state, props) => {
  return ({
    expenses: state.account.expenses.data.items,
    expenseReports: state.account.expenseReports.data.items,
    status: state.account.expenses.status,
    policies: Selectors.entity('expenses_idOrganization_idAccount')(state),
    forms: state.forms,
    userId: _try(() => state.user.profile.data.item._id, ''),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    updateExpense: (id, data) => {
      return dispatch(Store.account.updateExpense(id, data));
    },
    clearStatusErrors: () => {
      return dispatch(Store.account.clearErrorsExpenses());
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_entities_expense extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formName: 'Components.forms.expense',
      formKey: props.formKey || props.id,
      editBtnText: 'Edit Expense',
    };
  }




  onSubmit = () => {
    const { id, forms, expenses } = this.props;
    const expense = expenses[id];
    const data = { ..._try(() => forms[this.state.formName][this.state.formKey]._values) || {} };
    if (_try(() => data.receipt.storagePath === expense.receipt.storagePath)) {
      delete data.receipt;
    }
    this.props.updateExpense(id, data);
  }

  onCancel = () => {
    this.setState({ blurAll: false });
  }

  render() {
    const { id, expenses, status, policies, clearStatusErrors, forms, expenseReports } = this.props;

    const form = _try(() => forms[this.state.formName][this.state.formKey]) || {};
    const error = status.updatingError;
    const updating = status.updating;
    const updateDisabled = updating || !form._allValid || form._allInitial;

    const expense = _try(() => expenses[id], {});
    const isInSubmittedReport = expense.reportId && _try(() => expenseReports[expense.reportId].submitted);
    const isInApprovedReport = expense.reportId && _try(() => expenseReports[expense.reportId].approvalId);
    let includeDelete = {
      item: 'expense',
      onYes: () => { this.props.updateExpense(id, { deleted: true }); },
      checkForSuccess: (accountResources) => { if (_try(() => accountResources.expenses.data.items[id].deleted)) return true; return false; },
    };
    if (isInApprovedReport) includeDelete = false;

    return (
      <div className="components_entities_expense p-3">
        <Components.entities.entitywrapper
          canRead={policies.canRead}
          canUpdate={policies.canUpdate && _try(() => expense.createdBy === this.props.userId) && !isInApprovedReport && !isInSubmittedReport}
          canDelete={policies.canDelete}
          onSubmit={this.onSubmit}
          onCancel={this.onCancel}
          clearStatusErrors={clearStatusErrors}
          updating={updating}
          error={error}
          updateDisabled={updateDisabled}
          editBtnText={this.state.editBtnText}
          onDisabledClick={() => { this.setState({ blurAll: true }); }}
          includeDelete={_try(() => expense.createdBy === this.props.userId) && includeDelete}
        >
          <Components.overviews.expense id={id} />
          <Components.forms.expense
            formKey={this.state.formKey}
            blurAll={this.state.blurAll}
            initialData={expenses[id]}
          />
        </Components.entities.entitywrapper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_entities_expense);


