import { connect, Component, bindActionCreators, Fragment } from 'component';
import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import numeral from 'numeral';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    expenses: _try(() => state.account.expenses.data.items, {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    handleDownload: (attachmentMetadata) => {
      return dispatch(Store.global.downloadAttachment(attachmentMetadata));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_overviews_expense extends Component {




  render() {
    const { id, expenses } = this.props;
    const expense = _try(() => expenses[id], {});

    const notSetTag = (<i>Not set</i>);
    const vendor = expense.vendor || notSetTag;
    let amount = expense.amount || notSetTag;
    if (expense.amount) {
      switch (expense.currency) {
        case 'USD':
        default:
          amount = numeral(amount).format('$0,0.00');
      }
    }
    const date = expense.date ? Utils.dates.dateToDay(expense.date, 'dateFormatUS') : notSetTag;
    const source = expense.source === 'manual' ? 'Manual' : 'Card Placeholder Badge';
    const reimbursable = expense.reimbursable ? 'Yes' : 'No';
    const personal = expense.personal ? 'Yes' : 'No';
    const report = expense.reportId ? <Components.chip refId={expense.reportId} /> : notSetTag;
    const category = expense.category || notSetTag;
    const memo = expense.memo || notSetTag;

    return (
      <div className="components_overviews_expense">
        <div className="row">
          <div className="col-12 col-md-9">
            <div className="row">
              <div className="col-md-6 col-12">
                <strong>Vendor</strong>
                <br />
                <p className="text-muted">{vendor}</p>
              </div>
              <div className="col-md-6 col-12">
                <strong>Amount</strong>
                <br />
                <p className="text-muted">{amount}</p>
              </div>
              <div className="col-md-6 col-12">
                <strong>Transaction Date</strong>
                <br />
                <p className="text-muted">{date}</p>
              </div>
              <div className="col-md-6 col-12">
                <strong>Source</strong>
                <br />
                <p className="text-muted">{source}</p>
              </div>
              <div className="col-md-6 col-12">
                <strong>Reimbursable</strong>
                <br />
                <p className="text-muted">{reimbursable}</p>
              </div>
              <div className="col-md-6 col-12">
                <strong>Report</strong>
                <br />
                <p className="text-muted">{report}</p>
              </div>
              <div className="col-md-6 col-12">
                <strong>Category</strong>
                <br />
                <p className="text-muted">{category}</p>
              </div>
              <div className="col-md-6 col-12">
                <strong>Memo</strong>
                <br />
                <p className="text-muted">{memo}</p>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            {expense.receipt &&
              <div className="h-100 card d-flex justify-content-center align-items-center">
                <button style={{ position: 'absolute', top: 5, right: 5, zIndex: 5 }} className="btn btn-primary" onClick={() => { this.props.handleDownload(expense.receipt); }} ><i className="mdi mdi-download" /></button>
                {(() => {
                  if (expense.receipt.contentType.includes('image')) {
                    return (
                      <Components.containers.image
                        alt={`attachment ${expense.receipt.originalname}`}
                        path={expense.receipt.storagePath}
                        thumbnail={false}
                        hash={expense.receipt.md5Hash}
                      />
                    );
                  }
                  if (expense.receipt.contentType.includes('pdf')) {
                    return (
                      <Components.containers.pdf
                        pdf={expense.receipt}
                        fillHeight
                        hidePagination
                      />
                    );
                  }
                  return (
                    <Components.mimeicon
                      contentType={expense.receipt.contentType}
                    />
                  );
                })()}
              </div>
            }
            {!expense.receipt &&
              <div className="row h-100">
                <div className="col-12 h-100">
                  <div className="row h-100">
                    <div className="col-12 h-100">
                      <div className="card d-flex justify-content-center align-items-center h-100" style={{ minHeight: '75px' }}>
                        <i className="mdi mdi-receipt mdi-48px text-secondary" />
                        No Receipt Uploaded
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_overviews_expense);


