import { connect, Component } from 'component';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';
import { downloadAttachment, fetchAttachment } from '../../../api/attachments';

import './index.scss';

const mapStateToProps = (state) => ({
  organizations: state.organizations.data.items,
  // paymentUploads: _try(() => state.account.paymentUploads.data.items),
});

const mapDispatchToProps = (dispatch) => ({
  navigateToPayments: (...data) => {
    dispatch(Store.router.navigateTo('create', ...data));
  },
  navigateToCsrDashboard: () => {
    dispatch(Store.router.navigateTo('csrdashboard'));
  },
  updatePaymentUpload: (data) => {
    dispatch(Store.account.updatePaymentUpload(data));
  },
});

const mapResourcesToProps = (state, props) => Object.keys(props.organizations || {}).reduce((acc, cur) => {
  acc[cur] = `state/paymentUploads/${cur}`;
  return acc;
}, {});

class components_routes_ftpPayments extends Component {

  componentDidMount() { }

  componentWillUnmount() { }

  onGoToPayments = ({ _id, forSFTP }) => this.props.navigateToPayments({ tab: 'payments', ftpItem: _id, forSFTP });

  onGoToCsrDashboard = () => this.props.navigateToCsrDashboard();

  onDownloadClick = ({ attachment, forSFTP }) => {
    const forFTP = !forSFTP;
    return downloadAttachment({ ...attachment, forFTP, forSFTP });
  };

  onCreatePaymentsClick = ({ attachment, forSFTP }) => {
    const forFTP = !forSFTP;
    return fetchAttachment({ ...attachment, forFTP, forSFTP });
  };

  onHoldClick = (id, status) => {
    const statusToUpdateMap = {
      held: 'pending',
      pending: 'held',
    };
    const toPatch = {
      id,
      status: statusToUpdateMap[status],
    };
    this.props.updatePaymentUpload(toPatch);
  };

  onArchiveClick = (id, status) => {
    if (status === 'processed') {
      return;
    }
    const statusToUpdateMap = {
      pending: 'archived',
      archived: 'pending',
    };
    const toPatch = {
      id,
      status: statusToUpdateMap[status],
    };
    this.props.updatePaymentUpload(toPatch);
  };

  generateOrgNeedsAttentionBanner = (org) => {
    if (this.props[org]) {
      const orgItems = this.props[org] || {};
      const banners = Object.keys(orgItems).reduce((acc, cur) => {
        const accountItems = orgItems[cur] || {};
        Object.keys(accountItems).forEach((uploadedFile) => {
          if (accountItems[uploadedFile].status === 'pending'
            && !_isDateOlderThanNinetyDays(accountItems[uploadedFile].uploadedAt)) {
            acc[`${org},${cur}`] = true;
          }
        });
        return acc;
      }, {});
      return Object.keys(banners).map((orgAcc) => {
        const [organizationId, accountId] = orgAcc.split(',');
        return <Components.widgets.ftpAccountAttentionBanner organization={organizationId} account={accountId} />;
      });
    }
  };

  render() {
    return (
      <div className="components_routes_ftpPayments">
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          <h4>Pending Pay Files</h4>
          <div style={{ display: 'flex', flexDirection: 'column', width: '500px' }}>
            {Object.keys(this.props.organizations || {}).map((org) => (
              this.generateOrgNeedsAttentionBanner(org)
            ))}
          </div>
        </div>
        <Components.ftpPaymentsLoader
          onDownloadClick={this.onDownloadClick}
          onCreatePaymentsClick={this.onCreatePaymentsClick}
          onItemClick={this.onGoToPayments}
          onNavigateToPaymentsClick={this.onGoToCsrDashboard}
          onArchiveClick={this.onArchiveClick}
          onHoldClick={this.onHoldClick}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_routes_ftpPayments);

// Internal Helper Functions ...
function _isDateOlderThanNinetyDays(dateString) {
  const thirtyDaysInMS = 90 * 24 * 60 * 60 * 1000;
  const dateToMS = Date.parse(dateString);
  const now = Date.now();
  const thirtyDaysAgo = now - thirtyDaysInMS;
  return thirtyDaysAgo > dateToMS;
}
// GENERATOR_TYPE='component';
