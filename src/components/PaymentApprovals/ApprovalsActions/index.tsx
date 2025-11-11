import React, { useState } from 'react';
import { Collapse } from 'react-collapse';
import numeral from 'numeral';
import TSModal, {
  ModalConfig,
} from '../../modals/TSModal';
import {
  PaymentApprovals,
  ApproverData,
  PaymentApproval,
  PaymentPipelinePreferences,
} from '../types';
import { api } from '../../../api/_util/wfsapi';
import paymentPipelineApi from '../../../api/paymentPipeline';
import Button from '../../button';

type Props = {
  paymentApprovals: PaymentApprovals;
  approver: ApproverData | null;
  organizationId: string;
  accountId: string;
  batchId: string;
  handleDisableBatchSplit: () => void;
  isBatchSplitDisabled: boolean;
  paymentPipelinePreferences: PaymentPipelinePreferences;
  totalApproved: number;
  unapprovedApprovalIds: string[];
  selectedItems: string[];
};

type Aggregates = {
  totalPayments: number;
  totalAmount: number;
  achPayments: number;
  achAmount: number;
  checkPayments: number;
  checkAmount: number;
  vCardPayments: number;
  vCardAmount: number;
};

/**
 * Default export props
 */
type ErrorCollapseProps = {
  error: string;
  handleCloseError: () => void;
};

function ErrorCollapse({ error, handleCloseError }: ErrorCollapseProps) {
  return (
    <Collapse isOpened={error}>
      <div
        className="alert alert-danger"
        role="alert"
        style={{ whiteSpace: 'pre-line' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h4 className="alert-heading">Warning</h4>
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => handleCloseError()}
          >
            x
          </span>
        </div>
        {`Oops! Looks like something went wrong: ${error}`}
      </div>
    </Collapse>
  );
}

function aggregateBatchSplitData(
  unapprovedPayments: PaymentApproval[]
): Aggregates {
  return unapprovedPayments.reduce(
    (acc, paymentApproval) => {
      acc.totalAmount += paymentApproval.amount;
      acc.totalPayments += 1;
      if (paymentApproval.method === 'vCard') {
        acc.vCardAmount += paymentApproval.amount;
        acc.vCardPayments += 1;
      }
      if (paymentApproval.method === 'ACH') {
        acc.achAmount += paymentApproval.amount;
        acc.achPayments += 1;
      }
      if (paymentApproval.method === 'check') {
        acc.checkAmount += paymentApproval.amount;
        acc.checkPayments += 1;
      }
      return acc;
    },
    {
      totalAmount: 0,
      totalPayments: 0,
      achAmount: 0,
      achPayments: 0,
      checkAmount: 0,
      checkPayments: 0,
      vCardAmount: 0,
      vCardPayments: 0,
    }
  );
}

function createModalContent(aggregates: Aggregates): string {
  const {
    totalPayments,
    totalAmount,
    achPayments,
    achAmount,
    checkPayments,
    checkAmount,
    vCardPayments,
    vCardAmount,
  } = aggregates;

  return `You are about to split the current batch into a new batch of:\n
    Total Payments: ${totalPayments}\n
    Total Amount: ${numeral(totalAmount).format('$0,0.00')}\n
    Number of vCards: ${vCardPayments}\n
    Total vCards Amount: ${numeral(vCardAmount).format('$0,0.00')}\n
    Number of ACH: ${achPayments}\n
    Total ACH Amount: ${numeral(achAmount).format('$0,0.00')}\n
    Number of checks: ${checkPayments}\n
    Total check Amount: ${numeral(checkAmount as number).format('$0,0.00')}\n
    `;
}

function ApprovalsActions(props: Props) {
  const {
    paymentApprovals,
    approver,
    organizationId,
    accountId,
    batchId,
    handleDisableBatchSplit,
    isBatchSplitDisabled,
    paymentPipelinePreferences,
    totalApproved,
    unapprovedApprovalIds,
    selectedItems,
  } = props;

  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);
  const [error, setError] = useState('');

  const handleApprovalAll = async (approvalIds: string[]) => {
    setShowModal(false);
    api()
      // @ts-expect-error post() contains TS error
      .post(`/approvals/${organizationId}/${accountId}/approveBulk`, {
        approvalIds,
      })
      .catch((err) => {
        setError(err.response?.data?.error);
      });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalConfig(null);
  };

  const handleCloseError = () => {
    setError('');
  };

  const handleSplitBatch = async () => {
    setShowModal(false);
    if (Number.isNaN(Number(batchId))) {
      return setError('invalid batchId');
    }

    try {
      await paymentPipelineApi.update(organizationId, accountId, {
        action: 'splitBatch',
        ids: selectedItems,
        batchToSplit: batchId,
      });
      // disable button to prevent user from trying to split before new state of paymentApprovals has been set
      handleDisableBatchSplit();
    } catch (error: any) {
      setError(`${error.response?.data?.error || error.message || 'unknown error while attempting to split batch'}`);
    }
  };

  const openApproveAllModal = () => {
    if (unapprovedApprovalIds.length === 0) {
      setError('You have no payments to approve in this batch');
      return;
    }
    setModalConfig({
      title: 'Approve My Payments',
      content: `You're about to approve ${unapprovedApprovalIds.length
        } payment(s), at ${numeral(totalApproved).format('$0,0.00')}`,
      onContinue: () => handleApprovalAll(unapprovedApprovalIds),
      onClose: handleCloseModal,
    });

    setShowModal(true);
  };

  const openSplitBatchModal = () => {
    if (paymentPipelinePreferences.paymentUploadFileType === 'comdata') {
      setError('Batch Split is currently disabled for PS21 files');
      return;
    }
    const numberOfPaymentApprovals = Object.keys(paymentApprovals).length;
    const unapprovedPayments = Object.values(paymentApprovals).filter(
      (p) => p.approvalStatus === 'Needs Approval'
    );
    const numberOfPaymentsNeedApproval = unapprovedPayments.length;
    const numberOfPaymentsApproved = numberOfPaymentApprovals - numberOfPaymentsNeedApproval;
    // disable the Split Batch button if all payments are already approved, or if none of the payments are approved
    if (numberOfPaymentApprovals === numberOfPaymentsApproved) {
      setError('All payments are already approved, the batch cannot be split.');
      return;
    }

    const numberOfItemsToSplit = selectedItems.length;
    if (numberOfPaymentApprovals === numberOfItemsToSplit) {
      setError('Cannot split entire batch');
      return;
    }

    const selectedPaymentsToSplit = selectedItems.map(
      (id) => paymentApprovals[id]
    );
    const aggregates = aggregateBatchSplitData(selectedPaymentsToSplit);
    const modalContent = createModalContent(aggregates);
    setModalConfig({
      title: 'Split Batch',
      content: modalContent,
      onContinue: handleSplitBatch,
      onClose: handleCloseModal,
    });
    setShowModal(true);
  };

  return (
    <>
      {approver
        && approver.accountId === accountId
        && !selectedItems.length && (
          <Button
            onClick={openApproveAllModal}
            buttonText={`Mark all level ${approver?.level} as approved`}
            disabled={error || unapprovedApprovalIds.length === 0}
          />
        )}
      {selectedItems.length > 0 && (
        <Button
          onClick={openSplitBatchModal}
          buttonText="Split Batch"
          className="btn btn-primary ms-1"
          updating={false}
          disabled={error || isBatchSplitDisabled}
          ariaLabel="Split Batch"
          icon="mdi mdi-call-split"
        />
      )}
      {showModal && modalConfig && <TSModal config={modalConfig} />}
      <ErrorCollapse error={error} handleCloseError={handleCloseError} />
    </>
  );
}

export default ApprovalsActions;
