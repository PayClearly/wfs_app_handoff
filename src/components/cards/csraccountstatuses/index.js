import { connect, Component } from 'component';

import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  accountBalances: state.admin.accountBalances.data.item,
  organizations: state.organizations.data.items,
  organizationsStatus: state.organizations.status,
  CSRAccountStatusesData: Selectors.csrdashboard(state),
});

const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_cards_csraccountstatuses extends Component {
  state = {
    expanded: false,
  };

  generateAccountStatusWidgets = (activeOrgs = []) => {
    const orgsWithIssues = activeOrgs.filter((orgId) => this.props.CSRAccountStatusesData[orgId].itemsNeedAttention
      || this.props.CSRAccountStatusesData[orgId].itemsForWarning
      || this.props.CSRAccountStatusesData[orgId].otherPendingPayments);

    const widgets = orgsWithIssues.reduce((acc, orgId) => {
      const accounts = Object.keys(this.props.accountBalances[orgId]);

      accounts.forEach((accountId) => {
        if (_try(() => this.props.CSRAccountStatusesData[orgId][accountId].itemsNeedAttention)
          || _try(() => this.props.CSRAccountStatusesData[orgId][accountId].itemsForWarning)
          || _try(() => this.props.CSRAccountStatusesData[orgId][accountId].otherPendingPayments)) {
          acc.push({ orgId, accountId });
        }
      });

      return acc;
    }, []).sort((contextA, contextB) => {
      const aNeedsAttention = this.props.CSRAccountStatusesData[contextA.orgId][contextA.accountId].itemsNeedAttention;
      const bNeedsAttention = this.props.CSRAccountStatusesData[contextB.orgId][contextB.accountId].itemsNeedAttention;

      if (!aNeedsAttention && !bNeedsAttention) {
        const aOtherPendingPayments = this.props
          .CSRAccountStatusesData[contextA.orgId][contextA.accountId].otherPendingPayments;
        const bOtherPendingPayments = this.props
          .CSRAccountStatusesData[contextB.orgId][contextB.accountId].otherPendingPayments;

        return bOtherPendingPayments - aOtherPendingPayments;
      }

      return bNeedsAttention - aNeedsAttention;
    }).map((context) => {
      const accountData = this.props.CSRAccountStatusesData[context.orgId][context.accountId];
      return (
        <Components.widgets.csr.accountstatus accountData={accountData} context={context} />
      );
    });

    if (!widgets.length) {
      return (
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-center">
            <i className="mdi text-success mdi-check mdi-48px" />
            <h2 className="my-0 ms-1">All Payments Are Good To Go</h2>
          </div>
        </div>
      );
    }

    return widgets;
  };

  render() {
    const activeOrgs = Object.keys(this.props.accountBalances).filter((organizationId) => {
      const organization = this.props.organizations[organizationId] || {};
      return organization.active && organization.name !== 'PayClearly Test';
    });

    const orgWidgets = this.generateAccountStatusWidgets(activeOrgs);

    return (
      <>
        <div
          className={
            `components_cards_csraccountstatuses card h-100 w-100 pt-2 `
            + `${orgWidgets.length > 2 ? 'bar-displayed' : 'pb-3'}${this.state.expanded ? ' expanded' : ''}`
          }
        >
          {!Object.keys(this.props.accountBalances).length
            ? <Components.spinner />
            : orgWidgets}
        </div>
        {orgWidgets.length > 2
          && (
            <div
              className="collapse-bar d-flex justify-content-center align-items-center"
              onClick={() => { this.setState((prevState) => ({ expanded: !prevState.expanded })); }}
            >
              <h5 className="m-0">
                <i className={`mdi mdi-arrow-${this.state.expanded ? 'up' : 'down'}-drop-circle-outline`} />
                &nbsp;{this.state.expanded ? 'Collapse' : 'Expand'}
              </h5>
            </div>
          )}
      </>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_cards_csraccountstatuses);
