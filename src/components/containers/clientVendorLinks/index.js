import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    clientVendorLinkStatus: state.account.clientVendorLinks.status,
    clientVendorLinkPolicies: Selectors.entity('clientVendorLinks_idOrganization_idAccount')(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openCreateClientVendorLinkModal: () => {
      dispatch(Store.router.openModal('Components.modals.createClientVendorLink'));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_containers_clientVendorLinks extends Component {




  render() {
    const { clientVendorLinkStatus, clientVendorLinkPolicies } = this.props;
    if (!clientVendorLinkStatus.fetched) return <Components.spinner />;
    return (
      <div className="components_containers_clientVendorLinks">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="card-title mb-3">Client-Vendor Links</h2>
          {clientVendorLinkPolicies.canUpdate &&
            <Components.button
              buttonText="Add Client-Vendor Links"
              onClick={this.props.openCreateClientVendorLinkModal}
              className="btn btn-primary"
              ariaLabel="Add Client-Vendor Links"
              updating={clientVendorLinkStatus.updating}
              icon="mdi mdi-plus-circle text-white"
              iconLeft
            />
          }
        </div>
        <Components.tables.clientVendorLinks />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_containers_clientVendorLinks);


