import {
  connect, Component,
} from 'component';

const mapStateToProps = (state, props) => ({
  accountVendors: state.account.accountVendors.data.items,
  paymentPipelinePreferences: state.account.paymentPipelinePreferences.data.item,
  vendorId: props.paymentStatus.created && props.paymentStatus.created.vendorId,
});

const mapDispatchToProps = (dispatch, props) => ({});


class componentsOverviewsPaymentstatusModulesVendorPaymentNotes extends Component {
  render() {
    const showVendorPaymentNotes = this.props.paymentPipelinePreferences.paymentHistoryVendorPaymentNotes;
    const { vendorId } = this.props;
    const vendor = this.props.accountVendors[vendorId];
    const notes = vendor && vendor.notes;

    return (showVendorPaymentNotes && notes) ? (
      <div className="componentsOverviewsPaymentstatusModulesVendorPaymentNotes">
        <h2 className="m-0 py-3 d-inline-block">Payment Notes</h2>
        <div className="ps-4">
          <div className="row pb-3">
            <div className="m-0 py-3 d-inline-block">
              {notes}
            </div>
          </div>
        </div>
      </div>
    ) : null;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(componentsOverviewsPaymentstatusModulesVendorPaymentNotes);

