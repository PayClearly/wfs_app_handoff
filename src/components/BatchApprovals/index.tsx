import React, { useEffect, useState } from 'react';
import firebase from 'firebase';
import numeral from 'numeral';
import ReactPaginate from 'react-paginate'
import Button from '../../components/button'
import TSTable, { Column } from '../tables/TSTable'
import TSFilter, { FilterConfig } from '../forms/TSFilter';
import { useSortableData } from '../tables/customHooks/useSortableData'

type Batch = {
  approvalStatus: 'Approved' | 'Needs Approval';
  createdAt: string;
  paymentCount: number;
  totalAmount: string;
  checkTotal?: string;
  ACHTotal?: string;
  vCardTotal?: string;
  id: string
}

type Batches = Record<Batch['id'], Batch>

type Props = {
  organizationId: string;
  accountId: string;
  navigateTo: (routeName: string, routeParams: { 'batchId': string }) => void
}

const BatchApprovals = (props: Props) => {
  const { accountId, organizationId, navigateTo } = props;
  const [batchIds, setBatchIds] = useState<string[]>([]);
  const [batches, setBatches] = useState<Batches>({});

  const { sortedRowIds, requestSort, sortConfig } = useSortableData(batches, batchIds, { direction: 'desc', key: 'createdAt' })

  // Pagination
  const itemsPerPage = 25;

  const [pageNumber, setPageNumber] = useState(0);

  const onPageChange = ({ selected }: { selected: number }) => {
    setPageNumber(selected);
  }

  const pagination = <ReactPaginate
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
    pageCount={Math.ceil(batchIds.length / itemsPerPage)}
    pageRangeDisplayed={2}
    onPageChange={onPageChange}
  />

  useEffect(() => {
    let batchListeners: firebase.database.Query;
    (async () => {
      const hideApprovals = await firebase.database()
        .ref(`/default/state/paymentPipelinePreferences/${organizationId}/${accountId}/hideApprovals`)
        .get()
        .then(s => s.val() || 0)
        .catch((error) => {
          console.warn('Failed to fetch hideApprovals', error)
          return 0
        })

      batchListeners = firebase.database()
        .ref(`/default/denormalized/batchHistoryTable/${organizationId}/${accountId}`)
        .orderByChild('createdAt')
        .startAt(hideApprovals)

      batchListeners.once('value')
        .then(snap => {
          const batches = snap.val();
          const sortedKeys = Object.keys(batches || {}).sort((idA, idB) => Number(idB) - Number(idA))
          setBatchIds(sortedKeys);
        });

      batchListeners.on('value', (snap) => {
        // adapt batches
        const batches = Object.entries<any>(snap.val() || {})
          .reduce((acc, [batchId, batch]) => {
            const vCardTotal: number = batch.vCardAmounts ? sumPaymentAmounts(batch.vCardAmounts) : (batch.vCardTotal || 0);
            const checkTotal: number = batch.checkAmounts ? sumPaymentAmounts(batch.checkAmounts) : (batch.checkTotal || 0);
            const ACHTotal: number = batch.ACHAmounts ? sumPaymentAmounts(batch.ACHAmounts) : (batch.ACHTotal || 0);

            const vCardCount = Object.keys(batch.vCardPayments || {}).length;
            const checkCount = Object.keys(batch.checkPayments || {}).length;
            const achCount = Object.keys(batch.ACHPayments || {}).length;
            const paymentCount = vCardCount + checkCount + achCount;

            acc[batchId] = {
              approvalStatus: batch.requiresApproval ? 'Needs Approval' : 'Approved',
              createdAt: batch.createdAt,
              paymentCount,
              totalAmount: vCardTotal + checkTotal + ACHTotal,
              id: batchId,
              ...(vCardTotal > 0 && { vCardTotal: vCardTotal }),
              ...(checkTotal > 0 && { checkTotal: checkTotal }),
              ...(ACHTotal > 0 && { ACHTotal: ACHTotal })
            }
            return acc;
          }, {});
        setBatches(batches);
      });
    })();

    return (() => {
      batchListeners.off()
    })
  }, [accountId])

  const columns: Column<Batch>[] = [
    {
      header: 'Status',
      cellRenderer: (batch) => <ApprovalStatusBadge status={batch.approvalStatus} />,
      accessor: 'approvalStatus',
      sortable: true,
    },
    {
      header: 'Date',
      cellRenderer: (batch) => <span>{new Date(batch.createdAt).toLocaleString()}</span>,
      accessor: 'createdAt',
      sortable: true,
    }, {
      header: 'Payments',
      accessor: 'paymentCount',
      sortable: true,
    }, {
      header: 'Total',
      cellRenderer: (batch) => <span>{formatAmount(Number(batch.totalAmount))}</span>,
      accessor: 'totalAmount',
      sortable: true,
    }, {
      header: 'Card',
      cellRenderer: (batch) => <span>{formatAmount(Number(batch.vCardTotal))}</span>,
      accessor: 'vCardTotal',
    }, {
      header: 'ACH',
      cellRenderer: (batch) => <span>{formatAmount(Number(batch.ACHTotal))}</span>,
      accessor: 'ACHTotal',
    }, {
      header: 'Check',
      cellRenderer: (batch) => <span>{formatAmount(Number(batch.checkTotal))}</span>,
      accessor: 'checkTotal',
    }, {
      header: 'Batch Id',
      accessor: 'id',
      sortable: true,
    }, {
      header: '',
      cellRenderer: (batch) => <Button buttonText="View" onClick={() => navigateTo('paymentApprovals', { batchId: batch.id })} />,
    }
  ];

  const handleFilterChange = (filters) => {
    const filteredBatchIds = filterData(filters, batches);
    setBatchIds(filteredBatchIds);
  }

  return (
    <>
      <h2 className='card-title m-0'>Batches</h2>
      <TSFilter filterConfig={filterConfig} handleFilterChange={handleFilterChange} />
      <div className='components_tables_components_collapsabletable'>
        <TSTable
          rowData={batches}
          rowIds={sortedRowIds.slice(pageNumber * itemsPerPage, (pageNumber + 1) * itemsPerPage)}
          columns={columns}
          expandable={false}
          sortConfig={sortConfig}
          requestSort={requestSort}
        />
        {
          batchIds.length > itemsPerPage && pagination || ''
        }
      </div>
    </>
  )
}

export default BatchApprovals;

const filterConfig: FilterConfig<Batch>[] = [
  {
    key: 'approvalStatus',
    htmlElementType: 'select',
    label: 'Approval Status',
    options: {
      'Approved': { display: 'Approved' },
      'Needs Approval': { display: 'Needs Approval' }
    }
  }
];

const ApprovalStatusBadge = ({ status }: { status: 'Needs Approval' | 'Approved' }) => (
  <span className="text-primary">
    <div>
      <span style={{ fontSize: '85%' }} className={`badge rounded-pill bg-${status === 'Approved' ? 'primary' : 'secondary'}`}>
        {status}
      </span>
    </div>
  </span>
);

type PaymentAmounts = {
  /** An object where the keys are payment ids and the values are the payment amounts */
  [key: string]: number
}

// helper functions
function sumPaymentAmounts(payments: PaymentAmounts) {
  return Object.values(payments || {}).reduce((acc, curr) => {
    return acc + curr;
  }, 0);
}

function formatAmount(amount: number): string {
  return numeral(amount).format('$0,0.00');
}

function filterData(filters, data: Batches) {
  const filtered = Object.keys(data)
    .filter(id => {
      const item = data[id];
      for (const [key, value] of Object.entries(filters)) {
        if (value !== '' && value !== item[key]) return false;
      }
      return true;
    }).sort((idA, idB) => Number(idB) - Number(idA))
  return filtered;
}
