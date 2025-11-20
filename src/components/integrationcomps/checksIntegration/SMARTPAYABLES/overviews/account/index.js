import { connect, Component, bindActionCreators, Fragment } from 'component';

import Selectors from 'selectors';


const mapStateToProps = (state, props) => {
  return ({
    checksIntegration: _try(() => Selectors.integrations(state).checksIntegration, {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_integrationcomps_checksIntegration_SMARTPAYABLES_overviews_account extends Component {




  render() {
    const { details } = _try(() => this.props.checksIntegration, {});
    return (
      <div className="components_integrationcomps_checksIntegration_SMARTPAYABLES_overviews_account">
        <div className="card card-with-label small-padding">
          <p className="card-label px-1"><strong>Check Account</strong></p>
          <div className="card-body low-pad">
            {details && details.bankAccountId ?
              <div>
                <p className="text-muted mb-2">Status: <strong>{details.active ? 'Active' : 'Pending'}</strong></p>
                <p className="text-muted mb-2">Bank Account: <strong>{_try(() => details.bankName, 'N/A')}</strong></p>
                <p className="text-muted mb-2">Name Printed on Check: <strong>{_try(() => details.checkName, 'N/A')}</strong></p>
                <p className="text-muted mb-2">Address Printed on Check: <strong>{_try(() => details.checkAddress.split(' | ').join(', '))}</strong></p>
              </div> :
              <strong>Check Account not configured, additional setup is required.</strong>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_integrationcomps_checksIntegration_SMARTPAYABLES_overviews_account);


