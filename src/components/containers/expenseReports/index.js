import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    expenseReportStatus: state.account.expenseReports.status,
    expenseReportPolicies: Selectors.entity('expenseReports_idOrganization_idAccount')(state),
    defaultId: _try(() => state.router.route.params.id),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openCreateExpenseReportModal: () => {
      dispatch(Store.router.openModal('Components.modals.createExpenseReport'));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_containers_expenseReports extends Component {




  render() {
    const { expenseReportStatus, expenseReportPolicies, defaultId } = this.props;
    if (!expenseReportStatus.fetched) return <Components.spinner />;
    return (
      <div className="components_containers_expenseReports">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="card-title mb-3">Expense Reports</h2>
          {expenseReportPolicies.canCreate &&
            <Components.button
              buttonText="Create New Report"
              onClick={this.props.openCreateExpenseReportModal}
              className="btn btn-primary"
              ariaLabel="Create New Report"
              updating={expenseReportStatus.creating}
              icon="mdi mdi-plus-circle text-white"
              iconLeft
            />
          }
        </div>
        <Components.tables.expenseReports defaultSelectedRowId={defaultId} />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_containers_expenseReports);


