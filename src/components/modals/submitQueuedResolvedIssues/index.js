import { connect, Component, bindActionCreators, Fragment } from 'component';

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    paymentIssues: state.account.paymentIssues.data.items,
    paymentIssuesStatus: state.account.paymentIssues.status,
    paymentStatuses: state.account.paymentStatuses.data.items,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    submitQueuedResolvedIssues: (data) => {
      dispatch(Store.account.submitQueuedResolvedIssues(data));
    },
  });
};

class components_modals_submitQueuedResolvedIssues extends Component {


  componentWillReceiveProps(nextProps = {}) {
    if (this.props.paymentIssuesStatus.updating && !nextProps.paymentIssuesStatus.updating) {
      this.props.close();
    }
  }


  submitQueuedResolvedIssues = () => {
    const { pendingResolvedIssueIds, forms } = this.props;
    const form = _try(() => forms['Components.forms.queuedResolvedIssues'].default, {}) || {};
    const note = _try(() => form._values.note);
    const data = {
      ids: pendingResolvedIssueIds,
    };

    if (note) data.note = note;

    return this.props.submitQueuedResolvedIssues(data);
  }

  render() {
    const { submitAll, forms } = this.props;
    const form = _try(() => forms['Components.forms.queuedResolvedIssues'].default, {}) || {};

    return (
      <div className="modal-dialog" role="document">
        <div className="modal-content h-100 w-100 components_modals_submitQueuedResolvedIssues">
          <div className="modal-header">
            <h4 className="modal-title" id="exampleModalLabel">
              {submitAll ? 'Submit all Pending Withdrawals' : `Submit Pending Withdrawal for P_${_try(() => this.props.paymentStatuses[this.props.paymentIssues[this.props.pendingResolvedIssueIds[0]].paymentId]._ref)}`}
            </h4>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body" style={{ overflowX: 'scroll', overflowY: 'scroll' }}>
            <h3>Are you sure you want to do this?</h3>
            <p>{submitAll ? 'You are about to create an expedited withdrawal transfer for all current pending withdrawals.' : 'You are about to create an expedited withdrawal transfer out of this pending withdrawal.'}</p>
            <Components.forms.queuedResolvedIssues
              disabled={this.props.paymentIssuesStatus.updating}
            />
          </div>
          <div className="modal-footer">
            <Components.button
              onClick={this.submitQueuedResolvedIssues}
              updating={this.props.paymentIssuesStatus.updating}
              disabled={this.props.paymentIssuesStatus.updating || !form._allValid}
              buttonText="Submit"
              className="btn btn-primary"
            />
            <button
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
              onClick={this.props.close}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_submitQueuedResolvedIssues);


