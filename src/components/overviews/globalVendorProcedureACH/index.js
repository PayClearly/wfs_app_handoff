import { connect, Component } from 'component';

import numeral from 'numeral';

import Utils from 'utils';
import './index.scss';

const mapStateToProps = (state) => ({
  procedures: state.global.procedures.data.items,
});

const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_overviews_globalVendorProcedureACH extends Component {
  render() {
    const { procedureId, procedures } = this.props;
    const procedure = procedures[procedureId] || {};
    const notSetTag = (<i>Not set</i>);

    const active = !!procedure.active;
    const achFirstName = procedure.achFirstName || notSetTag;
    const achLastName = procedure.achLastName || notSetTag;
    const achEmail = procedure.achEmail || notSetTag;
    const achRoutingNumber = procedure.achRoutingNumber || notSetTag;
    const achAccountNumber = '••••••••••';
    const achNotes = procedure.achNotes || notSetTag;
    const achDeliverySpeed = procedure.achDeliverySpeed || 'Next Day';
    const achDeliveryMethod = getAchDeliveryMethod(procedure.achDeliveryMethod);
    const achMaxTransactionAmount = procedure.achMaxTransactionAmount
      ? numeral(procedure.achMaxTransactionAmount).format('$0,0.00')
      : notSetTag;

    return (
      <div className="components_overviews_globalVendorProcedureACH">
        <div className="row">
          <div className="col-md-3 col-6">
            <strong>First Name</strong>
            <br />
            <p className="text-muted">{achFirstName}</p>
          </div>
          <div className="col-md-3 col-6">
            <strong>Last Name</strong>
            <br />
            <p className="text-muted">{achLastName}</p>
          </div>
          <div className="col-md-4 col-6">
            <strong>Email</strong>
            <br />
            <p className="text-muted">{achEmail}</p>
          </div>
          <div className="col-md-2 col-6">
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
        </div>
        <div className="row">
          <div className="col-3">
            <strong>Routing Number</strong>
            <br />
            <p className="text-muted">{achRoutingNumber}</p>
          </div>
          <div className="col-3">
            <strong>Account Number</strong>
            <br />
            <p className="text-muted">{achAccountNumber}</p>
          </div>
          <div className="col-3">
            <strong>Delivery Speed</strong>
            <br />
            <p className="text-muted">{achDeliverySpeed}</p>
          </div>
          <div className="col-3">
            <strong>Delivery Method</strong>
            <br />
            <p className="text-muted">{achDeliveryMethod}</p>
          </div>
        </div>
        {procedure.achDeliveryMethod === 'pullAch' && (
          <div className="row">
            <div className="col-md-4 col-6">
              <strong>Max Per-Transaction Amount</strong>
              <br />
              <p className="text-muted">{achMaxTransactionAmount}</p>
            </div>
          </div>
        )}
        <div className="row">
          <div className="col-12">
            <strong>Notes</strong>
            <br />
            <p className="text-muted">{achNotes}</p>
          </div>
        </div>
        <h3>Notification Settings</h3>
        <div className="row">
          <div className="col-md-6 col-12">
            <strong>Notify on Payment Creation</strong>
            <br />
            <p className="text-muted">
              {_try(() => Utils.capitalize(procedure.achNotifyOnCreation.toString())) || notSetTag}
            </p>
          </div>
          <div className="col-md-6 col-12">
            <strong>On Creation Delivery Emails</strong>
            <br />
            <p className="text-muted">{_try(() => procedure.achNotifyOnCreationEmails.join(', ')) || notSetTag}</p>
          </div>
          <div className="col-md-6 col-12">
            <strong>Notify on Payment Completion</strong>
            <br />
            <p className="text-muted">
              {_try(() => Utils.capitalize(procedure.achNotifyOnCompletion.toString())) || notSetTag}
            </p>
          </div>
          <div className="col-md-6 col-12">
            <strong>On Completion Delivery Emails</strong>
            <br />
            <p className="text-muted">{_try(() => procedure.achNotifyOnCompletionEmails.join(', ')) || notSetTag}</p>
          </div>
        </div>
      </div>
    );
  }
}

function getAchDeliveryMethod(achDeliveryMethod) {
  const ACH_METHOD_OPTIONS = {
    pushAch: 'Push ACH',
    pullAch: 'Pull ACH (echeck)',
  };

  // assume the default is push ACH
  return ACH_METHOD_OPTIONS[achDeliveryMethod] || ACH_METHOD_OPTIONS.pushAch;
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_globalVendorProcedureACH);
