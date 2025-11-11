import { connect, Component } from 'component';

import Components from 'components';
import './index.scss';

const mapStateToProps = () => ({});
const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_accountdetails extends Component {
  render() {
    const { account, className } = this.props;
    const {
      name, active, suspended, externalId,
    } = account;
    const notSetTag = (<i>Not set</i>);
    const contactName = account.contactName || notSetTag;
    const contactEmail = account.contactEmail || notSetTag;
    const contactPhone = account.contactPhoneNumber || notSetTag;

    return (
      <div className={className}>
        <div className="col-md-3 col-xs-6">
          <strong>Account Name</strong>
          <br />
          <p className="text-muted">
            <span className="pe-2">{name}</span><br />
            {
              active
                ? <span className="badge rounded-pill bg-primary">Active</span>
                : <span className="badge rounded-pill bg-secondary">Inactive</span>
            }
            {
              suspended && <span className="badge rounded-pill bg-danger ms-1">Suspended</span>
            }
          </p>
        </div>
        <div className="col-md-3 col-xs-6">
          <strong>Contact Name</strong>
          <br />
          <p className="text-muted">{contactName}</p>
        </div>
        <div className="col-md-3 col-xs-6">
          <strong>Contact Phone</strong>
          <br />
          <p className="text-muted">{contactPhone}</p>
        </div>
        <div className="col-md-3 col-xs-6">
          <strong>Contact Email</strong>
          <br />
          <p className="text-muted">{contactEmail}</p>
        </div>

        {
          externalId && (
            <div className="col-md-3 col-xs-6">
              <strong>External Identifier</strong>
              <br />
              <p className="text-muted">{externalId}</p>
            </div>
          )
        }

        <div className="col-md-12 mt-2">
          <h3>Address</h3>
          <Components.addressoverview address={account.address} />
        </div>
        {(
          (this.props.orgId === 'org-for-testing-policies'
            || this.props.orgId === '57245f0a-7f86-4b55-9350-4a27a385f189')
          || _try(() => window.GLOBALCERT.projectId.includes('STAGING-ENV_CHANGE-ME'))
        )
          && (
            <div className="col-md-12 mt-2">
              <h3>Options</h3>
              <div className="row">
                <div className="col-6">
                  <strong>Sample Data For Dashboard</strong>
                  <br />
                  <p className="text-muted">{_try(() => account._options._useSampleDashboard) ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          )}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_accountdetails);


