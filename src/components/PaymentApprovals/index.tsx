import React, { useEffect, useState } from 'react';
import firebase from 'firebase';
import '../tables/components/collapsabletable/index.scss';
import numeral from 'numeral';
import ReactPaginate from 'react-paginate';
import Components from 'components';
import Button from '../button';
import Spinner from '../spinner';
import ByUser from '../badges/createdby';
import TSTable, { Column } from '../tables/TSTable';
import './index.scss';
import { api, apiErrorSchema } from '../../api/_util/wfsapi';
import TSFilter, { FilterConfig } from '../forms/TSFilter';
import ApprovalsActions from './ApprovalsActions';
import { useSortableData } from '../tables/customHooks/useSortableData';

import {
  PaymentApprovals,
  ApproverData,
  ApprovalData,
  PaymentApproval,
  PaymentPipelinePreferences,
} from './types';

/**
 * Default export props
 */
type Props = {
  organizationId: string;
  accountId: string;
  routeParams: { batchId: string };
  userId: string;
};

/**
 * Render a table of approvals grouped by payment batch
 */
function PaymentApprovals({
  organizationId,
  accountId,
  routeParams,
  userId,
}: Props) {
  const batchId = routeParams && routeParams.batchId;
  const [approver, setApprover] = useState<ApproverData | null>(null);
  const [paymentApprovals, setPaymentApprovals] = useState<PaymentApprovals>(
    {}
  );
  const [paymentIds, setPaymentApprovalIds] = useState<PaymentApproval['id'][]>(
    []
  );
  const [isBatchSplitDisabled, setIsBatchSplitDisabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentPipelinePreferences, setPaymentPipelinePreferences] = useState<PaymentPipelinePreferences>({});
  const [unapprovedApprovalIds, setUnapprovedApprovalIds] = useState<
    ApprovalData['id'][]
  >([]);
  const [totalApproved, setTotalApproved] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);

  // Sorting
  const { sortedRowIds, requestSort, sortConfig } = useSortableData(
    paymentApprovals,
    paymentIds,
    { direction: 'desc', key: 'approvalStatus' }
  );

  // Pagination
  const itemsPerPage = 25;
  const [pageNumber, setPageNumber] = useState(0);
  const onPageChange = ({ selected }: { selected: number }) => {
    setPageNumber(selected);
  };

  useEffect(() => {
    const approvalsListeners: firebase.database.Query[] = [];
    setLoading(true);

    (async () => {
      const payments = (await firebase
        .database()
        .ref(`/default/state/paymentStatuses/${organizationId}/${accountId}`)
        .orderByChild('_batchId')
        .equalTo(Number(batchId))
        .once('value')
        .then((snap) => snap.val())) || {};

      const paymentIds = Object.keys(payments);

      setPaymentApprovalIds(paymentIds);

      const mapPaymentIdsToApprovals = paymentIds.reduce((acc, paymentId) => {
        if (
          Object.keys(paymentApprovals).length
          && paymentApprovals[paymentId]
        ) {
          acc[paymentId] = paymentApprovals[paymentId];
        }
        return acc;
      }, {});

      setPaymentApprovals(() => ({
        ...mapPaymentIdsToApprovals,
      }));

      await Promise.all(
        Object.keys(payments || {}).map(async (paymentId) => {
          const { vendorId } = payments[paymentId].created;
          const vendorName = await firebase
            .database()
            .ref(
              `/default/state/accountVendors/${organizationId}/${accountId}/${vendorId}/name`
            )
            .once('value')
            .then((snap) => snap.val());

          const approvalsQuery = firebase
            .database()
            .ref(`/default/state/approvals/payments`)
            .orderByChild('entityId')
            .equalTo(paymentId);
          approvalsListeners.push(approvalsQuery);

          approvalsQuery.on('value', async (snap) => {
            const approvals = (snap.val() || {}) as Record<
              string,
              ApprovalData
            >;

            const approversRef = firebase
              .database()
              .ref('/default/state/approvers');

            /**
             * The `approvedBy` property on an approval corresponds to
             * an approver entity which in turn has a `userId` property,
             * so we need to fetch the approvers to get access to the user
             * entity that approved the approval.
             */
            const approvalsWithApprovers = await Promise.all(
              Object.values(approvals).map(async (approval) => {
                if (!approval.approvedBy) {
                  return approval;
                }

                const approver = await approversRef
                  .child(approval.approvedBy)
                  .once('value')
                  .then((snap) => snap.val());

                if (!approver) {
                  return approval;
                }

                return {
                  ...approval,
                  approvedBy: approver.userId,
                };
              })
            );

            const payment = payments[paymentId];

            const needsApproval = !Object.keys(approvals).length
              || Object.values<ApprovalData | null>(approvals).some(
                (approval) => approval?.approved === false
              );

            const rowData = {
              id: paymentId,
              approvalStatus: needsApproval ? 'Needs Approval' : 'Approved',
              amount: payment.created.amount,
              method: payment.created.method,
              ref: payment._ref,
              createdAt: new Date(payment.created._createdAt).toLocaleString(),
              vendor: vendorName || payment.created.vendorId,
              approvals: approvalsWithApprovers,
            } as PaymentApproval;

            setPaymentApprovals((prevState) => ({
              ...prevState,
              [paymentId]: rowData,
            }));
          });
        })
      );

      const approver = await firebase
        .database()
        .ref(`/default/state/approvers`)
        .orderByChild('userId')
        .equalTo(userId)
        .once('value')
        .then((snap) => snap.val());

      if (!approver) { setApprover(approver); }
      if (approver) { setApprover(Object.values(approver)[0] as ApproverData); }
    })().finally(() => setLoading(false));

    return () => {
      approvalsListeners.forEach((listener) => listener?.off());
    };
  }, [accountId, isBatchSplitDisabled]);

  useEffect(() => {
    const { total, approvalIds } = aggregateApprovalData(
      paymentApprovals,
      approver
    );
    setUnapprovedApprovalIds(approvalIds);
    setTotalApproved(total);
  }, [paymentApprovals, approver]);

  useEffect(() => {
    firebase
      .database()
      .ref(
        `/default/state/paymentPipelinePreferences/${organizationId}/${accountId}`
      )
      .once('value')
      .then((snap) => {
        const pipelinePreferences = snap.val();
        setPaymentPipelinePreferences({
          paymentUploadFileType:
            pipelinePreferences?.paymentUploadFileType || 'csv',
        });
      });
  }, [accountId]);

  const columns: Column<PaymentApproval>[] = [
    {
      header: () => (
        <input
          type="checkbox"
          onChange={(e) => {
            const isChecked = e.target.checked === true;
            if (isChecked) {
              setSelected([...paymentIds]);
            } else {
              setSelected([]);
            }
          }}
        />
      ),
      cellRenderer: (props) => {
        const isChecked = selected.includes(props.id);
        return (
          <input
            type="checkbox"
            checked={isChecked}
            value={props.id}
            onChange={(e) => {
              if (isChecked) {
                setSelected(selected.filter((id) => id !== props.id));
              } else {
                setSelected([...selected, props.id]);
              }
            }}
          />
        );
      },
    },
    {
      header: 'Status',
      cellRenderer: (paymentApproval) => (
        <ApprovalStatusBadge status={paymentApproval?.approvalStatus} />
      ),
      accessor: 'approvalStatus',
      sortable: true,
    },
    {
      header: 'Approvals',
      cellRenderer: ({ approvals }) => <ApprovalBadges approvals={approvals} />,
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      sortable: true,
    },
    {
      header: 'Amount',
      cellRenderer: ({ amount }) => (
        <span>{numeral(amount).format('$0,0.00')}</span>
      ),
      accessor: 'amount',
      sortable: true,
    },
    {
      header: 'Vendor',
      accessor: 'vendor',
      sortable: true,
    },
    {
      header: 'Ref #',
      accessor: 'ref',
      sortable: true,
    },
    {
      header: 'Method',
      cellRenderer: (paymentApproval) => (
        <Components.badges.method data={paymentApproval.method} />
      ),
      accessor: 'method',
      sortable: true,
    },
  ];

  const expandedRow = ({
    approvals,
    id,
  }: {
    approvals: PaymentApproval['approvals'];
    id: PaymentApproval['id'];
  }) => (
    <ApprovalsDetails
      approvals={approvals}
      approver={approver}
      paymentId={id}
      organizationId={organizationId}
      accountId={accountId}
    />
  );

  const pagination = (
    <ReactPaginate
      previousLabel="prev"
      previousClassName="paginate_page previous"
      previousLinkClassName="paginate_button"
      nextLabel="next"
      nextClassName="paginate_page next"
      nextLinkClassName="paginate_button"
      breakLabel={<span className="ellipsis">...</span>}
      breakClassName="paginate_page"
      pageLinkClassName="paginate_button"
      pageClassName="paginate_page"
      containerClassName="paginatedTable_paginate p-0"
      activeClassName="current"
      marginPagesDisplayed={1}
      pageCount={Math.ceil(paymentIds.length / itemsPerPage)}
      pageRangeDisplayed={2}
      onPageChange={onPageChange}
    />
  );

  const handleFilterChange = (filters) => {
    const filteredPaymentApprovalIds = filterData(filters, paymentApprovals);
    setPaymentApprovalIds(filteredPaymentApprovalIds);
  };

  const handleDisableBatchSplit = () => {
    setIsBatchSplitDisabled(!isBatchSplitDisabled);
  };

  return (
    <>
      <h2 className="card-title m-0">Payment Approvals</h2>
      <TSFilter
        filterConfig={filterConfig}
        handleFilterChange={handleFilterChange}
      />
      {loading ? (
        <Spinner />
      ) : (
        <>
          <ApprovalsActions
            paymentPipelinePreferences={paymentPipelinePreferences}
            paymentApprovals={paymentApprovals}
            approver={approver}
            organizationId={organizationId}
            accountId={accountId}
            batchId={batchId}
            handleDisableBatchSplit={handleDisableBatchSplit}
            isBatchSplitDisabled={isBatchSplitDisabled}
            totalApproved={totalApproved}
            unapprovedApprovalIds={unapprovedApprovalIds}
            selectedItems={selected}
          />
          <div className="components_tables_components_collapsabletable">
            <TSTable
              rowIds={sortedRowIds.slice(
                pageNumber * itemsPerPage,
                (pageNumber + 1) * itemsPerPage
              )}
              rowData={paymentApprovals}
              columns={columns}
              expandable
              expandedRowRenderer={expandedRow}
              sortConfig={sortConfig}
              requestSort={requestSort}
            />
            {(paymentIds.length > itemsPerPage && pagination) || ''}
          </div>
        </>
      )}
    </>
  );
}

const filterConfig: FilterConfig<PaymentApproval>[] = [
  {
    key: 'approvalStatus',
    label: 'Approval Status',
    htmlElementType: 'select',
    options: {
      Approved: { display: 'Approved' },
      'Needs Approval': { display: 'Needs Approval' },
    },
  },
  {
    key: 'method',
    label: 'Method',
    htmlElementType: 'select',
    options: {
      vCard: { display: 'Virtual Card' },
      check: { display: 'Check' },
      ACH: { display: 'ACH' },
    },
  },
];

export default PaymentApprovals;

// keeping these components in this file for now since not necessary to separate them

type ApprovalsDetailsProps = {
  paymentId: string;
  approvals: ApprovalData[];
  approver: ApproverData | null;
  organizationId: string;
  accountId: string;
};

/**
 * Prints more detailed approval information and
 * surfaces an approve button for each approval
 */
function ApprovalsDetails(props: ApprovalsDetailsProps) {
  const {
    approvals, approver, paymentId, organizationId, accountId,
  } = props;

  const approvalData = approvals.reduce((acc, curr) => {
    acc[curr.id] = curr;
    return acc;
  }, {});

  const columns: Column<ApprovalData>[] = [
    {
      header: 'Level',
      accessor: 'level',
    },
    {
      header: 'Approved',
      accessor: 'approved',
    },
    {
      header: 'Action',
      cellRenderer: (props) => (
        <ApproveApproval
          organizationId={organizationId}
          accountId={accountId}
          approval={props}
          approver={approver}
        />
      ),
    },
    {
      header: 'Approved By',
      cellRenderer: ({ approvedBy }) => {
        if (!approvedBy) { return <div>-</div>; }
        return <ByUser user={approvedBy} showUsername />;
      },
    },
  ];

  return (
    <>
      <Components.overviews.paymentstatus.view
        id={paymentId}
        hideRemittance
        hideCommunications
      />
      <div className="pb-4 ps-4 pe-4">
        <h2 className="m-0 pt-3 d-inline-block">Approvals</h2>
        <div className="px-4">
          <TSTable
            rowIds={Object.keys(approvalData)}
            rowData={approvalData}
            columns={columns}
            expandable={false}
          />
        </div>
      </div>
    </>
  );
}

type ApproveApprovalProps = {
  approval: ApprovalData;
  approver: ApproverData | null;
  organizationId: string;
  accountId: string;
};

function ApproveApproval({
  approval,
  approver,
  organizationId,
  accountId,
}: ApproveApprovalProps) {
  const [error, setError] = useState<string | null>(null);
  /**
   * Make a `PATCH` request to /approvals/${id}. This route
   * verifies the user is an approver, then attempts to
   * approve the approval with the approver's approval level.
   */
  const approveApproval = () => (
    api()
      // @ts-ignore
      .patch(`/approvals/${organizationId}/${accountId}/${approval.id}`)
      .catch((err: unknown) => {
        const parsed = apiErrorSchema.safeParse(err);

        if (parsed.success === true) {
          // Optional chaining is necessary without strict mode
          // See https://stackoverflow.com/questions/71185664/why-does-zod-make-all-my-schema-fields-optional
          setError(parsed.data?.response?.data?.error);
          return;
        }

        setError('An unknown error occured');
        console.error('Unknown error when approving approval', err);

      })
  );

  if (error !== null) { return <div>Approval failed: {error}</div>; }
  if (approval.approved === true) { return <div>Approved</div>; }
  if (approver?.level !== approval.level) { return <div>-</div>; }
  return <Button onClick={approveApproval} buttonText="Approve" />;
}

function ApprovalBadges({ approvals }: { approvals: ApprovalData[] }) {
  return (
    <div style={{ display: 'flex' }}>
      {approvals
        .sort((a, b) => a.level - b.level)
        .map((approval) => (
          <div style={{ display: 'flex' }}>
            {approval.requiresApprovalFrom && <Edge />}
            <ApprovalBadge key={approval.id} approval={approval} />
          </div>
        ))}
    </div>
  );
}

function ApprovalBadge({ approval }: { approval: ApprovalData }) {
  return (
    <div
      style={{
        borderStyle: 'solid',
        borderWidth: '3px',
        borderColor: '#05AEDD',
        backgroundColor: approval.approved ? '#05AEDD' : '#fff',
        color: approval.approved ? '#fff' : '#54667A',
        fontWeight: 'bold',
        borderRadius: '50%',
        height: '2.5rem',
        width: '2.5rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {approval.level}
    </div>
  );
}

function Edge() {
  return <h2>&nbsp; {'>'} &nbsp;</h2>;
}

/**
 * Listen to a path in firebase. Remove listener when the component unloads
 */
function useRealtime<Schema = unknown>(ref: firebase.database.Reference) {
  const [data, setData] = useState<Schema | null>(null);

  useEffect(() => {
    ref.on('value', (snap) => setData(snap.val()));
    return () => ref.off();
  }, []);

  return data;
}

function ApprovalStatusBadge({
  status,
}: {
  status: 'Needs Approval' | 'Approved';
}) {
  return (
    <span className="text-primary">
      <div>
        <span
          style={{ fontSize: '85%' }}
          className={`badge rounded-pill bg-${status === 'Approved' ? 'primary' : 'secondary'
            }`}
        >
          {status}
        </span>
      </div>
    </span>
  );
}

function filterData(filters, data: PaymentApprovals) {
  const filtered = Object.keys(data).filter((id) => {
    const item = data[id];
    for (const [key, value] of Object.entries(filters)) {
      if (value !== '' && value !== item[key]) { return false; }
    }
    return true;
  });
  return filtered;
}

function aggregateApprovalData(
  paymentApprovals: PaymentApprovals,
  approver: ApproverData | null
) {
  return Object.values(paymentApprovals).reduce(
    (acc, paymentApproval) => {
      const approval = paymentApproval.approvals.find(
        (approval, i, approvalsArray) => {
          if (approval.level !== approver?.level || approval.approved) { return false; }

          const excludedApprovals = approval.excludes || [];

          for (const id of excludedApprovals) {
            const excluded = approvalsArray.find(
              (approval) => approval.id === id
            );
            if (excluded?.approvedBy === approver?.id) { return false; }
          }

          return true;
        }
      );

      if (approval) {
        acc.total += paymentApproval.amount;
        acc.approvalIds = [...acc.approvalIds, approval.id];
      }

      return acc;
    },
    { total: 0, approvalIds: [] as ApprovalData['id'][] }
  );
}
