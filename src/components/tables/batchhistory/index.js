import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';
import { props } from 'bluebird';

const mapStateToProps = (state, props) => {
  return ({
    batchPayments: state.account.batchPayments.status,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openPaymentPresendModal: (id) => { dispatch(Store.router.openModal('Components.modals.paymentsend.modal', { id })); },
    openAreYouSureModal: (data) => { dispatch(Store.router.openModal('Components.modals.areyousure', data)); },
    markBatchAsCancelled: (ids, params) => { dispatch(Store.account.updatePaymentPipelines(ids, 'cancelPayments', params)); },
  });
};

class components_tables_batchhistory extends Component {
  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    if (this.props.batchPayments.fetching || !this.props.batchPayments.fetched) return <Components.spinner />;
    if (this.props.tableKey === 'csraccountdetails') {
      return (
        <Components.overviews.csrPaymentBatch
          tableKey={this.props.tableKey}
          onActionClick={this.props.onActionClick}
          cancelBatch={this.props.cancelBatch}
          editBatch={this.props.editBatch}
        />
      );
    }
    return (
      <Components.overviews.paymentBatch
        tableKey={this.props.tableKey}
        onActionClick={this.props.onActionClick}
        cancelBatch={this.props.cancelBatch}
        editBatch={this.props.editBatch}
        batchesToRender={this.props.batchesToRender}
        forFunding={this.props.forFunding}
        nestedInFundingTable={this.props.nestedInFundingTable}
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_batchhistory);


