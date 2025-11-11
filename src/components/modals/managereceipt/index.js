import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    paymentStatusesStatus: state.account.paymentStatuses.status,
    paymentStatuses: state.account.paymentStatuses.data.items,
    user: state.user,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    downloadAttachment: (attachmentMetadata) => {
      return dispatch(Store.global.downloadAttachment(attachmentMetadata));
    },
    removeReceipt: (id, params) => {
      dispatch(Store.account.updatePaymentPipelines([id], 'removeReceipt', params));
    },
  });
};

class components_modals_managereceipt extends Component {


  componentWillReceiveProps(nextProps = {}) {
    if ((_try(() => this.props.paymentStatuses[nextProps.id].sent.receipts) && this.props.paymentStatuses[nextProps.id].sent.receipts.length) && (!_try(() => nextProps.paymentStatuses[nextProps.id].sent.receipts) || !nextProps.paymentStatuses[nextProps.id].sent.receipts.length)) {
      this.props.close();
    }
  }


  removeReceipt = (index) => {
    const paymentStatus = this.props.paymentStatuses[this.props.id];

    const params = {
      existingReceipts: _try(() => paymentStatus.sent.receipts) || [],
      receiptKey: index,
    };

    this.props.removeReceipt(this.props.id, params);
  }

  downloadAllAttachments = () => {
    const receipts = _try(() => this.props.paymentStatuses[this.props.id].sent.receipts);
    if (!receipts || !receipts.length) return;

    const actions = receipts.map((receipt) => { return this.props.downloadAttachment(receipt); });
    Promise.all(actions)
      .then(() => {
        // handle success
      })
      .catch(() => {
        // handle error
      });
  }

  render() {
    if (!this.props.paymentStatusesStatus.fetched) return null;
    const paymentStatus = this.props.paymentStatuses[this.props.id];
    const existingReceipts = (paymentStatus.sent && paymentStatus.sent.receipts) || [];
    const canAdministrateGlobalVendors = _try(() => this.props.user.privileges.data.item.rootLevel.administrateGlobalVendors);
    const disableButtons = this.props.paymentStatusesStatus.updating;

    return (
      <div className="modal-dialog modal-lg components_modals_managereceipt" role="document">
        <div className="modal-content h-100 w-100">
          <div className="modal-header">
            <h4 className="modal-title" id="exampleModalLabel">
              Manage Receipts
            </h4>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body" style={{ overflowX: 'scroll', overflowY: 'scroll' }}>
            {existingReceipts.length > 1 &&
              <div className="row mb-3">
                <div className="col-12">
                  <button className="btn btn-primary" onClick={() => { this.downloadAllAttachments(); }}><div className="mdi mdi-download">&nbsp;Download All</div></button>
                </div>
              </div>
            }
            <Components.overviews.receipts
              attachments={existingReceipts}
              handleDownload={this.props.downloadAttachment}
              removeReceipt={this.removeReceipt}
              canAdministrateGlobalVendors={canAdministrateGlobalVendors}
              removing={this.props.paymentStatusesStatus.updating}
              columnClass="col-md-6 mt-2"
            />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
              onClick={() => { this.props.close(); }}
              disabled={disableButtons}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_managereceipt);


