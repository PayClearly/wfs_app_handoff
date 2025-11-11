import { connect, Component, bindActionCreators, Fragment } from 'component';

import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    status: state.account.accountVendorEnrollments.status,
    orgId: state.organization.data.id,
    accountId: state.account.data.id,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_containers_accountVendorEnrollments extends Component {
  state = {
    exporting: false,
  }



  render() {
    const { status } = this.props;
    if (!status.fetched) return <Components.spinner />;
    return (
      <div className="components_containers_accountVendorEnrollments">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="card-title mb-3">Vendor Enrollments</h2>
        </div>
        <Components.tables.accountVendorEnrollments />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_containers_accountVendorEnrollments);


