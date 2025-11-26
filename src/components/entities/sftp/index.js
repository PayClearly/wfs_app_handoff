import { connect, Component, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
import { updateSftpUser, clearErrors, getSftpUser } from '../../../store/account/sftp';

const mapStateToProps = (state) => ({
  policies: Selectors.entity('ftpAccountDetails_idOrganization_idAccount')(state),
  sftpUser: state.account.sftp.data.items,
  sftpUserStatus: state.account.sftp.status,
  forms: state.forms,
  providerTheme: Selectors.providerTheme(state),
});

const mapDispatchToProps = (dispatch) => ({
  openFtpAccountSetupModal: () => {
    dispatch(Store.router.openModal('Components.modals.setupftpaccount', { sftp: true }));
  },
  fetchSftpUser: () => {
    dispatch(getSftpUser());
  },
  updateSftpUserAccount: (data) => {
    dispatch(updateSftpUser(data));
  },
  clearStatusErrors: () => {
    dispatch(clearErrors());
  },
});

class components_entities_sftpUser extends Component {

  componentDidMount() {
    this.props.fetchSftpUser();
  }

  onSubmit = () => {
    const { sftpUser, updateSftpUserAccount, forms } = this.props;
    updateSftpUserAccount({
      organizationId: sftpUser.organizationId,
      accountId: sftpUser.accountId,
      active: sftpUser.active,
      username: sftpUser.fileMage.username,
      id: sftpUser.id,
      ipWhitelist: forms['Components.forms.sftpAccountDetails'].default._values.ipWhitelist,
      ...(
        forms['Components.forms.sftpAccountDetails'].default._values.newPassword
        && { password: forms['Components.forms.sftpAccountDetails'].default._values.newPassword }
      ),
    });
  };

  onToggleActive = ({ active }) => {
    const { updateSftpUserAccount, sftpUser } = this.props;
    updateSftpUserAccount({
      organizationId: sftpUser.organizationId,
      accountId: sftpUser.accountId,
      active,
      username: sftpUser.fileMage.username,
      ipWhitelist: (sftpUser.fileMage.whitelist || []).join(', '),
      id: sftpUser.id,
    });
  };

  setupSftpAccount = () => {
    this.props.openFtpAccountSetupModal();
  };

  render() {
    const { sftpUser = {}, sftpUserStatus, policies } = this.props;
    const { canRead, canUpdate, canDelete } = policies;
    const { active } = sftpUser;
    const { updatingError: error, updating } = sftpUserStatus;

    return (
      <div className={'components_entities_sftpUser'}>
        <Components.entities.entitywrapper
          canRead={canRead}
          canUpdate={canUpdate}
          canDelete={canDelete}
          onSubmit={this.onSubmit}
          clearStatusErrors={this.props.clearStatusErrors}
          updating={updating}
          error={error}
          updateDisabled={updating}
          editBtnText={'Update SFTP'}
          updateButtonText={'Update SFTP'}
          wrapperClasses={'mt-3'}
          orgId={this.props.orgId}
          accountId={this.props.accountId}
          isReadyForUpdate={!!sftpUser.id && !!active}
          includeDelete={{
            item: 'SFTP Account',
            onYes: () => {
              this.onToggleActive({ active: false });
            },
          }}
          deleteBtnText={'Deactivate SFTP Account'}
        >
          <div>
            <h3 style={{ display: 'inline' }}>SFTP Account Settings</h3>
            {
              active
                ? (
                  <span className="text-success">
                    <i className="mdi mdi-check mdi-48px" />
                  </span>
                ) : (
                  <span className="text-danger">
                    <i className="mdi mdi-close mdi-48px" />
                  </span>
                )
            }
            {(() => {
              if (sftpUser.id) {
                return (
                  <Fragment>
                    <p>Host IP Address: <strong>{'CHANGE_ME_HOST_IP_ADDRESS'}</strong></p>
                    <p>Username: <strong>{sftpUser.fileMage.username}</strong></p>
                    <p>
                      IP Address Whitelist: <strong>{_try(() => sftpUser.fileMage.whitelist.join(', '), '')}</strong>
                    </p>
                    {sftpUser.id && !active
                      && (
                        <button
                          className="btn btn-secondary"
                          style={{ cursor: 'pointer' }}
                          onClick={() => { this.onToggleActive({ active: true }); }}
                          type="button"
                        >
                          Reactivate SFTP Account
                        </button>
                      )}
                  </Fragment>
                );
              }
              return (
                <Fragment>
                  <p>Enroll In {this.props.providerTheme.displayName} SFTP service.</p>
                  <button
                    tabIndex="-1"
                    className="btn btn-primary"
                    style={{ cursor: 'pointer' }}
                    onClick={this.setupSftpAccount}
                    type="button"
                  >
                    SFTP Account Settings
                  </button>
                </Fragment>
              );
            })()}
          </div>
          <Components.forms.sftpAccountDetails
            initialData={this.props.sftpUser}
            formKey="default"
          />
        </Components.entities.entitywrapper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_sftpUser);

