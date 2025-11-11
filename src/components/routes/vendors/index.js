import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    loaded: _try(() => Selectors.globalTaggedItems(state).allTagsLoaded && state.account.accountVendors.status.fetched && state.global.groups.status.fetched, false),
    accountVendorEnrollmentPolicies: Selectors.entity('accountVendorEnrollments_idOrganization_idAccount')(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_routes_vendors extends Component {




  render() {
    if (!this.props.loaded) return <Components.spinner />;

    return (
      <div className="mt-4">
        <Components.tabs defaultTab={'vendors'} >
          <Components.tab name="vendors" label="Vendors" iconClassName="mdi-account-multiple" >
            <h2 className="card-title mb-3">Vendors</h2>
            <Components.tables.accountvendor />
          </Components.tab>
          <Components.tab
            name="enrollments"
            label="Vendor Enrollments"
            iconClassName="mdi-account-multiple-plus"
            hide={!this.props.accountVendorEnrollmentPolicies.canRead}
            featureFlag="enrollments"
          >
            <Components.containers.accountVendorEnrollments />
          </Components.tab>
        </Components.tabs>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_routes_vendors);


