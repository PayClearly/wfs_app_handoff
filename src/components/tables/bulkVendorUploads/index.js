import { connect, Component } from 'component';
import Store from 'store';
import Components from 'components';
import Selectors from 'selectors';
import download from 'downloadjs';

import { downloadAttachment } from '../../../api/attachments';

import { generateVendorErrorsFile } from './utils';

/**
 * Setup.
 */
const tableName = 'Components.tables.bulkVendorUploads';

const mapStateToProps = (state, props) => ({
  jobs: state.jobs.bulkVendorUploads || {},
  rowData: Selectors.bulkVendorUploads(state),
  filteredAndSortedItems: Selectors.tableItems(tableName, props.tableKey, 'Selectors.bulkVendorUploads(state)')(state),
  organizations: state.organizations.data.items,
  accounts: state.admin.accounts.data.item,
  multiFilterValueForms: state.forms['Components.forms.multiFilterValue'],
});

const mapDispatchToProps = (dispatch) => ({
  navigateToBulkVendorUploadJob: (jobId) => {
    dispatch(Store.router.navigateTo('bulkVendorUploads', { jobId }));
  },
});

/**
 * Constants.
 */

const columns = [
  {
    label: 'Original File Name',
    dataKey: 'fileName',
    sortable: true,
    cellRenderer: (_columnData, _id, row) => (<div>{row.fileName}</div>),
  },
  {
    label: 'Records Processed',
    dataKey: 'totalCreated',
    sortable: true,
    cellRenderer: (_columnData, _id, row) => (<div>{row.totalCreated}</div>),
  },
  {
    label: 'Uploaded Date',
    dataKey: 'createdAt',
    sortable: true,
    cellRenderer: (_columnData, _id, row) => (<div>{new Date(row.createdAt).toISOString()}</div>),
  },
  {
    label: 'Status',
    dataKey: 'status',
    sortable: true,
    cellRenderer: (_columnData, _id, row) => (<div>{row.status}</div>),
  },
];

const filterConfig = {
  originalFileName: {
    key: 'fileName',
    type: 'string',
    display: 'Original File Name',
  },
  status: {
    key: 'status',
    type: 'option',
    display: 'Status',
    options: {
      queued: { dispaly: 'Queued' },
      processing: { display: 'Processing' },
      error: { display: 'Error' },
      processed: { display: 'Processed' },
    },
  },
  createdAtAfter: {
    key: 'createdAt',
    type: 'date',
    display: 'Date From',
    condition: 'isAfter',
  },
  createdAtBefore: {
    key: 'createdAt',
    type: 'date',
    display: 'Date To',
    condition: 'isBefore',
  },
};

/**
 * Helpers.
 */

/**
 * @param {import('../../../selectors/bulkVendorUploads').BulkVendorUploadRowItem} row 
 */
function generateActionContent(row, props) {
  const popoverContent = [];

  popoverContent.push({
    title: 'View Overview',
    onClick: () => {
      props.navigateToBulkVendorUploadJob(row.jobId);
    },
  });

  popoverContent.push({
    title: 'Download Original File',
    onClick: () => {
      downloadAttachment({
        originalname: row.fileName,
        storagePath: row.storagePath, // this is where the file lives in storage
        resourcePath: `jobs/bulkVendorUpload/global/global/${row.jobId}/status`, // this is a firebase entity
      });
    },
  });

  if (row.status !== 'processed' && row.status !== 'error') {
    return popoverContent;
  }

  if (row.rowErrors || row.issues) {
    popoverContent.push({
      title: 'Download Output File',
      onClick: () => {
        downloadAttachment({
          originalname: row.outputFileName,
          storagePath: row.outputFileStoragePath,
          resourcePath: `jobs/bulkVendorUpload/global/global/${row.jobId}/status`,
        });
      },
    });

    popoverContent.push({
      title: 'Download Errors File',
      onClick: () => {
        console.log('Downloading Errors File...');
        const data = generateVendorErrorsFile(row);
        download(data, 'errors.csv', 'text/csv');
      },
    });
  }

  return popoverContent;
}

/**
 * Table.
 */
class components_tables_bulkVendorUploads extends Component {
  render() {
    const loading = !this.props.jobs.status.fetched;
    const jobs = this.props.rowData;

    /**
     * Get a list of the filtered rows, so we can get the
     * organizationId for each.
     */
    const rows = this.props.filteredAndSortedItems.map((id) => this.props.rowData[id]);

    /**
     * Determine if the rows are filtered by organizationId.
     * 
     * If the rows have been filtered by organizationId, then they
     * should all have the same organizationId.
     * 
     * If they have not been filtered by organizationId, then
     * the rows may not have the same organizationId, so we
     * return null. 
     */
    const selectedOrganization = Object.values(rows)
      .reduce((org, row) => {
        if (org === undefined) {
          return row.organizationId;
        }

        if (row.organizationId !== org) {
          return null;
        }

        return org;
      }, undefined);

    /**
     * Filter config for organizations & accounts.
     * 
     * This has to be defined here, so we have access to
     * organizations & accounts in the store.
     */
    const organizationOptions = Object.keys(this.props.organizations)
      .reduce((options, id) => {
        if (!this.props.organizations[id].active) {
          return options;
        }

        return {
          ...options,
          [id]: { display: this.props.organizations[id].name },
        };
      }, {});

    const accountOptions = Object.keys(this.props.accounts)
      .reduce((options, organizationId) => {
        if (selectedOrganization && organizationId !== selectedOrganization) {
          return options;
        }

        const accounts = Object.keys(this.props.accounts[organizationId])
          .reduce((opts, accountId) => {
            if (!this.props.accounts[organizationId][accountId].active) {
              return opts;
            }

            return {
              ...opts,
              [accountId]: {
                display: this.props.accounts[organizationId][accountId].name,
              },
            };
          }, {});

        return {
          ...options,
          ...accounts,
        };
      }, {});

    const organizationsFilterConfig = {
      key: 'organizationId',
      type: 'option',
      display: 'Organization',
      options: organizationOptions,
    };

    const accountsFilterConfig = {
      key: 'accountId',
      type: 'option',
      display: 'Account',
      options: accountOptions,
    };

    const orgAccountColumns = [
      {
        label: 'Organization',
        dataKey: 'organizationId',
        sortable: true,
        cellRenderer: (columnData, id, row) => {
          const organization = this.props.organizations[row.organizationId];

          const display = organization
            ? organization.name
            : row.organizationId;

          return <div>{display}</div>;
        },
      },
      {
        label: 'Account',
        dataKey: 'accountId',
        sortable: true,
        cellRenderer: (columnData, id, row) => {
          const account = this.props.accounts[row.organizationId][row.accountId];

          const display = account
            ? account.name
            : row.accountId;

          return <div>{display}</div>;
        },
      },
    ];

    return (
      <>
        <Components.tables.components.multiFilter 
          tableKey={this.props.tableKey || 'default'}
          tableName={tableName}
          filterConfig={{
            ...filterConfig,
            organization: organizationsFilterConfig,
            account: accountsFilterConfig,
          }}
        />
        <Components.tables.components.collapsibleTable
          tableKey={this.props.tableKey}
          tableName={tableName}
          initialTableStateOverride={this.props.initialTableStateOverride}
          defaultTableState={{
            sort: {
              sortKey: 'createdAt',
              orderIn: 'desc',
            },
          }}
          data={{
            items: jobs,
            count: Object.keys(jobs).length,
          }}
          itemOrder={this.props.filteredAndSortedItems}
          columns={columns.concat(orgAccountColumns)}
          typeForNoDataText="Global Vendor Uploads"
          actions
          actionsInFirstColumn
          generateActionContent={(row) => generateActionContent(row, this.props)}
          paginate
          initialRowsPerPage={25}
          keysLength={Object.keys(jobs).length}
          loading={loading}
        />
      </>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_bulkVendorUploads);
