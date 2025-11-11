import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
import job from '../../../api/jobs/index';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    policies: Selectors.entity('jobs_*_*')(state),
    batchPayments: state.account.batchPayments.data.items,
    batchPaymentsStatus: state.account.batchPayments.status,
    organizationId: state.organization.data.id,
    accountId: state.account.data.id,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_routes_ghostBatches extends Component {

  componentDidMount() { }

  componentWillUnmount() { }

  handleDenormalizeClick = (batchId) => {
    const reqBody = {
      metadata: {
        organizationId: this.props.organizationId,
        accountId: this.props.accountId,
        batchId: Number(batchId),
      },
    };
    job.create('createBatchPayment', this.props.organizationId, this.props.accountId, reqBody);
  };

  actionButtonRenderer = (id) => {
    return (
      <span>
        <Components.button
          onClick={() => {
            this.handleDenormalizeClick(id);
          }}
          className="btn btn-primary"
          type="button"
          aria-label="denormalize button"
          disabled={false}
          buttonText="👻 Denormalize  👻"
        />
      </span>
    );
  };

  render() {
    const columns = [
      {
        label: 'Id', dataKey: '_id', sort: true, default: 'Batch Id not found',
      },
      {
        label: '', dataKey: '_id', sort: false, cellRenderer: (data) => { return this.actionButtonRenderer(data); },
      },
    ];

    const keys = Object.keys(this.props.batchPayments || {});
    const filteredKeys = keys.filter((key) => !this.props.batchPayments[key].createdAt);
    const data = filteredKeys.map((k) => {
      return { _id: k };
    });
    const { policies } = this.props;

    if (!policies.canUpdate) return null;
    if (!this.props.accountId) return <span>No Organization Selected</span>;

    return (
      <div className="components_routes_ghostBatches pt-4">
        {this.props.batchPaymentsStatus && this.props.batchPaymentsStatus.fetched
          ? <Components.tables.components.collapsabletable
            columns={columns}
            data={data}
            noDataText="No Ghost Batches Found"
            orderIn="asc"
            paginatedTable
            rowsPerPage={10}
            sortBy="_id"
            doNotExpand
          />
          : <Components.spinner />}
      </div>

    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_routes_ghostBatches);


