import { connect, Component } from 'component';

import Components from 'components';
import Selectors from 'selectors';
import Store from 'store';
import PaymentUploads from '../PaymentUploads';

import './index.scss';

const mapStateToProps = (state) => ({
  paymentUploads: _try(() => state.account.paymentUploads.data.items),
  paymentUploadsStatus: _try(() => state.account.paymentUploads.status),
  bypassPaymentUploader: Selectors.featureFlags(state).bypassPaymentUploader,
  paymentStatusesStatus: state.account.paymentStatuses.status,
});

const mapDispatchToProps = (dispatch) => ({
  createPaymentsWithText: ({ textPayments, paymentUploadId, contentType }) => dispatch(Store.account.createPaymentsWithText({ textPayments, paymentUploadId, contentType })),
});

const mapResourcesToProps = () => ({});

class components_ftpPaymentsLoader extends Component {





  render() {
    if (!this.props.paymentUploadsStatus.fetched) { return <Components.spinner />; }
    const paymentUploads = Object.values(this.props.paymentUploads || {}).filter((upload) => !_isDateOlderThanNinetyDays(upload.uploadedAt));
    const error = this.props.paymentUploadsStatus.updatingError || '';
    const { pending, processed, held } = paymentUploads.reduce((acc, payment) => {
      if (payment.status === 'held') {
        acc.held.push(payment);
      } else if (payment.status === 'pending') {
        acc.pending.push(payment);
      } else {
        acc.processed.push(payment);
      }
      return acc;
    }, {
      pending: [], processed: [], archived: [], held: [],
    });

    pending.sort(_sortByUploadTime);
    processed.sort(_sortByUploadTime);

    const sortedPaymentUploads = [...held, ...pending, ...processed];

    return (
      <div className="components_ftpPaymentsLoader">
        <h2 className="text-primary">FTP Uploads</h2>
        {error
          && (
            <div className="col-12">
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            </div>
          )}
        {
          sortedPaymentUploads.length ? (
            <PaymentUploads
              data={sortedPaymentUploads}
              navigateToPayments={this.props.onItemClick}
              navigateToCsrDashboard={this.props.onNavigateToPaymentsClick}
              updatePaymentUpload={this.props.onArchiveClick}
              downloadAttachment={this.props.onDownloadClick}
              fetchAttachment={this.props.onCreatePaymentsClick}
              holdPayment={this.props.onHoldClick}
              bypassPaymentUploader={this.props.bypassPaymentUploader}
              createPaymentsWithText={this.props.createPaymentsWithText}
              paymentStatusesStatus={this.props.paymentStatusesStatus}
            />
          ) : (
            <div className="col-12">
              <div className="d-flex align-items-center justify-content-center" style={{ margin: '0 auto' }}>
                <i className="mdi text-success mdi-check mdi-48px" />
                <h2 className="my-0 ms-1">This account currently has no ftp payments</h2>
              </div>
            </div>
          )
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ftpPaymentsLoader);

// Internal Helper Functions ...

function _isDateOlderThanNinetyDays(dateString) {
  const thirtyDaysInMS = 90 * 24 * 60 * 60 * 1000;
  const dateToMS = Date.parse(dateString);
  const now = Date.now();
  const thirtyDaysAgo = now - thirtyDaysInMS;
  return thirtyDaysAgo > dateToMS;
}

function _sortByUploadTime(a, b) {
  const aDate = Date.parse(a.uploadedAt);
  const bDate = Date.parse(b.uploadedAt);
  return bDate - aDate;
}

