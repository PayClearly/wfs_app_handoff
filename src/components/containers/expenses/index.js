import { connect, Component, bindActionCreators, Fragment } from 'component';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';


const mapStateToProps = (state, props) => {
  return ({
    expenseStatus: state.account.expenses.status,
    expensePolicies: Selectors.entity('expenses_idOrganization_idAccount')(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openCreateExpenseModal: () => {
      dispatch(Store.router.openModal('Components.modals.createExpense'));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_containers_expenses extends Component {




  render() {
    const { expenseStatus, expensePolicies } = this.props;
    if (!expenseStatus.fetched) return <Components.spinner />;
    return (
      <div className="components_containers_expenses">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="card-title mb-3">Expenses</h2>
          {expensePolicies.canCreate &&
            <Components.button
              buttonText="Add New Expense"
              onClick={this.props.openCreateExpenseModal}
              className="btn btn-primary"
              ariaLabel="Add New Expense"
              updating={expenseStatus.creating}
              icon="mdi mdi-plus-circle text-white"
              iconLeft
            />
          }
        </div>
        <Components.tables.expenses enableExportCSV exportName="Expenses" />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_containers_expenses);


