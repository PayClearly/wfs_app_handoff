import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    policies: Selectors.entity('accounts_idOrganization_idAccount')(state),
    orgId: state.organization.data.id,
    accountItem: state.accounts.data.items[state.account.data.id],
    accountStatus: state.accounts.status,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    updateVirtualCardLogo: (img) => {
      dispatch(Store.accounts.update({ virtualCardLogo: img }));
    },
    updateAccount: (data) => {
      dispatch(Store.accounts.update({ ...data }));
    },
    updateAccountOptions: (data) => {
      dispatch(Store.accounts.updateAccountOptions({ ...data }));
    },
    clearStatusErrors: () => {
      dispatch(Store.accounts.clearErrors());
    },
  });
};

class components_entities_account extends Component {

  // TODO: double check that this is right, its name was EditAccountForm which is the same name as what has been set below
  state = {
    formName: 'Components.forms.editaccount',
    editBtnText: 'Edit Account',
  };


  componentDidMount() { }
  componentWillUnmount() { }

  onSubmit = () => {
    const form = this.props.forms[this.state.formName][this.props.accountItem._id];
    const data = {
      active: form.active.value,
      name: form.name.value,
      contactName: form.contactName.value,
      contactEmail: form.contactEmail.value,
      contactPhoneNumber: form.contactPhoneNumber.value,
      suspended: form.suspended && form.suspended.value || false,
      externalId: form.externalId.value,
      address: {
        streetAddress: form.streetAddress.value || '',
        unit: form.unit.value || '',
        city: form.city.value || '',
        state: form.state.value || '',
        zipCode: form.zipCode.value || '',
      },
    };

    if ((this.props.orgId === 'org-for-testing-policies' || this.props.orgId === '57245f0a-7f86-4b55-9350-4a27a385f189' || _try(() => window.GLOBALCERT.projectId.includes('payclearly-staging'))) && form.useSampleDashboard) {
      Promise.resolve(this.props.updateAccount(data))
        .then(() => {
          const accountOptions = {
            useSampleDashboard: form.useSampleDashboard.value || null,
          };
          this.props.updateAccountOptions(accountOptions);
        });
    } else {
      this.props.updateAccount(data);
    }
  }

  onCancel = () => {
    this.setState({ blurAll: false });
  }
  render() {
    if (!this.props.accountItem) return null;
    const { canRead, canUpdate, canDelete } = this.props.policies;

    const error = this.props.accountStatus.updatingError;
    const updating = this.props.accountStatus.updating;
    const form = (this.props.forms[this.state.formName] && this.props.forms[this.state.formName][this.props.accountItem._id]) || {};
    const updateDisabled = updating || !form._allValid || form._allInitial;

    return (
      <div className="mb-5">
        {this.props.title && <h3>{this.props.title}</h3>}
        <Components.entities.entitywrapper
          canRead={canRead}
          canUpdate={canUpdate}
          canDelete={canDelete}
          onSubmit={this.onSubmit}
          updating={updating}
          error={error}
          updateDisabled={updateDisabled}
          editBtnText={this.state.editBtnText}
          orgId={this.props.orgId}
          accountId={this.props.accountItem._id}
          onDisabledClick={() => { this.setState({ blurAll: true }); }}
          onCancel={this.onCancel}
          clearStatusErrors={this.props.clearStatusErrors}
        >
          <Fragment>
            {
              _try(() => this.props.virtualCardLogo) &&
              <div className="row">
                <div className="col-md-12">
                  <strong>Virtual Card Logo</strong>
                  <br />
                  <span>Upload a logo you would like to appear on generated cards</span>
                  <br />
                  {canUpdate ?
                    <Components.photouploader
                      onSavePhoto={(img) => { this.props.updateVirtualCardLogo(img); }}
                      outputWidth={150}
                      outputHeight={84}
                      src={this.props.accountItem.virtualCardLogo || null}
                      iconClassName="mdi-credit-card-outline"
                      accountId={this.props.accountItem._id}
                    />
                    :
                    <Components.photooverview
                      outputHeight={84}
                      outputWidth={150}
                      src={this.props.accountItem.virtualCardLogo || null}
                      alt={'Custom account virtual card logo'}
                    />
                  }
                </div>
              </div>
            }
            <Components.accountdetails account={this.props.accountItem} orgId={this.props.orgId} className="row mt-3" />
          </Fragment>
          <div className="row mt-3">
            <div className="col-md-12">
              <Components.forms.editaccount
                accountItem={this.props.accountItem}
                updating={updating}
                blurAll={this.state.blurAll}
              />
            </div>
          </div>
        </Components.entities.entitywrapper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_account);


