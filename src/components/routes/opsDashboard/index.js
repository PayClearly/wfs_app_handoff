import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  adminAccounts: state.admin.accounts.data.item,
  organization: state.organization.data.id,
  account: state.account.data.id,
});

const mapDispatchToProps = () => ({
});

// eslint-disable-next-line camelcase
class components_routes_opsDashboard extends Component {
  render() {

    if (!Object.keys(this.props.adminAccounts).length) { return <Components.spinner />; }
    return (
      <>
        <div className="row mb-4 position-relative">
          <div className="col-12">
            <Components.cards.csraccountstatuses />
          </div>
        </div>
        {this.props.organization && this.props.account && (
          <div className="row mb-4 position-relative">
            <div className="col-12 col-md-12 col-xl-12 order-1 order-md-2 mb-3 mb-md-0">
              <Components.cards.opsAccountDetails />
            </div>
          </div>
        )}
      </>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_routes_opsDashboard);
