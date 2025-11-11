import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import numeral from 'numeral';

// import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
// import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    providerDisplayName: Selectors.providerTheme(state).displayName,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const paymentMethodMap = {
  vCard: 'Card',
  ACH: 'ACH',
  check: 'Check',
};

class components_paymentdetails extends Component {




  renderCustomFields(customFields) {
    if (!Object.keys(customFields).length) return null;

    return Object.keys(customFields).map((key) => {
      return (
        <div className="col-md-4 col-xs-12">
          <strong>{key}</strong>
          <br />
          <p className="text-muted">{(customFields[key] instanceof Date) ? customFields[key].toString() : customFields[key]}</p>
        </div>
      );
    });
  }

  renderPaymentFields(paymentFields) {
    if (!Object.keys(paymentFields).length) return null;

    return Object.keys(paymentFields).map((key) => {
      return (
        <div className="col-md-4 col-xs-12">
          <strong>{key}</strong>
          <br />
          <p className="text-muted">{(paymentFields[key] instanceof Date) ? paymentFields[key].toString() : paymentFields[key]}</p>
        </div>
      );
    });
  }

  renderPaymentDelivery = (payment) => {

    const accountVendor = this.props.accountVendorsItems[payment.accountVendorId] || {};
    const accountVendorLinked = this.props.accountVendors[payment.accountVendorId] && this.props.accountVendors[payment.accountVendorId].linkedWithPayClearly;

    return (
      <Fragment>
        <h4>Delivery Information</h4>
        <div className="row mt-3 mb-3">
          {(() => {
            if (payment.repEmails || accountVendor.repEmail) {
              const emails = payment.repEmails ? payment.repEmails.split(',').join(', ') : accountVendor.repEmail;
              return (
                <div className="col-md-6 col-xs-12">
                  <strong>Rep Contact Emails</strong>
                  <br />
                  <p className="text-muted">{emails}</p>
                </div>
              );
            }
            return (
              <div className="col-md-6 col-xs-12">
                <strong>Rep Contact Emails</strong>
                <br />
                <p className="text-muted">No rep contact set</p>
              </div>
            );
          })()}
          {(() => {
            if (accountVendorLinked) {
              return (
                <div className="col-xs-12 col-md-6">
                  <div className="d-flex align-items-center">
                    <i className="mdi text-success mdi-check mdi-36px" />
                    <h4 className="my-0 ms-1">Delivery Will Be Handled by {this.props.providerDisplayName}</h4>
                  </div>
                </div>
              );
            } else if (payment.vCardEmail || accountVendor.vCardEmail) {
              const deliveryEmail = payment.vCardEmail || accountVendor.vCardEmail;
              return (
                <div className="col-md-6 col-xs-12">
                  <strong>Delivery Email</strong>
                  <br />
                  <p className="text-muted">{deliveryEmail}</p>
                </div>
              );
            } else if (payment.vCardFaxNumber || accountVendor.vCardFaxNumber) {
              const deliveryFaxNumber = payment.vCardFaxNumber || accountVendor.vCardFaxNumber;
              return (
                <div className="col-md-6 col-xs-12">
                  <strong>Delivery Email</strong>
                  <br />
                  <p className="text-muted">{deliveryFaxNumber}</p>
                </div>
              );
            }
            return (
              <div className="col-md-6 col-xs-12">
                <strong>Delivery</strong>
                <br />
                <p className="text-muted">No delivery set</p>
              </div>
            );
          })()}
        </div>
      </Fragment>
    );
  }

  render() {
    const { payment } = this.props;
    const notSetTag = (<i>Not set</i>);
    const formattedAmount = payment.formattedAmount || notSetTag;
    const accountVendorName = payment.accountVendorName || notSetTag;
    const method = (payment.method && paymentMethodMap[payment.method]) || notSetTag;

    return (
      <Fragment>
        <div className="row mt-3 mb-3 components_paymentdetails">
          <div className="col-md-4 col-xs-12">
            <strong>Payment Amount</strong>
            <br />
            <p className="text-muted">{formattedAmount}</p>
          </div>
          <div className="col-md-4 col-xs-12">
            <strong>Vendor</strong>
            <br />
            <p className="text-muted">{accountVendorName}</p>
          </div>
          <div className="col-md-4 col-xs-12">
            <strong>Payment Method</strong>
            <br />
            <p className="text-muted">{method}</p>
          </div>
          {payment.fee &&
            <div className="col-6">
              <strong>Amount Breakdown</strong>
              <br />
              <div className="mb-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span>Net Amount:&nbsp;&nbsp;</span>
                  </div>
                  <div>
                    <strong>{numeral(payment.amount).subtract(payment.fee).format('$0,0.00')}</strong>
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span>Service Fee:&nbsp;&nbsp;</span>
                  </div>
                  <div>
                    <strong>+&nbsp;{numeral(payment.fee).format('$0,0.00')}</strong>
                  </div>
                </div>
                <hr className="my-1" />
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span>Total Amount:&nbsp;&nbsp;</span>
                  </div>
                  <div>
                    <strong>{numeral(payment.amount).format('$0,0.00')}</strong>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
        {this.renderPaymentDelivery(this.props.payment)}
        {Object.keys(this.props.payment.customFields).length > 0 && <h4>Additional Payment Information</h4>}
        <div className="row mt-3">
          {this.renderPaymentFields(this.props.payment.paymentFields)}
          {this.renderCustomFields(this.props.payment.customFields)}
        </div>
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_paymentdetails);


