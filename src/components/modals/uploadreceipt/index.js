import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import numeral from 'numeral';

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    paymentStatusesStatus: state.account.paymentStatuses.status,
    paymentStatuses: state.account.paymentStatuses.data.items,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    uploadReceiptToPayment: (id, params) => {
      dispatch(Store.account.updatePaymentPipelines([id], 'uploadReceipt', params));
    },
  });
};

class components_modals_uploadreceipt extends Component {

  state = {
    receipts: [],
    showError: false,
  };


  componentWillReceiveProps(nextProps) {
    if (this.props.paymentStatusesStatus.updating && !nextProps.paymentStatusesStatus.updating && !nextProps.paymentStatusesStatus.updatingError) {
      this.props.close();
    }
    if (this.props.paymentStatuses && this.props.paymentStatuses[this.props.id] && (this.props.paymentStatuses[this.props.id].sent.receipts !== nextProps.paymentStatuses[this.props.id].sent.receipts && nextProps.paymentStatuses[this.props.id].sent.receipts.length === nextProps.paymentStatuses[this.props.id].funded.vCards.length)) {
      this.props.close();
    }
  }


  onDrop = (files) => {
    this.setState({
      receipts: files,
      showError: true,
    });
  };

  render() {
    if (!this.props.paymentStatusesStatus.fetched) return null;
    const paymentStatus = this.props.paymentStatuses[this.props.id];
    const existingReceipts = paymentStatus.sent && paymentStatus.sent.receipts;
    const uploading = this.props.paymentStatusesStatus.updating;
    const disableButtons = uploading;
    const disableUpload = !this.state.receipts.length || ((existingReceipts && existingReceipts.length) ? (this.state.receipts.length + existingReceipts.length) > paymentStatus.funded.vCards.length : this.state.receipts.length > paymentStatus.funded.vCards.length);
    let errorMsg;
    if (disableUpload) {
      errorMsg = !this.state.receipts.length ? 'You must upload at least one file' : `Too many files to be uploaded. Total number of receipts must match number of cards for this payment.${existingReceipts && existingReceipts.length ? ` ${existingReceipts.length} receipts previously uploaded.` : ''}`;
    }


    return (
      <div className="modal-dialog" role="document">
        <div className="modal-content h-100 w-100">
          <div className="modal-header">
            <h4 className="modal-title" id="exampleModalLabel">
              Upload Receipts
            </h4>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body" style={{ overflowX: 'scroll', overflowY: 'scroll' }}>
            <div className={'row mb-3'}>
              <div className={'col-12'}>
                <h3>
                  Please upload receipt(s) for authorization of payment for {numeral(paymentStatus.created.amount).format('$0,0.00')} to {paymentStatus.verified.vendor.name}
                </h3>
              </div>
            </div>
            <div className={'col-12'}>
              <Components.dropzone
                title={'Upload Receipts'}
                accept={'application/pdf, image/jpeg, image/png'}
                instructions={'Click to upload or drag and drop a supported file(s)'}
                onDrop={this.onDrop}
                acceptedFiles={this.state.receipts}
                fullSizeImagePreviews
              />
            </div>
            {this.state.showError && errorMsg && <span className="text-danger"><i className="mdi mdi-alert-circle-outline text-danger" />&nbsp;{errorMsg}</span>}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
              onClick={() => { if (disableButtons) return; this.props.close(); }}
              disabled={disableButtons}
            >
              Close
            </button>
            <Components.button
              className="btn btn-primary"
              buttonText="Upload Receipts"
              onClick={() => {
                if (disableButtons || disableUpload) return;
                const data = {
                  receipts: this.state.receipts,
                };

                // handles need to upload more receipts for multi-card payments
                if (existingReceipts && existingReceipts.length) {
                  data.existingReceipts = existingReceipts;
                }

                this.props.uploadReceiptToPayment(this.props.id, data);
              }}
              onDisabledClick={() => { this.setState({ showError: true }); }}
              ariaLabel="Upload Receipts"
              updating={uploading}
              disabled={disableButtons || disableUpload}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_uploadreceipt);


