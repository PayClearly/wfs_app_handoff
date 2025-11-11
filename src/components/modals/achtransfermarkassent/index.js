import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    achAccountCredentialsStatus: state.account.achAccountCredentials.status,
    achAccountCredentialDetails: state.account.achAccountCredentials.data.item,
    achAccountDetailsStatus: state.account.achAccountDetails.status,
    achAccountDetails: state.account.achAccountDetails.data.item,
    achTransfers: state.account.achTransfers.data.items,
    achTransfersStatus: state.account.achTransfers.status,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    fetchPrivateCreds: () => {
      return dispatch(Store.account.fetchPrivateACHCreds());
    },
    clearPrivateCreds: () => {
      return dispatch(Store.account.clearPrivateACHCreds());
    },
    markAsSent: (transferId, uid) => {
      return dispatch(Store.account.sendAchTransfer(transferId, { _sentBy: uid }));
    },
    updateAchAccountDetails: (data) => {
      return dispatch(Store.account.updateAchAccountDetails(data));
    },
  });
};

class components_modals_achtransfermarkassent extends Component {

  state = {
    loading: true,
  };

  componentDidMount() {
    this.props.fetchPrivateCreds();
  }
  componentWillUnmount() {
    this.props.clearPrivateCreds();
  }

  render() {
    const { transferId, csrId, achAccountDetails } = this.props;
    return (
      <div className="modal-dialog components_modals_achtransfermarkassent" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className={`modal-title ${!achAccountDetails.setupComplete && 'text-danger'}`} id="exampleModalLabel">{(!achAccountDetails.setupComplete && 'Setup Required!') || this.props.title}</h5>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md">
                <h3>Please complete the following ACH transfer:</h3>
                {
                  _try(() => this.props.achAccountCredentialsStatus.fetched) ?
                    <Fragment>
                      <p>
                        Amount: ${this.props.achTransfers[transferId].amount.value}
                        <br />
                        Bank Name: {this.props.achAccountDetails.name}
                        <br />
                        Funding Source Type: {this.props.achAccountCredentialDetails.from.type}
                        <br />
                        Bank Routing Number: {achAccountDetails.setupComplete ? _formatLastFour(this.props.achAccountCredentialDetails.from.routingNumber) : this.props.achAccountCredentialDetails.from.routingNumber}
                        <br />
                        Bank Account Number: {achAccountDetails.setupComplete ? _formatLastFour(this.props.achAccountCredentialDetails.from.accountNumber) : this.props.achAccountCredentialDetails.from.accountNumber}
                        <br />
                        Company ID: {this.props.achAccountCredentialDetails.to.companyId}
                        <br />
                        Company Account ID: {this.props.achAccountCredentialDetails.to.accountId}
                      </p>
                      <div className="row float-end mt-4 mb-4">
                        {
                          achAccountDetails.setupComplete
                            ? <button
                              onClick={() => { this.props.markAsSent(transferId, csrId); this.props.close(); }}
                              className="btn btn-danger me-3"
                              type="button"
                              aria-label={'mark this transfer as sent'}
                              disabled={false}
                            >Mark as Sent</button>
                            : <Components.button
                              onClick={() => this.props.updateAchAccountDetails({
                                setupComplete: true,
                                routingLastFour: this.props.achAccountCredentialDetails.from.routingNumber.slice(-4),
                                accountLastFour: this.props.achAccountCredentialDetails.from.accountNumber.slice(-4),
                              })}
                              className="btn me-3"
                              aria-label={'setup complete'}
                              updating={this.props.achAccountDetailsStatus.updating}
                              buttonText="Setup Complete"
                            />
                        }
                      </div>
                    </Fragment> :
                    <div className="mb-3">
                      <Components.spinner />
                    </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_achtransfermarkassent);

// Internal Helper Functions ...
const _formatLastFour = (value) => {
  if (value && typeof value === 'string') {
    return `*${value.slice(-4)}`;
  }
};
