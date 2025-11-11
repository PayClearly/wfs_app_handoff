import { connect, Component } from 'component';
import numeral from 'numeral';

import './index.scss';

const mapStateToProps = (state) => ({
  schemas: state.global.schemas.data.items,
  credentialSchemas: state.global.credentialSchemas,
  groups: state.global.groups.data.items,
});

const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_overviews_globalVendorGroupPSOP extends Component {





  render() {
    const {
      groupId, method, groups, schemas, credentialSchemas,
    } = this.props;
    const PSOP = _try(() => groups[groupId][method]) || {};
    const notSetTag = (<i>Not set</i>);
    const credentialSchema = _try(
      () => credentialSchemas.data.items[credentialSchemas.collections._ids[PSOP.credentialSchema][0]].name
    ) || notSetTag;
    const paymentSchema = _try(() => schemas[PSOP.paymentSchema].name) || notSetTag;
    const accepts = !!PSOP.accepts;
    const fee = (PSOP.fee && `Type: ${PSOP.fee.type}`) || notSetTag;

    return (
      <div className="components_overviews_globalVendorGroupPSOP">
        <div className="row">
          <div className="col-md-4 col-6">
            <strong>Credential Schema</strong>
            <br />
            <p className="text-muted">{credentialSchema}</p>
          </div>
          <div className="col-md-4 col-6">
            <strong>Payment Schema</strong>
            <br />
            <p className="text-muted">{paymentSchema}</p>
          </div>
          <div className="col-md-4 col-6">
            <strong>Accepts</strong>
            <br />
            <p className="text-muted">
              {
                accepts
                  ? <span className="badge rounded-pill bg-primary">Accepts</span>
                  : <span className="badge rounded-pill bg-secondary">Doesn&lsquo;t Accept</span>
              }
            </p>
          </div>
          <div className="col-md-4">
            <strong>Fee</strong>
            <br />
            <p className="text-muted mb-1">{fee}</p>
            {PSOP.fee && (
              <p className="text-muted">
                Value: {PSOP.fee.type === 'fixed' ? numeral(PSOP.fee.value).format('$0,0.00') : `${PSOP.fee.value}%`}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_globalVendorGroupPSOP);
