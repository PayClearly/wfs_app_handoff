import {
  connect, Component, bindActionCreators, Fragment,
} from 'component';

// Third Party Imports ...
import numeral from 'numeral';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  paymentStatusIssue: state.account.paymentIssues.data.items[props.issueId],
  paymentStatusesStatus: state.account.paymentStatuses.status,
  policies: Selectors.entity('paymentStatuses_idOrganization_idAccount')(state),
  isCsr: Selectors.entity('globalVendors_*')(state),
  providerTheme: Selectors.providerTheme(state),
});

const mapDispatchToProps = (dispatch, props) => ({
  paymentStatusesIssueResolve: (paymentId, params) => {
    dispatch(Store.account.updatePaymentPipelines([paymentId], 'resolveIssue', params));
  },
  clearErrors: () => {
    dispatch(Store.account.clearErrorsPaymentPipelines());
  },
});

class components_entities_paymentstatusissue extends Component {
  state = {
    selectedResolution: null,
  };

  componentWillUnmount() {
    this.props.clearErrors();
  }

  on = {
    resolutionSelected: () => this.props.paymentStatusesIssueResolve(this.props.paymentStatusIssue.paymentId, { resolution: this.state.selectedResolution, issueId: this.props.issueId }),
  };

  render() {
    const issue = this.props.paymentStatusIssue;
    if (!issue) { return null; }
    const { canRead, canUpdate, canDelete } = this.props.policies;

    const updateDisabled = !this.state.selectedResolution || this.props.paymentStatusesStatus.updating;
    const { updating } = this.props.paymentStatusesStatus;
    const error = this.props.paymentStatusesStatus.updatingError;

    const allResolutions = {
      1: 'Send the funds back to your funding source via a withdrawal transfer',
      2: `Keep the funds in your ${this.props.providerTheme.displayName} account for future use`,
      3: 'Acknowledge and cancel payment',
    };

    let resolutions;
    // maintaining the correct numerical keys is vital since the api reads these keys as resolution "codes"
    switch (issue.code) {
      case '3':
        resolutions = { 3: allResolutions['3'] };
        break;
      case '1':
      case '2':
      default:
        resolutions = { 1: allResolutions['1'], 2: allResolutions['2'] };
        break;
    }

    return (
      <Fragment>
        <Fragment>
          {this.props.hideTitle
            ? null
            : <h2>
              <i className="mdi mdi-alert-circle-outline me-2 text-danger" />
              {_title(issue)}
            </h2>}
          <span>
            {_message(issue)}
          </span>
        </Fragment>
        {this.props.isCsr.canRead
          ? <Components.entities.entitywrapper
            canRead={canRead}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onSubmit={() => { this.on.resolutionSelected(); }}
            updating={updating}
            error={error}
            updateDisabled={updateDisabled}
            editBtnText="Resolve Issue"
            wrapperClasses="components_entities_paymentstatusissue"
          >
            <span />
            <Fragment>
              <div className="row mb-2">
                <div className="col-md-12">
                  <h3>How would you like to resolve this issue?</h3>
                </div>
                {
                  Object.keys(resolutions)
                    .map((key) => {
                      const text = resolutions[key];
                      return (
                        <div className="col-md-12">
                          <h4 className="ps-4">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              onClick={() => { this.setState({ selectedResolution: key }); }}
                              checked={this.state.selectedResolution === key}
                            />
                            {text}
                          </h4>
                        </div>);
                    })
                }
              </div>
            </Fragment>
          </Components.entities.entitywrapper>
          : <span>{this.props.providerTheme.displayName} is resolving this issue.</span>}
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_paymentstatusissue);

// Internal Helper Functions ...
function _title(item) {
  switch (item.code) {
    case '1':
      return 'Funds Remaining';
    case '2':
      return 'Refunded';
    case '3':
      return 'Check Returned';
    case '4':
      return 'Auth expired';
    case '5':
      return 'Ach debit failed';
    default:
      return 'Unknown Issue';
  }
}

function _message(item) {
  switch (item.code) {
    case '1':
      return `There are ${numeral(item.amount).format('$0,0.00')} remaining for this payment. This means the vendor did not use some of the funds that were allocated for this payment.`;
    case '2':
      return `There was a refund of the amount: ${numeral(item.amount).format('$0,0.00')} for this payment.`;
    case '3':
      return 'The check mailed for this payment was returned. You will need to cancel this payment and, if necessary, resubmit the payment.';
    case '4':
      return `This payment has an expired auth without a matching clear of amount ${numeral(item.amount).format('$0,0.00')}`;
    default:
      return '';
  }
}

