import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import numeral from 'numeral';

import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    invoices: state.account.invoices.data.items,
    paymentStatuses: state.account.paymentStatuses.data.items,
    users: state.users.data.items,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    navigateToHistory: (routeParams, routeOptions) => {
      dispatch(Store.router.navigateTo('history', routeParams, routeOptions));
    },
    openInvoicePreviewModal: (id) => {
      dispatch(Store.router.openModal('Components.modals.invoicepreview', { id }));
    },
  });
};

class components_overviews_invoice extends Component {





  navigateToPaymentHistory = (e) => {
    e.preventDefault();
    this.props.navigateToHistory({ npi: _try(() => this.props.invoices[this.props.id]._paymentId) });
  }

  _formatAmount = (amount, currency) => {
    return (
      <Fragment>
        <span>{numeral(amount).format('$0,0.00')}</span>
        <span className="currency ps-1"><Components.badges.status data={currency.toUpperCase()} /></span>
      </Fragment>
    );
  }

  renderInvoiceDataTable = ({ vendorName, invoiceNumber, invoiceDate, amount, currency, dueDate, paymentTerms, chartOfAccount, memo, _paymentId }, { _ref: paymentRef, method, _createdAt, approvedBy }) => {
    // TODO calculate 'On Time', where createdAt day === dueDate day
    const etaStatus = (new Date(_createdAt) - new Date(dueDate) > 86400000) ? 'Late' : 'On Time';
    const eta = (
      <span className="pe-1">
        <Components.badges.status data={etaStatus} color={etaStatus === 'On Time' ? 'primary' : 'danger'} /> {_formatDate(_createdAt)}
      </span>
    );
    const renderCell = (label, value) => (
      <div className="col-6 d-flex justify-content-between">
        <p className="text-muted text-start mb-2">{label}</p>
        <p className="text-end mb-2"><strong className="d-flex align-items-center">{value || '--'}</strong></p>
      </div>
    );
    return (
      <div className="row border-bottom">
        <div className="col-12">
          <div className="row p-0">
            {renderCell('Vendor Name', vendorName)}
            {_paymentId && renderCell('Payment Ref', paymentRef && _paymentId && <Components.chip refId={_paymentId} />)}
          </div>
          <div className="row p-0">
            {renderCell('Invoice #', invoiceNumber)}
            {_paymentId && renderCell('Approved by', _try(() => _formatUser(this.props.users[approvedBy]), '--'))}
          </div>
          <div className="row p-0">
            {renderCell('Amount', amount && currency && this._formatAmount(amount, currency))}
            {_paymentId && renderCell('Method', method && _formatMethod[method])}
          </div>
          <div className="row p-0">
            {renderCell('Invoice Date', invoiceDate && _formatDate(invoiceDate))}
            {_paymentId && renderCell('Chart of Account', chartOfAccount)}
          </div>
          <div className="row p-0">
            {renderCell('Payment Terms', paymentTerms)}
            {_paymentId && renderCell('ETA', eta)}
          </div>
          <div className="row p-0">
            {renderCell('Due Date', dueDate && _formatDate(dueDate))}
            {_paymentId && renderCell('Credits', _formatDollars(0))}
          </div>
          <div className="row p-0">
            {renderCell('Memo', memo)}
            {_paymentId && renderCell(method && _formatMethod[method], amount && _formatDollars(amount))}
          </div>
        </div>
      </div>
    );
  }


  renderOverviewCard = (invoice, paymentStatus) => {
    return (
      <div className="card card-with-label">
        <p className="card-label px-1"><strong>Invoice Summary</strong></p>
        <div className="card-body">
          {
            paymentStatus.created &&
            <div className="row">
              <div className="col-8">
                <p>Your payment has been submitted! You can find more information about this payment in the Payment History.</p>
                <p><strong>{invoice.vendorName}</strong> will be auto-paid via <strong>{_formatMethod[paymentStatus.created.method]}</strong> for invoice <strong>{invoice.invoiceNumber}</strong>.</p>
              </div>
              <div className="col-4">
                <Components.button
                  buttonText="View in Payment History"
                  onClick={this.navigateToPaymentHistory}
                />
              </div>
            </div>
          }
          <div className="row">
            <div onClick={() => this.props.openInvoicePreviewModal(invoice.id)} className="hoverable col-4">
              <Components.containers.image alt="Invoice Preview" className="p-0 shadow-sm" path={invoice.attachment.storagePath} />
            </div>
            <div className="col-8">

              {this.renderInvoiceDataTable(invoice, paymentStatus.created || {})}
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { paymentStatuses, invoices, id } = this.props;
    const invoice = _try(() => invoices[id], {});
    const paymentStatus = _try(() => paymentStatuses[invoice._paymentId], {});

    return (
      <div className="components_overviews_invoice p-4">
        <div className="row">
          <div className="col-12 mb-3">
            {this.renderOverviewCard(invoice, paymentStatus)}
          </div>
        </div>

      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_invoice);

// Internal Helper Functions ...

const _formatDollars = amount => numeral(amount).format('$0,0.00');
const _formatDate = date => Utils.dates.dateToDay(new Date(date), 'UTCDayOnly');
const _formatMethod = {
  vCard: 'Virtual Card',
  ach: 'ACH',
  check: 'Check',
};
const _formatUser = ({ firstName, lastName, email }) => {
  return (firstName && lastName) ? `${firstName} ${lastName}` : email;
};

// GENERATOR_TYPE='component';
