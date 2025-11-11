import { connect, Component } from 'component';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  procedures: state.global.procedures.data.items,
});

const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_overviews_globalVendorProcedureCheck extends Component {
  render() {
    const { procedureId, procedures } = this.props;
    const procedure = _try(() => procedures[procedureId]) || {};
    const notSetTag = (<i>Not set</i>);
    const notes = procedure.notes || notSetTag;
    const active = !!procedure.active;
    const checkPaymentAddress = procedure.checkPaymentAddress || notSetTag;
    const checkPayeeName = procedure.checkPayeeName || 'Uses Global Vendor Name';
    const checkUserMustSend = procedure.checkUserMustSend ? 'True' : 'False';

    return (
      <div className="components_overviews_globalVendorProcedureCheck">
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
            <strong>Check Payee Name</strong>
            <br />
            <p className="text-muted">{checkPayeeName}</p>
          </div>
          <div className="col-md-4 col-6">
            <strong>User Must Send Check</strong>
            <br />
            <p className="text-muted">{checkUserMustSend}</p>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <h3>Address</h3>
            {procedure.checkPaymentAddress
              && <Components.addressoverview address={checkPaymentAddress} />}
            {!procedure.checkPaymentAddress && (
              <>
                <br />
                <p className="text-muted">{checkPaymentAddress}</p>
              </>
            )}
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <strong>Notes</strong>
            <br />
            <p className="text-muted">{notes}</p>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_globalVendorProcedureCheck);
