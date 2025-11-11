import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import numeral from 'numeral';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    policies: Selectors.entity('achTransfers_idOrganization_idAccount')(state),
    transferStatus: state.account.achTransfers.status,
    paymentIssues: state.account.paymentIssues.data.items,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    cancelTransfer: (transferId) => {
      return dispatch(Store.account.updateAchTransferStatus(transferId, { status: 'cancelled' }));
    },
    openCancelModal: (data) => {
      dispatch(Store.router.openModal('Components.modals.areyousure', data));
    },
  });
};

class components_overviews_fundingtransfers extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    const { transferItem, transferStatus } = this.props;
    const batchBasedTransfer = Boolean(transferItem._forPayments);
    const isDeposit = Boolean(transferItem.amount >= 0);
    return (
      <div className="p-4">
        <h3>Details</h3>
        <div className="row">
          <div className="col-xs-12 col-md-4">
            <strong>Date</strong>
            <br />
            <p className="text-muted">
              {Utils.dates.dateToDay(transferItem._createdAt)}
            </p>
          </div>
          <div className="col-xs-12 col-md-4">
            <strong>Amount</strong>
            <br />
            <p className="text-muted">
              {numeral(transferItem.amount).format('$0,0.00')}
            </p>
          </div>
          <div className="col-xs-12 col-md-4">
            <strong>Status</strong>
            <br />
            <p className="text-muted">
              <Components.badges.fundingtransferstatus status={transferItem.status} />
            </p>
          </div>
          <div className="col-xs-12 col-md-4">
            <strong>Transfer ID</strong>
            <br />
            <p className="text-muted">
              {transferItem.id}
            </p>
          </div>
          {isDeposit &&
            <div className="col-xs-12 col-md-4">
              <strong>Funding Type</strong>
              <br />
              <p className="text-muted">
                {batchBasedTransfer ? 'Batch-Based' : 'Standard'}
              </p>
            </div>
          }
          {transferItem.clearing &&
            <div className="col-xs-12 col-md-4">
              <strong>Clearing Details</strong>
              <br />
              <p className="text-muted">
                {transferItem.clearing.source || transferItem.clearing.destination}
              </p>
            </div>
          }
        </div>
        {isDeposit &&
          <Fragment>
            <Components.fundingExplanation forTransferOverview transferItem={transferItem} />
          </Fragment>
        }
        {!isDeposit &&
          <Fragment>
            <Components.tables.withdrawalDetails
              tableKey={'withdrawalDetails'}
              paymentIssues={Object.keys(transferItem._forPaymentIssues || {}).reduce((issues, id) => {
                return { ...issues, [id]: this.props.paymentIssues[id] };
              }, {})}
            />
          </Fragment>
        }
        {transferItem.status === 'failed' && transferItem.failureReason &&
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Transfer Failed</h4>
            Failure Reason: {transferItem.failureReason}
          </div>
        }
        {
          this.props.policies.canUpdate && transferItem.status === 'pending' &&
          <div className="row">
            <div className="col-12 text-end">
              <Components.button
                onClick={() => {
                  this.props.openCancelModal({
                    title: 'Cancel ACH Transfer',
                    content: 'You are about to cancel your pending ACH Transfer',
                    noText: 'No',
                    yesText: 'Yes',
                    onYes: () => { this.props.cancelTransfer(transferItem.id); },
                  });
                }}
                className={'btn btn-danger do-not-expand'}
                type="button"
                aria-label="submit button"
                disabled={transferStatus.updating}
                updating={transferStatus.updating}
                buttonText={'Cancel Transfer'}
              />
            </div>
          </div>
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_fundingtransfers);


