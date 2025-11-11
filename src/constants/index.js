const AUTOMATION_TAIKO = 'automation_taiko';
const GALILEO = 'GALILEO';
// PayClearly has banking compliance requirements that enforce cards to a limit of $500,000 or less
const VCARD_MAX_AMOUNT = 500000;
const ACH_MAX_TRANSACTION_AMOUNT = 500000;

const PAYMENT_METHODS = /** @type {const} */ ({
  VCARD: 'vCard',
  CHECK: 'check',
  ACH: 'ACH',
});

const PAYMENT_STATUSES = /** @type {const} */ ({
  TRACKING: 'tracking',
  TRACKED: 'tracked',
  CANCELLED: 'cancelled',
  CREATING: 'creating',
  FUNDING: 'funding',
  VERIFYING: 'verifying',
  SENDING: 'sending',
});

const AUTOMATION_VM_WORKFLOWS = /** @type {const} */ ({
  RESTART_VM: 'restart-vm',
  ROTATE_IP: 'rotate-ip',
  START_VM: 'start-vm',
  STOP_VM: 'stop-vm',
});

const AUTOMATION_VM_WORKFLOW_STAGES = /** @type {const} */ ({
  WORKFLOW_BEGIN: 'workflow-begin',
});


const GALILEO_BIN_OPTIONS = ['credit', 'debit'];

module.exports = {
  AUTOMATION_TAIKO,
  AUTOMATION_VM_WORKFLOWS,
  AUTOMATION_VM_WORKFLOW_STAGES,
  PAYMENT_METHODS,
  GALILEO,
  PAYMENT_STATUSES,
  VCARD_MAX_AMOUNT,
  ACH_MAX_TRANSACTION_AMOUNT,
  GALILEO_BIN_OPTIONS,
};
