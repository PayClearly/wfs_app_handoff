import { connect, Component, bindActionCreators, Fragment } from 'component';

import Utils from 'utils';
import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    status: state.account.achIntegration.status,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openAreYouSureModal: (data) => { dispatch(Store.router.openModal('Components.modals.areyousure', data)); },
    removeFundingSource: () => {
      return dispatch(Store.account.updateIntegration('achIntegration', { type: 'removeFundingSource' }));
    },
  });
};

class components_integrationcomps_achintegration_DWOLLA_overviews_fundingsource extends Component {

  render() {
    const { fundingSource, details, status } = this.props;

    return (
      <div className="components_integrationcomps_achintegration_DWOLLA_overviews_fundingsource">
        <div className="card card-with-label small-padding">
          <p className="card-label px-1"><strong>Funding Source</strong></p>
          <div className="card-body low-pad">
            {fundingSource && fundingSource.id ?
              <div>
                <div className="flex">
                  <p className="text-muted mb-2">Account: <strong>{fundingSource.name}</strong></p>
                  <p className="text-muted mb-2">Type: <strong>{Utils.capitalize(fundingSource.bankAccountType)}</strong></p>
                </div>
                <div className="flex">
                  <p className="text-muted mb-2">Bank: <strong>{fundingSource.bankName}</strong></p>
                  <p className="text-muted mb-2">Dwolla Balance: <strong>{`$${details.balance || fundingSource.balance || 0}`}</strong></p>
                </div>
                <Components.button
                  buttonText="Remove Funding Source"
                  onClick={() => {
                    this.props.openAreYouSureModal({
                      title: 'Remove Funding Source',
                      content: 'Once funding source is removed you will not be able to initiate payments via ACH. You will need to add a new funding source to continue making payments.',
                      noText: 'No',
                      yesText: 'Yes',
                      onYes: () => {
                        return this.props.removeFundingSource();
                      },
                    });
                  }}
                  updating={status.updating}
                  ariaLabel="Remove Funding Source"
                  className="btn btn-danger mt-2 me-4"
                  icon="mdi mdi-close"
                />
              </div>
              :
              <strong>Funding Source not configured, additional setup is required.</strong>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_integrationcomps_achintegration_DWOLLA_overviews_fundingsource);

