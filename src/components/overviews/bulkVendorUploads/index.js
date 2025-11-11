import { connect, Component } from 'component';
import Components from 'components';
import Selectors from 'selectors';
import download from 'downloadjs';

import { downloadAttachment } from '../../../api/attachments';
import { generateVendorErrorsFile } from '../../tables/bulkVendorUploads/utils';

const mapStateToProps = (state) => ({
  jobs: state.jobs.bulkVendorUploads || {},
  rowData: Selectors.bulkVendorUploads(state),
  organizations: state.organizations.data.items,
  accounts: state.accounts.data.items,
});

const mapDispatchToProps = () => ({});

class components_overviews_bulkVendorUploads extends Component {
  downloadOriginalFile() {
    const job = this.props.rowData[this.props.jobId];

    downloadAttachment({
      originalname: job.fileName,
      storagePath: job.storagePath,
      resourcePath: `jobs/bulkVendorUpload/global/global/${this.props.rowData[this.props.jobId]}/status`,
    });
  }

  downloadOutputFile() {
    const job = this.props.rowData[this.props.jobId];

    downloadAttachment({
      originalname: job.outputFileName,
      storagePath: job.outputFileStoragePath,
      resourcePath: `jobs/bulkVendorUpload/global/global/${this.props.rowData[this.props.jobId]}/status`,
    });
  }

  downloadErrorsFile() {
    const job = this.props.rowData[this.props.jobId];
    const data = generateVendorErrorsFile(job);
    download(data, 'errors.csv', 'text/csv');
  }

  render() {
    const loading = !this.props.jobs.status.fetched;

    if (loading) {
      return <Components.spinner />;
    }

    const { jobId } = this.props;

    if (!jobId) {
      return null;
    }

    const job = this.props.rowData[jobId];

    if (!job) {
      return null;
    }

    const {
      fileName,
      organizationId,
      accountId,
      totalAttempted,
      totalCreated,
      createdAt,
      status,
      rowErrors,
      issues,
    } = job;

    const organization = this.props.organizations[organizationId].name || '';
    const account = this.props.accounts[accountId].name || '';

    const noErrors = !rowErrors && !issues;

    return (
      <div className="components_overviews_autobot">
        <div className="row">
          <div className="col-md-6 col-12">
            <strong>Status</strong>
            <br />
            <p className="text-muted">{status}</p>
          </div>
          <div className="col-md-6 col-12">
            <strong>Original File Name</strong>
            <br />
            <p className="text-muted">{fileName}</p>
          </div>
          <div className="col-md-6 col-12">
            <strong>Organization</strong>
            <br />
            <p className="text-muted">{organization}</p>
          </div>
          <div className="col-md-6 col-12">
            <strong>Account</strong>
            <br />
            <p className="text-muted">{account}</p>
          </div>
          <div className="col-md-6 col-12">
            <strong>Number of Records Attempted</strong>
            <br />
            <p className="text-muted">{totalAttempted}</p>
          </div>
          <div className="col-md-6 col-12">
            <strong>Number of Records Processed</strong>
            <br />
            <p className="text-muted">{totalCreated}</p>
          </div>
          <div className="col-md-6 col-12">
            <strong>Uploaded Date</strong>
            <br />
            <p className="text-muted">{new Date(createdAt).toISOString()}</p>
          </div>
          <div className="col-md-6 col-12 mb-1">
            <Components.button
              buttonText={'Download Original File'}
              onClick={() => this.downloadOriginalFile()}
              ariaLabel="Download the vendors csv file from storage"
            />
          </div>
          <div className="col-md-6 col-12 mb-1">
            <Components.button
              buttonText={'Download Output File'}
              onClick={() => this.downloadOutputFile()}
              ariaLabel="Download the list of vendors that did not pass"
              disabled={noErrors}
            />
          </div>
          <div className="col-md-6 col-12 mb-1">
            <Components.button
              buttonText={'Download Errors File'}
              onClick={() => this.downloadErrorsFile()}
              ariaLabel="Download the errors for the vendors that did not pass"
              disabled={noErrors}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_bulkVendorUploads);
