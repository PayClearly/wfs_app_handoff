import { retreiveValue } from 'store/_utilities/firebaseHelpers';
import { connect, Component } from 'component';
import Components from 'components';
import Store from 'store';

import { api } from 'api/_util/payclearlyapi';

import UPLOAD_TEMPLATE from './constants';

const mapStateToProps = (state) => ({
  organizations: state.organizations.data.items,
});

const mapDispatchToProps = (dispatch) => ({
  navigateToBulkVendorUploadJob: (jobId) => {
    dispatch(Store.router.navigateTo('bulkVendorUploads', { jobId }));
  },
});

class componentsModalsUploadvendors extends Component {
  state = {
    uploading: false,
    uploadingError: '',
    uploadingSuccess: '',
    selectedOrg: null,
    selectedAccount: null,
    accounts: [],
    acceptedFiles: null,
    jobId: null,
  };

  fetchAccounts = (organizationId) => {
    retreiveValue(`state/accounts/${organizationId}`, (data) => {
      this.setState({ accounts: Object.values(data) });
    });
  };

  onDrop = (acceptedFiles) => {
    this.setState({ acceptedFiles });
    this.clearErrors();
  };

  clearErrors = () => {
    this.setState({ uploadingError: '' });
  };

  onSubmit = () => {
    const { selectedOrg, selectedAccount, acceptedFiles } = this.state;

    if (!selectedOrg) {
      return this.setState({ uploadingError: 'Please select an organization' });
    }
    
    if (!selectedAccount) {
      return this.setState({ uploadingError: 'Please select an account' });
    }
    
    if (!acceptedFiles) {
      return this.setState({ uploadingError: 'Please select or drag and drop a file' });
    }
    
    if (selectedOrg && selectedAccount && acceptedFiles) {
      this.setState({ uploading: true });
      this.setState({ uploadingError: '' });

      const formData = new FormData();
      formData.append('files', acceptedFiles[0]);

      return api().post(`globalvendors/upload/${selectedOrg}/${selectedAccount}`, formData)
        .then(({ data }) => {
          this.setState({
            jobId: data.job._id,
            uploadingSuccess: 'File uploaded successfully.',
          });
        })
        .catch((err) => {
          const errorMessage = (err && err.response && err.response.data && err.response.data.error) 
            || 'Something went wrong';

          this.setState({ uploadingError: errorMessage });
        })
        .finally(() => {
          this.setState({ uploading: false });
        });
    }

    return null;
  };

  navigateToBulkVendorUploadJob = () => {
    const { jobId } = this.state;

    if (!jobId) {
      console.error('Cant navigate to job. jobId is null');
      return null;
    }
    
    this.props.navigateToBulkVendorUploadJob(jobId);
    this.props.close();

    return null;
  };

  render() {
    const { close, organizations } = this.props;

    const {
      accounts,
      selectedOrg,
      selectedAccount,
      uploadingSuccess,
      uploadingError,
    } = this.state;

    const organizationsFilteredAndSorted = Object.values(organizations)
      .sort((a, b) => (a.name > b.name ? 1 : -1))
      .filter((org) => org.active).reduce((acc, organization) => {
        const org = {
          id: organization._id,
          name: organization.name,
        };
        acc.push(org);
        return acc;
      }, []);

    const accountsFilteredAndSorted = (accounts).sort((a, b) => (a.name > b.name ? 1 : -1)).filter((account) => account.active).reduce((acc, account) => {
      const item = {
        id: account._id,
        name: account.name,
      };

      acc.push(item);
      return acc;
    }, []);

    return (
      <div className="modal-dialog wide-modal wide-80" role="document">
        <div className="modal-content h-100 w-100 components_modals_uploadvendors">
          <div className="modal-header">
            <h4 className="modal-title" id="uploadVendors">
              Upload Vendors
            </h4>
            <button onClick={close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body" style={{ overflowX: 'scroll', overflowY: 'scroll' }}>
            <div className={'row'}>
              <div className={'col'}>
                <p>Upload a file containing bulk global vendor data.</p>
              </div>
            </div>
            <form className="floating-labels">
              <div className="d-flex flex-column align-items-start mt-2 mb-2">
                <h4 className="mb-2 mt-4">Select an organization</h4>
                <select
                  className="form-control w-100 h-100 overlayedSelect"
                  value={this.state.selectedOrg}
                  label="Organization"
                  onChange={(e) => {
                    this.fetchAccounts(e.target.value);
                    this.setState({ selectedOrg: e.target.value });
                    this.clearErrors();
                  }}
                >
                  <option value="">Select an organization</option>
                  {organizationsFilteredAndSorted.map((org) => <option value={org.id}>{org.name}</option>)}
                </select>
                {selectedOrg && (
                  <div className="d-flex flex-column align-items-start mt-2 mb-2">
                    <h4 className="mb-2 mt-4">Account</h4>
                    <select
                      className="form-control w-100 h-100 overlayedSelect"
                      value={selectedAccount ? selectedAccount.id : ''}
                      label="Account"
                      onChange={(e) => {
                      this.setState({ selectedAccount: e.target.value });
                      this.clearErrors();
                    }}
                    >
                      <option value="">Select an account</option>
                      {accountsFilteredAndSorted.map((account) => <option value={account.id}>{account.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              {
                this.state.uploading ? <Components.spinner /> : (
                  <Components.button
                    style={{ marginTop: '1rem', marginBottom: '1rem' }}
                    buttonText="Submit"
                    onClick={this.onSubmit}
                    ariaLable="Submit"
                  />
                )
              }
              {
                this.state.uploadingSuccess && <Components.button
                  style={{ marginTop: '1rem', marginBottom: '1rem', marginLeft: '1rem' }}
                  buttonText="View Job"
                  onClick={this.navigateToBulkVendorUploadJob}
                  ariaLable="View Bulk Vendor Upload Job"
                />
              }
            </form>

            {uploadingSuccess && <div className="alert alert-success" role="alert">{uploadingSuccess}</div>}

            <Components.dropzone 
              onDrop={this.onDrop}
              accept="text/csv,.csv"
              csvFields={[UPLOAD_TEMPLATE]}
              featureName="bulk-vendors"
              dropzoneError={uploadingError}
            />
            { this.state.acceptedFiles && (
              <div className="alert alert-success" role="alert">File Accepted. Press Submit to upload.</div>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
              onClick={close}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(componentsModalsUploadvendors);

