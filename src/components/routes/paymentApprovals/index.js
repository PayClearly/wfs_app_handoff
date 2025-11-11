// @ts-check
import React, { useEffect } from 'react';
// @ts-ignore
import { connect } from 'component';
import PaymentApprovals from '../../PaymentApprovals';

const mapStateToProps = (state, props) => {
  return ({
    userId: state.user.access.data.uid,
    organizationId: state.organization.data.id,
    accountId: state.account.data.id,
    routeParams: state.router.route.params,
  });
};

/**
 * 
 * @param {object} Props 
 * @param {string} Props.userId
 * @param {string} Props.organizationId
 * @param {string} Props.accountId
 * @param {{ batchId: string }} Props.routeParams
 */
export function PaymentApprovalsRoute({ 
  userId, 
  organizationId, 
  accountId, 
  routeParams,
}) {
  useEffect(() => {
  }, []);
  
  return (
    <PaymentApprovals 
      userId={userId}
      organizationId={organizationId}
      accountId={accountId}
      routeParams={routeParams}
    />
  );
}

export default connect(mapStateToProps, (dispatch, props) => {})(PaymentApprovalsRoute);
