import {
  connect, Component, bindActionCreators, Fragment,
} from 'component';
import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import { PopoverHeader, PopoverBody } from 'reactstrap';

const mapStateToProps = (state) => ({
  expenseReports: Selectors.tableData.expenseReports(state).items,
});

const mapDispatchToProps = (dispatch) => ({
  goToExpenseReports: (routeParams, routeOptions) => {
    dispatch(Store.router.navigateTo('expenseReports', routeParams, routeOptions));
  },
});

// eslint-disable-next-line camelcase
class components_tables_expenseReportChipPopover extends Component {

  navigateToDetails = () => {
    this.props.goToExpenseReports({ id: this.props.refId });
  };

  render() {
    const { expenseReports, refId } = this.props;
    const expenseReport = _try(() => expenseReports[refId], {});

    return (
      <div className="components_tables_expenseReportChipPopover">
        <PopoverHeader className="chip-popover-header">
          <span>
            <i className="mdi mdi-cash-multiple me-1" />
            Expense Report Details
          </span>
          <i role="tooltip" className="mdi mdi-link float-end" onClick={this.navigateToDetails} />
        </PopoverHeader>
        <PopoverBody>
          <table>
            <tr>
              <td>Name:</td>
              <td>{expenseReport.name}</td>
            </tr>
            <tr>
              <td className="me-3">Status:</td>
              <td><Components.badges.expenseReportStatus status={expenseReport.status} /></td>
            </tr>
            <tr>
              <td>Submit Date:</td>
              <td>{Utils.dates.dateToDay(expenseReport._createdAt, 'dateFormatUS')}</td>
            </tr>
          </table>
        </PopoverBody>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_expenseReportChipPopover);

