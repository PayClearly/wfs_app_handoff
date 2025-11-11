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
    policies: Selectors.entity('achAccountDetails_idOrganization_idAccount')(state),
    achAccountDetails: state.account.achAccountDetails.data.item,
    achAccountDetailsStatus: state.account.achAccountDetails.status,
    orgId: state.organization.data.id,
    accountId: state.account.data.id,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    updateFundingPreferences: (data) => {
      dispatch(Store.account.updateAchAccountDetails(data));
    },
    clearStatusErrors: () => {
      dispatch(Store.account.clearErrorsAchAccountDetails());
    },
  });
};

class components_entities_fundingpreferences extends Component {
  state = {
    editBtnText: 'Edit Preferences',
  };





  onSubmit() {
    const form = this.props.forms['Components.forms.fundingPreferences'].default;
    const data = {
      automaticFundingType: _try(() => form._values.automaticFundingEnabled) ? _try(() => form._values.automaticFundingType) : null,
      fundingStrategy: _try(() => form._values.fundingStrategy) === 'earmark' ? 'earmark' : null,
    };

    this.props.updateFundingPreferences({ fundingPreferences: data });
  }

  render() {
    if (!this.props.achAccountDetails) return null;
    const { canRead, canUpdate, canDelete } = this.props.policies;

    const error = this.props.achAccountDetailsStatus.updatingError;
    const updating = this.props.achAccountDetailsStatus.updating;
    const updateDisabled = updating;

    const fundingPreferences = this.props.achAccountDetails.fundingPreferences;

    return (
      <div className="mb-5 components_entities_fundingpreferences">
        {this.props.title && <h3>{this.props.title}</h3>}
        <Components.entities.entitywrapper
          canRead={canRead}
          canUpdate={canUpdate}
          canDelete={canDelete}
          onSubmit={() => { this.onSubmit(); }}
          clearStatusErrors={this.props.clearStatusErrors}
          updating={updating}
          error={error}
          updateDisabled={updateDisabled}
          editBtnText={this.state.editBtnText}
          wrapperClasses={'mt-3'}
          orgId={this.props.orgId}
          accountId={this.props.accountId}
        >
          <Fragment>
            <p>Preferred Funding Type: <strong>{(fundingPreferences && fundingPreferences.fundingStrategy && fundingPreferences.fundingStrategy === 'earmark' && 'Batch Based') || 'Standard'}</strong></p>
            <p>Automatic Funding: <strong>{(fundingPreferences && fundingPreferences.automaticFundingType && (fundingPreferences.automaticFundingType === 'eod' ? 'End-Of-Day Funding' : 'Instant Funding')) || 'Disabled'}</strong></p>
          </Fragment>
          <Components.forms.fundingPreferences id="default" initialFormData={this.props.achAccountDetails.fundingPreferences} />
        </Components.entities.entitywrapper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_fundingpreferences);


