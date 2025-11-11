import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import numeral from 'numeral';

import Utils from 'utils';
import Selectors from 'selectors';
import Components from 'components';


import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    opsPayments: state.opsPayments.data.items,
    filteredAndSortedItems: Selectors.tableItems('Components.tables.opsPayments', props.tableKey, 'state.opsPayments.data.items')(state),
    routeParams: state.router.route.params,
    router: state.router,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_tables_opsPayments extends Component {
  state = {
    columns: [
      { label: '', dataKey: 'status', sortable: false, cellRenderer: (data, paymentId, paymentStatus) => { return this.linkRenderer(paymentStatus); }, disableExport: true },
      { label: 'Date', dataKey: 'createdAt', sortable: true, default: 'Unknown', cellRenderer: (date, paymentId, paymentStatus) => { return paymentStatus.cardExpiringSoon ? <Components.tooltip className="float-start text-danger"><div>{Utils.dates.dateToDay(date)}</div><div>Card Expiring Soon</div></Components.tooltip> : Utils.dates.dateToDay(date); }, exportFormatter: Utils.dates.dateToDay },
      { label: 'To', dataKey: 'vendorName', sortable: true, default: 'Unknown' },
      { label: 'Amount', dataKey: 'amount', sortable: true, default: 'Unknown', cellRenderer: FormatAmount, exportFormatter: FormatAmount },
      { label: 'Method', dataKey: 'method', sortable: true, cellRenderer: (data) => { return <Components.badges.acceptsmethod data={data} />; } },
      { label: 'Organization', dataKey: 'organization', sortable: true },
      { label: 'Account', dataKey: 'account', sortable: true },
      { label: 'Status', dataKey: 'status', sortable: true },
      { label: 'Card Last 4', dataKey: 'cardNumberLastFour', sortable: true },
    ],
  };


  componentWillUnmount() {
    // }
  }
  linkRenderer = (paymentStatus) => {
    const path = `${this.props.router.baseUrl}/csrpayment/${paymentStatus.id}/?orgId=${paymentStatus.organizationId}&accountId=${paymentStatus.accountId}`;
    return (
      <Components.clicktocopytextwrapper
        value={path}
        showTooltip
        stopPropagation
        copyText
      >
        <div style={{ cursor: 'pointer' }}><i className="mdi mdi-link-variant text-primary mdi-8px ms-1" /></div>
      </Components.clicktocopytextwrapper>
    );
  }

  render() {
    const { filteredAndSortedItems, opsPayments } = this.props;

    return (
      <Fragment>
        {/* <Components.tables.components.multiFilter
          tableName="Components.tables.opsPayments"
          tableKey={this.props.tableKey || 'default'}
          filterConfig={filterConfig.multiFilter}
        /> */}
        <Components.tables.components.collapsibleTable
          tableName="Components.tables.opsPayments"
          tableKey={this.props.tableKey}
          initialTableStateOverride={this.props.initialTableStateOverride}
          defaultTableState={{
            sort: {
              sortKey: 'createdAt',
              orderIn: 'desc',
              tieBreakKey: 'id',
            },
          }}
          data={{
            items: opsPayments,
            count: Object.keys(opsPayments || {}).length,
          }}
          itemOrder={_try(() => filteredAndSortedItems, [])}
          columns={this.state.columns}
          typeForNoDataText="Payments"
          doNotExpand
          paginate
          initialRowsPerPage={25}
          exportName="Payments"
        />
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_opsPayments);

// Internal Helper Functions ...
//     },
//     },
//     },
//       'Needs Approval': { display: 'Needs Approval' },
//       'Pending...': { display: 'Pending' },
//       'Processing...': { display: 'Processing' },
//       'Verifying...': { display: 'Verifying' },
//       'Funding...': { display: 'Funding' },
//       'Tracking...': { display: 'Tracking' },
//     },
//     },
//   },
// };

// internal helper functions
const FormatAmount = (amount) => {
  return (amount) ? numeral(amount).format('$0,0.00') : null;
};
