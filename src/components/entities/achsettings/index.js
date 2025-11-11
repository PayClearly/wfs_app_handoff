import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import objectResolvePath from 'object-resolve-path';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    achAccount: state.account.achAccounts.data.items,
    status: state.account.achAccounts.status,
    accountId: state.account.data.id,
    organizationId: state.organization.data.id,
    providerTheme: Selectors.providerTheme(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openAchSetupModal: () => {
      dispatch(Store.router.openModal('Components.modals.setupachpayments', {}));
    },
    openAreYouSureModal: (data) => {
      dispatch(Store.router.openModal('Components.modals.areyousure', data));
    },
    deactivateAchAccount: () => {
      dispatch(Store.account.updateACHAccount({ status: 'deactivated' }));
    },
    reactivateAchAccount: () => {
      dispatch(Store.account.updateACHAccount({ status: 'reactivated' }));
    },
  });
};

class components_entities_achsettings extends Component {



  setupAchPayments = () => {
    this.props.openAchSetupModal();
  };

  handleReactivate() {
    this.props.openAreYouSureModal({
      title: 'Reactivate ACH Payments',
      content: 'You are about reactivate ACH payments on this account',
      noText: 'No',
      yesText: 'Yes',
      onYes: () => { this.props.reactivateAchAccount(); },
    });
  }

  handleDeactivate() {
    this.props.openAreYouSureModal({
      title: 'Deactivate ACH Payments',
      content: 'You are about deactivate ACH payments on this account',
      noText: 'No',
      yesText: 'Yes',
      onYes: () => { this.props.deactivateAchAccount(); },
    });
  }

  renderAchButton = (status) => {
    if (status.isCertified && status.isVerified) {
      return (
        <Components.button
          buttonText="Disable ACH Payments"
          onClick={() => this.handleDeactivate()}
          className="btn btn-secondary"
          disabled={this.props.status.creating}
          updating={this.props.status.creating}
        />
      );
    }

    if (status.isCertified && !status.isVerified) {
      return (
        <Components.button
          buttonText="Reactivate ACH Payments"
          onClick={() => this.handleReactivate()}
          className="btn btn-primary"
          disabled={this.props.status.creating}
          updating={this.props.status.creating}
        />
      );
    }

    return (
      <Components.button
        buttonText="Enable ACH Payments"
        onClick={() => this.setupAchPayments()}
        className="btn btn-primary"
        disabled={this.props.status.creating}
        updating={this.props.status.creating}
      />
    );
  }

  render() {
    const isCertified = (objectResolvePath(this.props.achAccount, 'beneficialOwner.beneficialOwnershipStatus') === 'certified');
    const isVerified = objectResolvePath(this.props.achAccount, 'status') === 'verified';

    const error = !!this.props.status.creatingError;

    return (
      <Fragment>
        <div className="row mt-5">
          <div className="col">
            <h3 style={{ display: 'inline' }}>Enable ACH Payments</h3>
            <p>Enables ACH payments on the {this.props.providerTheme.displayName} platform.</p>
          </div>
          <div className="col" style={{ position: 'absolute', left: '500px' }}>
            {(!error && isCertified && isVerified) &&
              <span className="text-success">
                <i className="mdi mdi-check mdi-48px" />
              </span>}
          </div>
        </div>
        <div className="row">
          <div className="col">
            {this.renderAchButton({ isCertified, isVerified })}
          </div>
        </div>
        {error &&
          <div className="alert alert-danger mt-2" role="alert">
            <h4 className="alert-heading">Something Went Wrong</h4>
            Please try again in a few minutes.
          </div>}
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_achsettings);


