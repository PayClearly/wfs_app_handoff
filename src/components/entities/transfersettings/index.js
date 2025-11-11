import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';


const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    params: state.router.route.params || {},
    achFundingSource: Selectors.integrations(state).achFundingSource,
    permissions: Selectors.entity('achAccountCredentials_idOrganization_idAccount')(state),
    orgId: state.organization.data.id,
    accountId: state.account.data.id,
    achAccountCredentialsStatus: state.account.achAccountCredentials.status,
    fundingDetails: Selectors.funding(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openACHSetupModal: () => {
      dispatch(Store.router.openModal('Components.modals.achSetup', {}));
    },
    deleteCredentials: () => {
      dispatch(Store.account.deleteachAccountCredentials());
    },
    openUnlinkModal: (data) => {
      dispatch(Store.router.openModal('Components.modals.areyousure', data));
    },
    clearStatusErrors: () => {
      dispatch(Store.account.clearErrorsAchAccountCredentials());
    },
    createIntegration: (data, fundingPreferencesData) => {
      dispatch(Store.account.updateachAccountCredentials(data, fundingPreferencesData));
    },
  });
};

class components_entities_transfersettings extends Component {


  componentWillReceiveProps(nextProps) {
    if (nextProps.params.modal) {
      this.props.removeQueryParams(['modal']);
      setTimeout(() => {
        this.viewDetails();
      }, 500);
    }
  }


  onSubmit() {
    const form = _try(() => this.props.forms['Components.forms.achAccountCredentials'].setup);
    const fundingPreferencesForm = this.props.forms['Components.forms.fundingPreferences'].default;
    const fundingPreferencesData = {
      automaticFundingType: _try(() => fundingPreferencesForm._values.automaticFundingEnabled) ? _try(() => fundingPreferencesForm._values.automaticFundingType) : null,
      fundingStrategy: _try(() => fundingPreferencesForm._values.fundingStrategy) === 'earmark' ? 'earmark' : null,
    };

    this.props.createIntegration(form._values, fundingPreferencesData);
  }

  unlink = () => {
    this.props.openUnlinkModal({
      title: 'Remove Funding Integration',
      content: 'You are about to unlink your Funding Source. Would you like to proceed?',
      noText: 'Cancel',
      yesText: 'Unlink',
      checkForSuccess: () => {
        const { achFundingSource } = this.props;
        if (!achFundingSource.loading && achFundingSource.notLinked) {
          return true;
        }
        return false;
      },
      onYes: () => this.props.deleteCredentials({}),
    });
  };

  render() {
    const achFundingSource = this.props.achFundingSource;
    const { canRead, canDelete } = this.props.permissions;
    const canUpdate = this.props.permissions.canUpdate && !achFundingSource.loading && achFundingSource.notLinked;

    const form = _try(() => this.props.forms['Components.forms.achAccountCredentials'].setup);
    const error = this.props.achAccountCredentialsStatus.updatingError;
    const updating = this.props.achAccountCredentialsStatus.updating;
    const updateDisabled = updating || !_try(() => form._allValid);

    return (
      <div className={this.props.className}>
        {this.props.title && <h3>{this.props.title}</h3>}
        {this.props.inModal ?
          <Components.entities.entitywrapper
            canRead={canRead}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onSubmit={() => { this.onSubmit(); }}
            clearStatusErrors={this.props.clearStatusErrors}
            updating={updating}
            error={error}
            updateDisabled={updateDisabled}
            editBtnText={'Link with Auto Draft Account'}
            orgId={this.props.orgId}
            accountId={this.props.accountId}
            updateButtonText={'Submit'}
          >
            <Fragment>
              <h3>Auto Draft Account</h3>
              {!achFundingSource.loading && achFundingSource.notLinked &&
                <p>
                  <div className="text-danger mb-1">
                    This account is not linked with an Auto Draft Account!
                  </div>
                </p>
              }
              {!achFundingSource.loading && achFundingSource.linked &&
                <Fragment>
                  <p>
                    <span className="text">
                      This account is linked with {achFundingSource.name}
                    </span>
                    {this.props.permissions.canDelete &&
                      <a
                        tabIndex="-1"
                        role="button"
                        className="text-danger btn-sm ms-2"
                        style={{ cursor: 'pointer', color: 'white' }}
                        onClick={() => this.unlink()}
                      >
                        <i className="mdi mdi-link-off pe-1" />
                        Unlink account
                      </a>
                    }
                  </p>
                  {achFundingSource.warning &&
                    <div className="col-12">
                      <div className="alert alert-info" role="alert">
                        {achFundingSource.warning.message}
                      </div>
                    </div>
                  }
                </Fragment>
              }
              {achFundingSource.loading &&
                <p>loading...</p>
              }
            </Fragment>
            <Components.forms.achAccountCredentials
              formKey="setup"
            />
          </Components.entities.entitywrapper>
          :
          <Fragment>
            <h3>Auto Draft Account</h3>
            {!achFundingSource.loading && achFundingSource.notLinked &&
              <p>
                <div className="text-danger mb-1">
                  This account is not linked with an Auto Draft Account!
                </div>

                <br />

                {this.props.permissions.canUpdate &&
                  <span>
                    <a
                      tabIndex="-1"
                      role="button"
                      className="btn btn-primary"
                      style={{ cursor: 'pointer', color: 'white' }}
                      onClick={() => this.props.openACHSetupModal()}
                    >
                      <i className="mdi mdi-link pe-1" />
                      Link With Auto Draft Account
                    </a>
                  </span>
                }

              </p>
            }
            {!achFundingSource.loading && achFundingSource.linked &&
              <Fragment>
                <p>
                  <span className="text">
                    This account is linked with {achFundingSource.name}
                  </span>
                  {this.props.permissions.canDelete &&
                    <a
                      tabIndex="-1"
                      role="button"
                      className="text-danger btn-sm ms-2"
                      style={{ cursor: 'pointer', color: 'white' }}
                      onClick={() => this.unlink()}
                    >
                      <i className="mdi mdi-link-off pe-1" />
                      unlink account
                    </a>
                  }
                </p>
                {achFundingSource.warning &&
                  <div className="col-12">
                    <div className="alert alert-info" role="alert">
                      {achFundingSource.warning.message}
                    </div>
                  </div>
                }
              </Fragment>
            }
            {achFundingSource.loading &&
              <p>loading...</p>
            }
          </Fragment>
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_transfersettings);


