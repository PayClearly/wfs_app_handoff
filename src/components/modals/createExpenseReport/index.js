import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    expenseReportsStatus: state.account.expenseReports.status,
    forms: state.forms,
    expenseReportPolicies: Selectors.entity('expenseReports_idOrganization_idAccount')(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    createExpenseReport: (data) => {
      dispatch(Store.account.createExpenseReport(data));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_modals_createExpenseReport extends Component {
  state = {
    formKey: 'create',
    blurAll: false,
    submitReport: false,
  };

  componentDidMount() { }
  componentWillUnmount() { }

  onSubmit = () => {
    const form = _try(() => this.props.forms['Components.forms.expenseReport'][this.state.formKey], {});
    const data = { ...form._values };
    if (this.state.submitReport) data.submitted = true;
    return this.props.createExpenseReport(data);
  }

  render() {
    const { expenseReportsStatus, forms, expenseReportPolicies } = this.props;
    const form = _try(() => forms['Components.forms.expenseReport'][this.state.formKey]);
    const disabled = _try(() => expenseReportsStatus.updating || !form._allValid);
    const expenseIds = _try(() => form.expenseIds);
    let submitDisabled = true;
    if (expenseIds) {
      if (Object.keys(expenseIds.value).length !== 0) {
        submitDisabled = false;
      }
    }

    return (
      <div className="modal-dialog wide-modal wide-80">
        <div className="modal-content components_modals_createExpenseReport">
          <div className="modal-header">
            <h3 className="modal-title" id="exampleModalLabel">New Report</h3>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <Components.creators.expenseReport
              formKey={this.state.formKey}
              blurAll={this.state.blurAll}
              modal
              close={() => { setTimeout(this.props.close, 500); }}
            />
          </div>
          <div className="modal-footer">
            {!submitDisabled &&
              <div className="checkbox checkbox-primary me-3">
                <input
                  id="submitReport"
                  type="checkbox"
                  className="form-check-input"
                  onClick={() => {
                    this.setState(prevState => ({
                      submitReport: !prevState.submitReport,
                    }));
                  }}
                  checked={this.state.submitReport}
                />
                <label className="form-check-label" aria-label="Immediately submit this report" htmlFor="submitReport">Immediately submit this report</label>
              </div>
            }
            <button
              onClick={this.props.close}
              className="btn btn-secondary"
              type="button"
              aria-label="close button"
              disabled={false}
            >Cancel</button>
            {expenseReportPolicies.canCreate &&
              <Components.button
                buttonText="Create"
                onClick={this.onSubmit}
                onDisabledClick={() => { this.setState({ blurAll: true }); }}
                className="btn btn-primary"
                ariaLabel="create expense report"
                updating={_try(() => this.props.expenseReportsStatus.creating)}
                disabled={disabled}
              />
            }
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_modals_createExpenseReport);


