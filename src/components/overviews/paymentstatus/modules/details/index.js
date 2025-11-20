import {
  connect, Component, Fragment,
} from 'component';

// Third Party Imports ...
import numeral from 'numeral';

import Utils from 'utils';
import Components from 'components';
import TransactionAmountsBreakdown from '../../components/TransactionAmountsBreakdown';


const mapStateToProps = (state) => ({
  paymentPipelinePreferences: state.account.paymentPipelinePreferences.data.item,
  users: state.users.data.items,
});

const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_overviews_paymentstatus_modules_details extends Component {





  render() {
    const { paymentStatus } = this.props;
    const { created: createdData, _createdBy, createdByApi } = paymentStatus;
    const createdByUser = this.props.users[_createdBy];

    return (
      <div className="components_overviews_paymentstatus_modules_details">
        <h2 className="m-0 py-3 d-inline-block">Details</h2>
        <div>
          <div className="row pb-3 align-items-start">
            <div className="col-12 col-md mb-3">
              <strong>Created By</strong>
              <br />
              {createdByUser && (
                <Fragment>
                  <Components.avatar user={createdByUser} />
                  <span className="text-muted ms-1">
                    {_try(() => createdByUser.firstName)} {_try(() => createdByUser.lastName)}
                  </span>
                </Fragment>
              )}
              {createdByApi
                && <span className="text-muted ms-1">API Key</span>}
              {!createdByUser
                && !createdByApi
                && <p className="text-muted">Admin User</p>}
            </div>
            {_try(() => createdData.payAt) && (
              <div className="col-12 col-md mb-3">
                <strong>Scheduled For</strong>
                <br />
                <span className="text-muted ms-1">{Utils.dates.dateToDay(createdData.payAt)}</span>
              </div>
            )}
            {_try(() => createdData.customFields) && Object.keys(createdData.customFields).map((field) => (
              (createdData.customFields[field].length || field === 'Check Number')
                ? (
                  <div className="col-12 col-md mb-3">
                    <strong>{field}</strong>
                    <br />
                    <p className="text-muted">{createdData.customFields[field]}</p>
                  </div>
                )
                : null
            ))}
            {
              (this.props.paymentPipelinePreferences || {}).requireConfirmationNumber && (
                <div className="col-12 col-md mb-3">
                  <Components.entities.vendorRemittanceFields id={paymentStatus._id} heightOverride="auto" />
                </div>
              )
            }
            {_try(() => createdData.paymentFields) && Object.keys(createdData.paymentFields).map((field) => (
              createdData.paymentFields[field].length && typeof createdData.paymentFields[field] === 'string'
                ? (
                  <div className="col-12 col-md mb-3">
                    <strong>{field}</strong>
                    <br />
                    <p className="text-muted">{createdData.paymentFields[field]}</p>
                  </div>
                )
                : null
            ))}
            {_try(() => createdData.fee) && (
              <div className="col-12 col-md mb-3">
                <strong>Amount Breakdown</strong>
                <br />
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <span>Net Amount:&nbsp;&nbsp;</span>
                    </div>
                    <div>
                      <strong>{numeral(createdData.amount).subtract(createdData.fee).format('$0,0.00')}</strong>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <span>Service Fee:&nbsp;&nbsp;</span>
                    </div>
                    <div>
                      <strong>+&nbsp;{numeral(createdData.fee).format('$0,0.00')}</strong>
                    </div>
                  </div>
                  <hr className="my-1" />
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <span>Total Amount:&nbsp;&nbsp;</span>
                    </div>
                    <div>
                      <strong>{numeral(createdData.amount).format('$0,0.00')}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {paymentStatus.funded?.pullAchAccountId && (
              <div className="col-12 col-md mb-3">
                <strong>ACH Payment PRN</strong>
                <br />
                <p className="text-muted">{paymentStatus.funded.pullAchAccountId}</p>
              </div>
            )}

            {paymentStatus?.created?.transactionAmounts?.length > 1 && (
              <div className="col-12">
                <TransactionAmountsBreakdown paymentStatus={paymentStatus} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_paymentstatus_modules_details);


