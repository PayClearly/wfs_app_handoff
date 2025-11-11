import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    fundingDetails: Selectors.funding(state),
    paymentsToBatches: Selectors.paymentsToBatches(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_tables_earmarkFundingExplanation extends Component {
  state = {
    columns: [],
  };

  componentDidMount() {
    const columns = [
      { label: '', dataKey: 'status', sort: true, sortKey: 'primary', cellRenderer: (data = {}) => { return <Components.badges.pipelinestatus data={data} />; } },
      { label: '', dataKey: 'batchDate', sort: true, default: 'Unknown', cellRenderer: CreatedDate },
      { label: '', dataKey: 'paymentCount', sort: true, default: 0 },
      { label: '', dataKey: 'batchTotal', sort: true, default: '', cellRenderer: Total },
      { label: '', dataKey: 'cardTotal', sort: true, default: '', cellRenderer: Total },
      { label: '', dataKey: 'createdByProfile', sort: true, sortKey: 'email', cellRenderer: (createdByProfile) => { return <Components.badges.createdby user={createdByProfile} />; } },
    ];
    this.setState({ columns });
  }


  getRowData = (transfer) => {
    return {
      ...transfer,
      amount: transfer.amount.value,
      formattedAmount: numeral(transfer.amount.value).format('$0,0.00'),
      formattedDate: transfer._createdAt ? Utils.dates.dateToDay(transfer._createdAt) : null,
      transferId: transfer.id,
      active: transfer.status !== 'cancelled',
    };
  };

  render() {
    const { columns } = this.state;
    const { fundingDetails, paymentsToBatches } = this.props;

    const data = {};

    return (
      <div className="components_tables_earmarkFundingExplanation">
        <Components.tables.components.collapsabletable
          columns={columns}
          data={data}
          doNotExpand
          noDataText="No batches to dipslay"
          sortBy="_createdAt"
          orderIn="desc"
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_earmarkFundingExplanation);


