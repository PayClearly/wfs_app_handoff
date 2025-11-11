import { connect, Component } from 'component';

import numeral from 'numeral';

import Utils from 'utils';
import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  procedures: state.global.procedures.data.items,
});

const mapDispatchToProps = (dispatch) => ({
  downloadAttachment: (attachmentMetadata) => dispatch(Store.global.downloadAttachment(attachmentMetadata)),
});

class components_overviews_globalVendorProcedureVCard extends Component {
  render() {
    const { procedureId, procedures } = this.props;
    const procedure = procedures?.[procedureId] || {};
    const notSetTag = (<i>Not set</i>);
    const notes = procedure.notes || notSetTag;
    const vCardMaxPerCardAmount = procedure.vCardMaxPerCardAmount
      ? numeral(procedure.vCardMaxPerCardAmount).format('$0,0.00')
      : notSetTag;
    const vCardRequireUniqueAmounts = procedure.vCardRequireUniqueAmounts || false;
    const vCardDeliveryMethod = procedure.vCardDeliveryMethod || notSetTag;
    const vCardEmails = procedure?.vCardEmails?.length ? procedure.vCardEmails.join(', ') : notSetTag;
    const vCardCCEmails = procedure?.vCardCCEmails?.length ? procedure.vCardCCEmails.join(', ') : notSetTag;
    const vCardFaxNumbers = procedure?.vCardFaxNumbers?.length
      ? procedure.vCardFaxNumbers.join(', ')
      : notSetTag;
    const vCardUseFaxTemplate = procedure.vCardUseFaxTemplate ? 'True' : 'False';
    const vCardUseEmailTemplate = procedure.vCardUseEmailTemplate ? 'True' : 'False';
    const active = !!procedure.active;
    const { vCardPaymentForm } = procedure;
    const vCardHideCCBINNumber = procedure.vCardHideCCBINNumber ? 'True' : 'False';
    const vCardBin = procedure.bin || notSetTag;

    return (
      <div className="components_overviews_globalVendorProcedureVCard">
        <div className="row">
          <div className="col-md-4 col-6">
            <strong>Active</strong>
            <br />
            <p className="text-muted">
              {
                active
                  ? <span className="badge rounded-pill bg-primary">Active</span>
                  : <span className="badge rounded-pill bg-secondary">Inactive</span>
              }
            </p>
          </div>
          <div className="col-md-4 col-6">
            <strong>Delivery Method</strong>
            <br />
            <p className="text-muted">{vCardDeliveryMethod}</p>
          </div>
          {vCardDeliveryMethod === 'email'
            && (
              <>
                <div className="col-md-4 col-6">
                  <strong>Emails</strong>
                  <br />
                  <p className="text-muted">{vCardEmails}</p>
                </div>
                <div className="col-md-4 col-6">
                  <strong>CC Emails</strong>
                  <br />
                  <p className="text-muted">{vCardCCEmails}</p>
                </div>
                <div className="col-md-4 col-6">
                  <strong>Use Email Template</strong>
                  <br />
                  <p className="text-muted">{vCardUseEmailTemplate}</p>
                </div>
                <div className="col-md-4 col-6">
                  <strong>Hide Credit Card BIN</strong>
                  <br />
                  <p className="text-muted">{vCardHideCCBINNumber}</p>
                </div>
              </>
            )}
          {vCardDeliveryMethod === 'fax'
            && (
              <>
                <div className="col-md-4 col-6">
                  <strong>Fax Numbers</strong>
                  <br />
                  <p className="text-muted">{vCardFaxNumbers}</p>
                </div>
                <div className="col-md-4 col-6">
                  <strong>Use Fax Template</strong>
                  <br />
                  <p className="text-muted">{vCardUseFaxTemplate}</p>
                </div>
              </>
            )}
          {vCardPaymentForm
            && (
              <div className="col-12">
                <Components.attachments
                  attachments={[vCardPaymentForm]}
                  cardHeader="Payment Form"
                  handleDownload={this.props.downloadAttachment}
                />
              </div>
            )}
          <div className="col-md-4 col-6">
            <strong>Bin Override</strong>
            <br />
            <p className="text-muted">{vCardBin}</p>
          </div>
          <div className="col-md-4 col-6">
            <strong>Max Per-Card Amount</strong>
            <br />
            <p className="text-muted">{vCardMaxPerCardAmount}</p>
          </div>
          <div className="col-md-4 col-6">
            <strong>Require Unique Amounts If Payment Split Between Multiple Cards</strong>
            <br />
            <p className="text-muted">{vCardRequireUniqueAmounts ? 'Yes' : 'No'}</p>
          </div>
          <div className="col-6">
            <strong>Notes</strong>
            <br />
            <p className="text-muted">{notes}</p>
          </div>
        </div>
        <h3>Notification Settings</h3>
        <div className="row">
          <div className="col-md-6 col-12">
            <strong>Notify on Payment Creation</strong>
            <br />
            <p className="text-muted">
              {_try(() => Utils.capitalize(procedure.vCardNotifyOnCreation.toString())) || notSetTag}
            </p>
          </div>
          <div className="col-md-6 col-12">
            <strong>On Creation Delivery Emails</strong>
            <br />
            <p className="text-muted">{_try(() => procedure.vCardNotifyOnCreationEmails.join(', ')) || notSetTag}</p>
          </div>
          <div className="col-md-6 col-12">
            <strong>Notify on Payment Completion</strong>
            <br />
            <p className="text-muted">
              {_try(() => Utils.capitalize(procedure.vCardNotifyOnCompletion.toString())) || notSetTag}
            </p>
          </div>
          <div className="col-md-6 col-12">
            <strong>On Completion Delivery Emails</strong>
            <br />
            <p className="text-muted">{_try(() => procedure.vCardNotifyOnCompletionEmails.join(', ')) || notSetTag}</p>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_globalVendorProcedureVCard);
