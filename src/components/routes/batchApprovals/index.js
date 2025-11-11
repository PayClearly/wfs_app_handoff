// @ts-check
import React, { useEffect } from 'react';
import './index.scss';
//@ts-ignore
import Store from 'store';
// @ts-ignore
import { connect } from 'component';
import BatchApprovals from '../../BatchApprovals';

const mapStateToProps = (state, props) => {
  return ({
    accountId: state.account.data.id,
    organizationId: state.organization.data.id,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
      /**
       * 
       * @param {string} routeName 
       * @param {{ batchId: string }} routeParams 
       */
      navigateTo: (routeName, routeParams) => {
          dispatch(Store.router.navigateTo(routeName, routeParams));
      },
  });
};

export function BatchApprovalsRoute({ organizationId, accountId, navigateTo }) {
  return (
    <BatchApprovals  
      organizationId={organizationId} 
      accountId={accountId} 
      navigateTo={navigateTo}
    />
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(BatchApprovalsRoute);
