export type ApprovalData = {
  id: string;
  entityId: string;
  accountId: string;
  approved: boolean;
  level: number;
  organizationId: string;
  requiresApprovalFrom?: string[];
  excludes?: string[];
  approvedAt?: string;
  approvedBy?: string;
}

export type PaymentApproval = {
  approvalStatus: 'Approved' | 'Needs Approval';
  approvals: ApprovalData[]
  createdAt: string;
  amount: number;
  vendor: string
  ref: number;
  method: 'ACH' | 'check' | 'vCard';
  id: string;
}

export type PaymentApprovals = Record<PaymentApproval['id'], PaymentApproval>

export type ApproverData = {
  id: string;
  organizationId: string;
  accountId: string;
  level: number;
  userId: string;
}

export type PaymentPipelinePreferences = {
  paymentUploadFileType?: 'comdata' | 'wexap3' | 'csv' | 'bpam'
}