import { connect, Component, bindActionCreators, Fragment } from 'component';
import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    accountVendorEnrollments: Selectors.accountVendorEnrollments(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({
    accountVendorEnrollmentNote: Resources.accountVendorEnrollmentNote(state, { id: props.id }),
  });
};

class components_overviews_accountVendorEnrollment extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    const { accountVendorEnrollments = {}, id } = this.props;
    const accountVendorEnrollment = accountVendorEnrollments[id];

    const notSetTag = (<i>Not set</i>);

    const status = (accountVendorEnrollment.status && <Components.badges.accountVendorEnrollmentStatus status={accountVendorEnrollment.status} />) || notSetTag;
    const spendProjection = accountVendorEnrollment.spendProjection !== undefined ? Utils.numeral()(accountVendorEnrollment.spendProjection).format('$0,0.00') : notSetTag;
    const assignedTo = accountVendorEnrollment.assignedTo ?
      <Components.badges.createdby user={accountVendorEnrollment.assignedTo} />
      :
      notSetTag;
    const notes = _resolve(this.props, 'accountVendorEnrollmentNote.notes') || notSetTag;

    return (
      <div className="components_overviews_accountVendorEnrollment">
        <h2>{accountVendorEnrollment.vendorDisplay}</h2>
        <h3>Enrollment Details</h3>
        <div className="row mt-3">
          <div className="col-md-4 col-6">
            <strong>Status</strong>
            <br />
            <p className="text-muted">
              {status}
            </p>
          </div>
          <div className="col-md-4 col-6">
            <strong>Spend Projection</strong>
            <br />
            <p className="text-muted">
              {spendProjection}
            </p>
          </div>
          <div className="col-md-4 col-6">
            <strong>Assigned To</strong>
            <br />
            <p className="text-muted">
              {assignedTo}
            </p>
          </div>
          <div className="col-12">
            <strong>Notes</strong>
            <br />
            <p className="text-muted" style={{ whiteSpace: 'pre-line' }}>
              {notes}
            </p>
          </div>
        </div>
        <Components.overviews.accountVendorEnrollmentVendorDetails id={id} />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_overviews_accountVendorEnrollment);


