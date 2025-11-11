import { connect, Component, /* bindActionCreators */ Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    policies: Selectors.entity('ftpAccountDetails_idOrganization_idAccount')(state),
    ftpAccountDetails: state.account.ftpAccountDetails.data.item,
    ftpAccountStatus: state.account.ftpAccountDetails.status,
    forms: state.forms,
    providerTheme: Selectors.providerTheme(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openFtpAccountSetupModal: () => {
      dispatch(Store.router.openModal('Components.modals.setupftpaccount', {}));
    },
    activateAutomatedCheckPayments: () => {
      dispatch(Store.account.activateFundingSource());
    },
    updateFtpAccount: (data) => {
      dispatch(Store.account.updateFtpAccount(data));
    },
    clearStatusErrors: () => {
      dispatch(Store.account.clearFtpAccountDetailErrors());
    },
  });
};

class components_entities_ftpaccountsettings extends Component {




  onSubmit = () => {
    this.props.updateFtpAccount({
      ...this.props.ftpAccountDetails,
      ...this.props.forms['Components.forms.ftpAccountDetails'].default._values,
    });
  };

  onToggleActive = ({ active }) => {
    this.props.updateFtpAccount({ ...this.props.ftpAccountDetails, ipWhitelist: (this.props.ftpAccountDetails.ipWhitelist || []).join(','), active });
  };

  setupFtpAccount = () => {
    this.props.openFtpAccountSetupModal();
  };

  render() {
    const complete = this.props.ftpAccountDetails && this.props.ftpAccountDetails.username;
    const { canRead, canUpdate, canDelete } = this.props.policies;
    const { active } = this.props.ftpAccountDetails;
    const { updatingError: error, updating } = this.props.ftpAccountStatus;
    // const updating = this.props.ftpAccountDetails.updating;

    return (
      <div className={'components_entities_ftpaccountsettings'}>
        <Components.entities.entitywrapper
          canRead={canRead}
          canUpdate={canUpdate}
          canDelete={canDelete}
          onSubmit={this.onSubmit}
          clearStatusErrors={this.props.clearStatusErrors}
          updating={updating}
          error={error}
          updateDisabled={updating}
          editBtnText={'Update FTP'}
          wrapperClasses={'mt-3'}
          orgId={this.props.orgId}
          accountId={this.props.accountId}
          isReadyForUpdate={!!complete && active}
          includeDelete={{
            item: 'FTP Account',
            onYes: () => {
              this.onToggleActive({ active: false });
            },
          }}
          deleteBtnText={'Deactivate FTP Account'}
        >
          <div>
            <h3 style={{ display: 'inline' }}>FTP Account Settings</h3>
            {
              complete && (active ?
                <span className="text-success">
                  <i className="mdi mdi-check mdi-48px" />
                </span>
                :
                <span className="text-danger">
                  <i className="mdi mdi-close mdi-48px" />
                </span>)
            }
            {(() => {
              if (complete) {
                return (
                  <Fragment>
                    <p>Host IP Address: <strong>{_isDev() ? '35.209.103.128' : 'ftps.payclearly.com'}</strong></p>
                    <p>Username: <strong>{this.props.ftpAccountDetails.username}</strong></p>
                    <p>User IP Address Whitelist: <strong>{_try(() => this.props.ftpAccountDetails.ipWhitelist.join(', '))}</strong></p>
                    {complete && !active &&
                      <button
                        className="btn btn-secondary"
                        style={{ cursor: 'pointer' }}
                        onClick={() => { this.onToggleActive({ active: true }); }}
                      >
                        Reactivate FTP Account
                      </button>
                    }
                  </Fragment>
                );
              }
              return (
                <Fragment>
                  <p>Enroll In {this.props.providerTheme.displayName} FTP service.</p>
                  <button
                    tabIndex="-1"
                    className="btn btn-primary"
                    style={{ cursor: 'pointer' }}
                    onClick={this.setupFtpAccount}
                  >
                    FTP Account Settings
                  </button>
                </Fragment>
              );
            })()}
          </div>
          <Components.forms.ftpAccountDetails
            initialData={this.props.ftpAccountDetails}
            formKey="default"
          />
        </Components.entities.entitywrapper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_ftpaccountsettings);

// Internal Helper Functions ...
const _isDev = () => window.GLOBALCERT.projectId.includes('test');

// GENERATOR_TYPE='component';
