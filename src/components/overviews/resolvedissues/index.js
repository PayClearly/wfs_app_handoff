import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import numeral from 'numeral';

import Selectors from 'selectors';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    paymentIssues: state.account.paymentIssues.data.items,
    providerDisplayName: Selectors.providerTheme(state).displayName,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_overviews_resolvedissues extends Component {




  render() {
    return (
      <div className="row components_overviews_resolvedissues">
        {this.props.resolvedIssues.map((issueId, index) => {
          const issue = this.props.paymentIssues[issueId];

          let description = 'Payment had unused funds, or a refund';
          if (issue.code === '1') {
            description = 'Virtual card had unused funds at time of expiration';
          } else if (issue.code === '2') {
            description = 'Merchant issued a refund on the payment';
          } else if (issue.code === '3') {
            description = 'The check mailed for this payment was returned';
          } else if (issue.code === '4') {
            description = 'The payment had an expired auth without a matching clear';
          }

          let resolution = `Payment issue was resolved${(_try(() => issue._resolvedAt) || _try(() => issue._lastModifiedAt)) ? ` on ${(new Date((_try(() => issue._resolvedAt) || _try(() => issue._lastModifiedAt))).toLocaleDateString())}` : ''}`;
          switch (issue.resolutionCode) {
            case '1':
              resolution = `Payment was refunded ${numeral(issue.amount).format('$0,0.00')}${(_try(() => issue._resolvedAt) || _try(() => issue._lastModifiedAt)) ? ` on ${(new Date((_try(() => issue._resolvedAt) || _try(() => issue._lastModifiedAt))).toLocaleDateString())}` : ''}. Funds were sent back to your funding source via a withdrawal transfer.`;
              break;
            case '2':
              resolution = `Payment was refunded ${numeral(issue.amount).format('$0,0.00')}${(_try(() => issue._resolvedAt) || _try(() => issue._lastModifiedAt)) ? ` on ${(new Date((_try(() => issue._resolvedAt) || _try(() => issue._lastModifiedAt))).toLocaleDateString())}` : ''}. Funds were kept in your ${this.props.providerDisplayName} account, and made available for other payments.`;
              break;
            case '3':
              resolution = `Payment was cancelled${(_try(() => issue._resolvedAt) || _try(() => issue._lastModifiedAt)) ? ` on ${(new Date((_try(() => issue._resolvedAt) || _try(() => issue._lastModifiedAt))).toLocaleDateString())}` : ''}`;
              break;
            default:
              break;
          }

          return (
            <div className="col-12">
              <h6>Issue {index + 1} of {this.props.resolvedIssues.length}</h6>
              <div className="row">
                <div className="col-xs-12 col-md">
                  <strong>Description</strong>
                  <br />
                  <p className="text-muted">{description}</p>
                </div>
                <div className="col-xs-12 col-md">
                  <strong>Resolution</strong>
                  <br />
                  <p className="text-muted">{resolution}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_resolvedissues);


