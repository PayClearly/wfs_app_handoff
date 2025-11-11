import {
  connect, Component,
} from 'component';

// Third Party Imports ...

import Store from 'store';
import Components from 'components';
import { createSftpUser } from '../../../store/account/sftp/index';
import './index.scss';

const mapStateToProps = (state) => ({
  forms: state.forms,
  ftpAccountDetails: state.account.ftpAccountDetails.data.item,
  ftpAccountStatus: state.account.ftpAccountDetails.status,
  sftpUser: state.account.sftp.data.items,
  sftpUserStatus: state.account.sftp.status,
});

const mapDispatchToProps = (dispatch) => ({
  createFtpAccount: (data) => dispatch(Store.account.createFtpAccount(data)),
  createSftpUser: (data) => dispatch(createSftpUser(data)),
  clearFtpAccountDetailErrors: () => dispatch(Store.account.clearFtpAccountDetailErrors()),
});

class components_modals_setupftpaccount extends Component {

  state = {
    forms: {},
  };

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      forms: nextProps.forms,
    });
    // once all users are migrated to SFTP we will remove the FTP account managament components and logic
    // there should be no new FTP accounts created, all new accounts should be SFTP
    if (!this.props.sftp && nextProps.ftpAccountDetails.username) {
      this.props.close();
    }
    if (nextProps.sftpUser.id) {
      this.props.close();
    }
  }

  componentWillUnmount() {
    this.props.clearFtpAccountDetailErrors();
  }

  handleNext = () => {
    if (this.props.sftp) {
      this.props.createSftpUser(this.props.forms['Components.forms.createftpaccount'].default._values);
    } else {
      this.props.createFtpAccount(this.props.forms['Components.forms.createftpaccount'].default._values);
    }
  };

  render() {
    const form = this.state.forms['Components.forms.createftpaccount']
      && this.state.forms['Components.forms.createftpaccount'].default;

    const updating = this.props.ftpAccountStatus.creating
      || this.props.ftpAccountStatus.updating
      || this.props.sftpUserStatus.creating
      || this.props.sftpUserStatus.updating;
    const error = this.props.ftpAccountStatus.creatingError
      || this.props.ftpAccountStatus.updatingError
      || this.props.sftpUserStatus.creatingError
      || this.props.sftpUserStatus.updatingError;

    return (
      <div className="modal-dialog components_modals_setupftpaccount" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title" id="exampleModalLabel">FTP Account Setup</h2>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body px-3">
            <div className="col-md">
              <Components.forms.createftpaccount />
            </div>
            {error
              && (
                <div className="col-12">
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                </div>
              )}
            <div className="modal-footer mt-5">
              <div className="row float-end">
                <Components.forms.components.button
                  buttonText={'Cancel Setup'}
                  onClick={() => { this.props.close(); }}
                  ariaLabel="Cancel Setup"
                  className="btn btn-secondary me-4"
                  disabled={updating}
                />
                <Components.forms.components.button
                  buttonText={'Next'}
                  onClick={() => { this.handleNext(); }}
                  ariaLabel="Next"
                  className="btn btn-primary waves-effect z-depth-5dp float-end"
                  updating={updating}
                  disabled={!form || !form._allValid || updating}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_setupftpaccount);


