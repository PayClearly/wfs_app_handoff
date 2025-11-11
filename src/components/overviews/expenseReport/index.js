import { connect, Component, bindActionCreators, Fragment } from 'component';
import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import { Collapse } from 'react-collapse';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    expenseReports: Selectors.tableData.expenseReports(state),
    approverPolicies: Selectors.entity('expenseReportApprovals_idOrganization_idAccount')(state),
    approvals: state.account.expenseReportApprovals,
    expenseReportCommentsStatus: state.account.expenseReportComments.status,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    approveExpenseReport: () => {
      dispatch(Store.account.createExpenseReportApproval({ expenseReportId: props.id }));
    },
    reimburseExpenseReport: (id) => {
      dispatch(Store.account.updateExpenseReportApproval(id, { reimbursed: true }));
    },
    openRejectReportModal: () => {
      dispatch(Store.router.openModal('Components.modals.rejectExpenseReport', { expenseReportId: props.id }));
    },
    createExpenseReportComment: (data) => {
      dispatch(Store.account.createExpenseReportComment(data));
    },
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_overviews_expenseReport extends Component {
  state = {};


  componentWillReceiveProps(nextProps = {}) {
    if (_try(() => this.props.expenseReportCommentsStatus.creating) && (!_try(() => nextProps.expenseReportCommentsStatus.creating) && !_try(() => nextProps.expenseReportCommentsStatus.creatingError))) {
      const formName = 'Components.forms.expenseReportComment';
      const formKey = this.props.id;
      if (_try(() => this.props.forms[formName][formKey])) this.props.resetForm(formName, formKey, Object.keys(this.props.forms[formName][formKey]._values).reduce((acc, cur) => { acc[cur] = undefined; return acc; }, {}));
    }
  }


  createExpenseReportComment = () => {
    const { id, forms } = this.props;
    const memo = _try(() => forms['Components.forms.expenseReportComment'][id].memo.value);

    this.props.createExpenseReportComment({ memo, expenseReportId: id });
  }

  render() {
    const { id, expenseReports, approverPolicies, approvals } = this.props;
    const expenseReport = _try(() => expenseReports.items[id], {});

    const notSetTag = (<i>Not set</i>);
    const name = expenseReport.name;
    const ref = `E_${expenseReport._ref}`;
    const from = expenseReport.createdBy && <Components.badges.createdby user={expenseReport.createdBy} />;
    const to = (expenseReport.approver && <Components.badges.createdby user={expenseReport.approver} />) || notSetTag;
    const total = (expenseReport.recordTotal && Utils.numeral()(expenseReport.recordTotal).format('$0,0.00')) || notSetTag;
    const count = expenseReport.count;
    const status = <Components.badges.expenseReportStatus status={expenseReport.status} />;
    const date = Utils.dates.dateToDay(expenseReport._createdAt, 'dateFormatUS');
    return (
      <div className="components_overviews_expenseReport">
        <div className="d-flex justify-content-between align-items-center">
          {name && <h2 className="mb-0">{name}</h2>}
          {approverPolicies.canCreate &&
            <div>
              {expenseReport.status === 'submitted' &&
                <Components.button
                  className="btn btn-secondary me-2"
                  buttonText="Reject"
                  onClick={this.props.openRejectReportModal}
                />
              }
              {expenseReport.status === 'submitted' &&
                <Components.button
                  className="btn btn-primary"
                  buttonText="Approve"
                  onClick={this.props.approveExpenseReport}
                  updating={_try(() => approvals.status.creating)}
                  disabled={_try(() => approvals.status.creating)}
                />
              }
              {expenseReport.status === 'approved' &&
                <Components.button
                  className="btn btn-success"
                  buttonText="Mark as Reimbursed"
                  onClick={() => this.props.reimburseExpenseReport(expenseReport.approvalId)}
                  updating={_try(() => approvals.status.updating)}
                  disabled={_try(() => approvals.status.updating)}
                />
              }
            </div>
          }
        </div>
        <br />
        <div className="d-flex justify-content-between align-items-top mb-3">
          <div>
            <div className="mb-4">
              {status}
            </div>
            <div>
              <strong>Report Ref #</strong>
              <br />
              <p className="text-muted">{ref}</p>
            </div>
          </div>
          <div className="">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span>Reimbursable:&nbsp;&nbsp;</span>
              </div>
              <div>
                <strong className="text-primary">{Utils.numeral()(expenseReport.reimbursableTotal).format('$0,0.00')}</strong>
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span>Non-Reimbursable:&nbsp;&nbsp;</span>
              </div>
              <div>
                <strong>{Utils.numeral()(Utils.addDollars([expenseReport.recordTotal || 0, -expenseReport.reimbursableTotal])).format('$0,0.00')}</strong>
              </div>
            </div>
            <hr className="my-1" />
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span>Total:&nbsp;&nbsp;</span>
              </div>
              <div>
                <strong className="text-primary">{Utils.numeral()(total).format('$0,0.00')}</strong>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <Components.tables.expenses
            tableKey={id}
            initialTableStateOverride={{
              filters: {
                deleted: { key: 'deleted', type: 'bool', comparator: 'is', value: false },
                expenseReport: { key: 'reportId', type: 'string', comparator: 'equals', value: id },
              },
              sort: {
                sortKey: 'date',
                orderIn: 'desc',
              },
            }}
            nestedTable
            hideFilter
          />
        </div>
        {expenseReport.commentIds &&
          <div>
            <h4 className="m-0 py-3 d-inline-block module-header" onClick={() => { this.setState(prevState => ({ commentsOpen: !prevState.commentsOpen })); }}><i className={`mdi mdi-menu-right${this.state.commentsOpen ? ' rotate90 inline-rotate' : ''}`} />  Comments</h4>
            <Collapse isOpened={this.state.commentsOpen}>
              <Components.expenseCommentsList commentIds={Object.keys(expenseReport.commentIds)} />
              {!(expenseReport.status === 'approved' || expenseReport.status === 'reimbursed') &&
                <Fragment>
                  <div className="row">
                    <div className="col-11">
                      <Components.forms.expenseReportComment formKey={id} hideLabel handleEnterPress={this.createExpenseReportComment} disabled={_try(() => this.props.expenseReportCommentsStatus.creating)} />
                    </div>
                    <div className="col-1">
                      <Components.button
                        buttonText="Add"
                        onClick={this.createExpenseReportComment}
                        className="btn btn-primary"
                        ariaLabel="Add Comment"
                        updating={_try(() => this.props.expenseReportCommentsStatus.creating)}
                        disabled={_try(() => this.props.expenseReportCommentsStatus.creating)}
                      />
                    </div>
                  </div>
                  {_try(() => this.props.expenseReportCommentsStatus.creatingError) &&
                    <div className="alert alert-danger" role="alert">
                      {this.props.expenseReportCommentsStatus.creatingError}
                    </div>
                  }
                </Fragment>
              }
            </Collapse>
          </div>
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_overviews_expenseReport);


