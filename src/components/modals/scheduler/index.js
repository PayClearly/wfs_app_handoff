import { connect, Component, bindActionCreators, Fragment } from 'component';
import { Collapse } from 'react-collapse';

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    status: _try(() => state.account.paymentStatuses.status, {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    updatePayAt: (ids, payAt) => dispatch(Store.account.updatePaymentPipelines(ids, 'updatePayAt', { payAt })),
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_modals_scheduler extends Component {

  componentDidMount() {}
  componentDidUpdate(prevProps) {
    const { payAt, ids } = this.props;
    const forUpdate = payAt && ids;

    if (forUpdate && prevProps.status.updating && this.props.status.updated) this.props.close();
    if (prevProps.status.creating && !this.props.status.creating) this.props.close();
  } 
  componentWillUnmount() {}

  render() {
    const { payAt, ids } = this.props;
    const forUpdate = payAt && ids;
    const { creating, updating, updatingError } = this.props.status;
    const allInitial = _try(() => this.props.forms['Components.forms.scheduler'].default._allInitial);

    return (
      <div className="components_modals_scheduler modal-dialog" role="document">
        <div className="modal-content components_modals_areyousure">
          <div className="modal-header">
            <h3 className="modal-title" id="exampleModalLabel">{forUpdate ? 'Edit Scheduled Payments' : 'Schedule Payments'}</h3>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <p className="modal-subtitle text-muted">Select a payment submission date to define the day payments are submitted and disbursed. Scheduled payments will be viewable in payment history with the status “Scheduled”, but payments will not be sent until the selected date.</p>
            <h5 className="modal-subtitle">{_getTimezone()}</h5>
            <div className="row">
              <div className="col-md mb-4" >
                <Components.forms.scheduler 
                  initialData={forUpdate && {
                    time: new Date(payAt),
                  }}
                  disabled={forUpdate ? this.props.updating : creating}
                />
              </div>
            </div>
            <Collapse isOpened={updatingError}>
              <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Something Went Wrong</h4>
                Error: {updatingError}
              </div>
            </Collapse>
          </div>
          <div className="modal-footer">
            <button
              onClick={this.props.close}
              className="btn btn-secondary"
              type="button"
              aria-label="cancel button"
            >Cancel</button>
            <Components.button 
              onClick={() => {
                if (forUpdate) return this.props.updatePayAt(ids, _try(() => this.props.forms['Components.forms.scheduler'].default._values.time.getTime()));
                return this.props.onSubmit();
              }}
              disabled={creating || updating || (forUpdate && allInitial)}
              updating={creating || updating}
              buttonText={forUpdate ? 'Update' : 'Submit'}
              className={'btn btn-primary'}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_modals_scheduler);

// Internal Helper Functions ... 
const _getTimezone = () => {
  const today = new Date();
  const regExp = /\(([^)]+)\)/;
  const matches = regExp.exec(today.toString());
  return _try(() => matches[1], '');
}
