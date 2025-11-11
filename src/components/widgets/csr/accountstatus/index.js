import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    organization: state.organization.data.id,
    account: state.account.data.id,
    organizations: state.organizations.data.items,
    allAccounts: state.admin.accounts.data.item,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    changeContext: (orgId, accId) => {
      dispatch(Store.organization.sync(orgId, accId));
    },
    navigateToIntegration: () => {
      dispatch(Store.router.navigateTo('integrations'));
    },
  });
};

class components_widgets_csr_accountstatus extends Component {




  render() {
    const { accountData, context } = this.props;
    const { orgId, accountId } = context;

    return (
      <div
        className="components_widgets_csr_accountstatus pt-2 px-3"
        role="tooltip"
        onClick={() => { this.props.changeContext(orgId, accountId); }}
      >
        <div className="body w-100 card">
          <div className="row">
            <div className="col-md-2 col-12">
              <h4 className={`mb-0${this.props.organization === orgId && this.props.account === accountId ? ' text-primary' : ''}`}>{_try(() => this.props.allAccounts[orgId][accountId].name)}</h4>
              <p className={`mb-0${this.props.organization === orgId && this.props.account === accountId ? ' text-primary' : ' text-muted'}`}>{_try(() => this.props.organizations[orgId].name)}</p>
            </div>
            {Boolean(accountData.paymentsWithErrors) &&
              <div className="border-left col-md-auto col-12">
                <p className="text-muted mb-0">Errors</p>
                <h1 className="mb-0 text-danger" ><strong>{accountData.paymentsWithErrors}</strong></h1>
              </div>
            }
            {Boolean(accountData.paymentsToBeSent) &&
              <div className="border-left col-md-auto col-12">
                <p className="text-muted mb-0">Payments</p>
                <h1 className="mb-0 text-danger" ><strong>{accountData.paymentsToBeSent}</strong></h1>
              </div>
            }
            {Boolean(accountData.transfersNeedAttention) &&
              <div className="border-left col-md-auto col-12">
                <p className="text-muted mb-0">Transfers</p>
                <h1 className="mb-0 text-danger" ><strong>{accountData.transfersNeedAttention}</strong></h1>
              </div>
            }
            {Boolean(accountData.otherPendingPayments) &&
              <div className="border-left col-md-auto col-12">
                <p className="text-muted mb-0">Payments Pending</p>
                <h1 className="mb-0 text-primary" ><strong>{accountData.otherPendingPayments}</strong></h1>
              </div>
            }
            {Boolean(accountData.paymentsWithDeliveryIssues) &&
              <div className="border-left col-md-auto col-12">
                <p className="text-muted mb-0">Delivery Issues</p>
                <h1 className="mb-0 text-warning" ><strong>{accountData.paymentsWithDeliveryIssues}</strong></h1>
              </div>
            }
            {Boolean(accountData.paymentsAwaitingAuthorization) &&
              <div className="border-left col-md-auto col-12">
                <p className="text-muted mb-0">Awaiting Authorization</p>
                <h1 className="mb-0 text-warning" ><strong>{accountData.paymentsAwaitingAuthorization}</strong></h1>
              </div>
            }
            {Boolean(accountData.transfersPending) &&
              <div className="border-left col-md-auto col-12">
                <p className="text-muted mb-0">Transfers Pending</p>
                <h1 className="mb-0 text-warning" ><strong>{accountData.transfersPending}</strong></h1>
              </div>
            }
            {Boolean(accountData.paymentIssues) &&
              <div className="border-left col-md-auto col-12">
                <p className="text-muted mb-0">Payment Issues</p>
                <h1 className="mb-0 text-danger" ><strong>{accountData.paymentIssues}</strong></h1>
              </div>
            }
            {Boolean(accountData.creditLimitSync) &&
              <div className="border-left col-md-auto col-12">
                <p className="text-muted mb-0">Credit Limit Sync</p>
                <h1 className="mb-0 text-danger" ><strong>{1}</strong></h1>
              </div>
            }
            {Boolean(accountData.currentERPErrors) &&
              <div
                className="border-left col-md-auto col-12"
                onClick={this.props.navigateToIntegration}
                style={{ position: 'relative' }}
                role="tooltip"
              >
                <p className="text-muted mb-0">ERP Errors</p>
                <h1 className="mb-0 text-danger" ><strong>{accountData.currentERPErrors}</strong></h1>
                <Components.tooltip
                  style={{
                    position: 'absolute',
                    bottom: '-9px',
                    right: '4px',
                    fontSize: '1.5rem',
                  }}
                  className="float-start pe-2"
                >
                  <i className="mdi mdi-arrow-left-thick text-primary" />
                  <div>View Integration</div>
                </Components.tooltip>
              </div>
            }
            {Boolean(accountData.paymentsWithCardExpiringSoon) &&
              <div className="border-left col-md-auto col-12">
                <p className="text-muted mb-0">Card Expiring Soon</p>
                <h1 className="mb-0 text-warning" ><strong>{accountData.paymentsWithCardExpiringSoon}</strong></h1>
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_widgets_csr_accountstatus);


