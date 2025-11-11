// Third Party Imports ...

import Utils from 'utils';

function utils_getBatchStatus(statuses = [], requiresApproval = false, scheduled = false, paymentCount) {
  let status = '';
  let statusClassOverride = '';
  if (!Object.keys(statuses).length) return null;

  const isScheduled = scheduled;
  const isStillScheduled = isScheduled && isScheduled > Date.now() && statuses.creating === paymentCount;
  const substatus = isStillScheduled ? Utils.dates.dateToDay(isScheduled) : status;

  if (((statuses.cancelled || 0) + (statuses.tracked || 0)) === paymentCount) status = 'Complete';
  if ((statuses.cancelled || 0) === paymentCount) status = 'Cancelled';


  if (statuses.tracking) status = 'Tracking...';
  if (statuses.sending) status = 'Processing...';
  if (statuses.funding) status = 'Funding...';
  if (statuses.verifying) status = 'Verifying...';
  if (statuses.creating) status = requiresApproval ? 'Needs Approval' : 'Creating...';

  if (isStillScheduled) status = 'Scheduled';

  return { status, substatus, statusClassOverride };
}

export default utils_getBatchStatus;


