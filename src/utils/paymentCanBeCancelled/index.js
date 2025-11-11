/* eslint-disable max-len */
import {
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
} from '../../constants';

const {
  CREATING,
  VERIFYING,
  FUNDING,
  SENDING,
  TRACKING,
  TRACKED,
  CANCELLED,
} = PAYMENT_STATUSES;

const checkCancellationPolicies = /** @type {const} */ {
  GALILEO: {
    [CREATING]: true,
    [VERIFYING]: true,
    [FUNDING]: true,
    [SENDING]: true,
    [TRACKING]: true,
    [TRACKED]: true,
    [CANCELLED]: false,
  },
  SMARTPAYABLES: {
    [CREATING]: true,
    [VERIFYING]: true,
    [FUNDING]: true,
    [SENDING]: true,
    [TRACKING]: false,
    [TRACKED]: false,
    [CANCELLED]: false,
  },
};

const PushAchCancellationPolicies = /** @type {const} */ {
  GALILEO: {
    [CREATING]: true,
    [VERIFYING]: true,
    [FUNDING]: true,
    [SENDING]: true,
    [TRACKING]: true,
    [TRACKED]: true,
    [CANCELLED]: false,
  },
  GALILEOSTUB: {
    [CREATING]: true,
    [VERIFYING]: true,
    [FUNDING]: true,
    [SENDING]: true,
    [TRACKING]: true,
    [TRACKED]: true,
    [CANCELLED]: false,
  },
  DWOLLA: {
    [CREATING]: true,
    [VERIFYING]: true,
    [FUNDING]: true,
    [SENDING]: true,
    [TRACKING]: false,
    [TRACKED]: false,
    [CANCELLED]: false,
  },
  STUB: {
    [CREATING]: true,
    [VERIFYING]: true,
    [FUNDING]: true,
    [SENDING]: true,
    [TRACKING]: false,
    [TRACKED]: false,
    [CANCELLED]: false,
  },
};

const PullAchCancellationPolicies = /** @type {const} */ {
  GALILEO: {
    [CREATING]: true,
    [VERIFYING]: true,
    [FUNDING]: true,
    [SENDING]: true,
    [TRACKING]: false,
    [TRACKED]: false,
    [CANCELLED]: false,
  },
  GALILEOSTUB: {
    [CREATING]: true,
    [VERIFYING]: true,
    [FUNDING]: true,
    [SENDING]: true,
    [TRACKING]: false,
    [TRACKED]: false,
    [CANCELLED]: false,
  },
};

/**
 *
 * @param {{
 *  created: { method: typeof PAYMENT_METHODS[keyof PAYMENT_METHODS] }
 *  verified: { achDeliveryMethod?: 'pullAch' | 'pushAch' }
 * _status: typeof PAYMENT_STATUSES[keyof PAYMENT_STATUSES]
 * }} paymentStatus
 * @param {{
 *  achIntegrationProvider?: string,
 *  checksIntegrationProvider?: string
 * }} integrationProviders
 */
function utils_paymentCanBeCancelled(paymentStatus, { achIntegrationProvider, checksIntegrationProvider }) {
  const { method } = paymentStatus.created;
  const { _status } = paymentStatus;
  const verifiedNode = paymentStatus.verified || {};
  const { achDeliveryMethod } = verifiedNode;

  const isCheck = method === PAYMENT_METHODS.CHECK;
  const isACH = method === PAYMENT_METHODS.ACH;
  const isVCard = method === PAYMENT_METHODS.VCARD;

  const isTracked = _status === TRACKED;
  const isCancelled = _status === CANCELLED;

  if (isCheck && checksIntegrationProvider in checkCancellationPolicies) {
    return checkCancellationPolicies[checksIntegrationProvider][_status];
  }

  if (isACH) {
    if (achDeliveryMethod === 'pullAch' && achIntegrationProvider in PullAchCancellationPolicies) {
      return PullAchCancellationPolicies[achIntegrationProvider][_status];
    }
    if (achDeliveryMethod !== 'pullAch' && achIntegrationProvider in PushAchCancellationPolicies) {
      return PushAchCancellationPolicies[achIntegrationProvider][_status];
    }
    return false;
  }

  if (isVCard) {
    return !isTracked && !isCancelled;
  }

  return !isCancelled;
}

export default utils_paymentCanBeCancelled;
