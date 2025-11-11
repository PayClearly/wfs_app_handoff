import {
  connect, Component,
} from 'component';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';


const mapStateToProps = (state) => ({
  policies: Selectors.entity('revenueShares_*_*')(state),
  organizations: state.organizations.data.items,
  accounts: state.admin.accounts.data.item,
  revenueShares: state.revenueShares.data.items,
  organizationId: state.organization.data.id,
  accountId: state.account.data.id,
});

const mapDispatchToProps = (dispatch) => ({
  syncRevenueShares: (organizationId, accountId) => {
    dispatch(Store.revenueshares.sync(organizationId, accountId));
  },
});

// eslint-disable-next-line camelcase
class components_routes_revenueshares extends Component {

  componentDidMount() {
    // TODO: determine if this should fire elsewhere. Is syncing necessary?
    // Probably should move this logic to store
    this.props.syncRevenueShares(this.props.organizationId, this.props.accountId);
  }

  render() {
    if (!this.props.policies.canRead) { return <Components.invalidpermissions />; }
    const {
      organizations, accounts, organizationId, accountId,
    } = this.props;
    const organization = _try(() => organizations[organizationId].name, '');
    const account = _try(() => accounts[organizationId][accountId].name, '');
    return (
      <>
        <Components.creators.revenueshare />
        <div className={'card card-with-label mb-5'}>
          <div
            className={'card-label'}
            style={{
              position: 'absolute',
              top: '-23px',
              left: '10px',
              margin: '0',
              width: '98%',
              'white-space': 'nowrap',
              'text-overflow': 'ellipsis',
              overflow: 'hidden',
            }}
          >
            <span style={{
              'background-color': 'white',
              'padding-left': '10px',
              'padding-right': '10px',
              'font-size': '30px',
            }}
            >
              {organization} / {account}
            </span>
          </div>
          <div className={'card-body'}>
            <Components.tables.revenueshares accountId={accountId} organizationId={organizationId} />
          </div>
        </div>
      </>
    );
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(components_routes_revenueshares);
