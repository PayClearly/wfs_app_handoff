import { connect, Component, bindActionCreators, Fragment } from 'component';

import Store from 'store';
import Components from 'components';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    expenseReportComments: state.account.expenseReportComments,
    expenseReports: state.account.expenseReports,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    createExpenseReportComment: (data) => {
      dispatch(Store.account.createExpenseReportComment(data));
    },
    rejectExpenseReport: (id) => {
      dispatch(Store.account.updateExpenseReport(id, { rejected: true }));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_modals_rejectExpenseReport extends Component {

  componentWillReceiveProps(nextProps = {}) {
    if (_try(() => this.props.expenseReports.status.updating) && (!_try(() => nextProps.expenseReports.status.updating) && !_try(() => nextProps.expenseReports.status.updatingError))) this.props.close();
  }

  rejectExpenseReport = () => {
    const { forms, expenseReportId } = this.props;

    const memo = _try(() => forms['Components.forms.expenseReportComment'].reject.memo.value);
    if (memo) this.props.createExpenseReportComment({ memo, expenseReportId });
    this.props.rejectExpenseReport(expenseReportId);
  };

  render() {
    const { expenseReportComments, expenseReports } = this.props;
    const expenseReportCommentsStatus = expenseReportComments.status;
    const expenseReportsStatus = expenseReports.status;

    return (
      <div className="modal-dialog wide-modal wide-70" role="document">
        <div className="modal-content components_modals_rejectExpenseReport">
          <div className="modal-header">
            <h3 className="modal-title" id="exampleModalLabel">Reject Expense Report</h3>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md mb-4" >
                <h3>You are about to reject this expense report</h3>
                <p>Please provide relevant information regarding any errors or issues that need to be addressed</p>
              </div>
            </div>
            <Components.forms.expenseReportComment formKey="reject" />
          </div>
          <div className="modal-footer">
            <button
              onClick={this.props.close}
              className="btn btn-secondary"
              type="button"
              aria-label="reset password button"
              disabled={false}
            >Cancel</button>
            <Components.button
              onClick={this.rejectExpenseReport}
              updating={expenseReportsStatus.updating || expenseReportCommentsStatus.creating}
              disabled={expenseReportsStatus.updating || expenseReportCommentsStatus.creating}
              buttonText="Reject"
              className="btn btn-danger"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_modals_rejectExpenseReport);

