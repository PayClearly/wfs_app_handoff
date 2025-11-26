import { connect, Component, bindActionCreators, Fragment } from 'component';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

const mapStateToProps = (state, props) => {
  return ({
    expensesStatus: state.account.expenses.status,
    forms: state.forms,
    expensePolicies: Selectors.entity('expenses_idOrganization_idAccount')(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    createExpense: (data) => {
      dispatch(Store.account.createExpense(data));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_modals_createExpense extends Component {
  state = {
    formKey: 'create',
    blurAll: false,
  };

  onSubmit = () => {
    const form = _try(() => this.props.forms['Components.forms.expense'][this.state.formKey], {});
    return this.props.createExpense({
      ...form._values,
      source: 'manual',
    });
  }

  render() {
    const { expensesStatus, forms, expensePolicies } = this.props;
    const form = _try(() => forms['Components.forms.expense'][this.state.formKey]);
    const disabled = _try(() => expensesStatus.updating || form._allInitial || !form._allValid);

    return (
      <div className="modal-dialog wide-modal wide-70">
        <div className="modal-content components_modals_createExpense">
          <div className="modal-header">
            <h3 className="modal-title" id="exampleModalLabel">New Expense - External Transaction</h3>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <Components.creators.expense
              formKey={this.state.formKey}
              blurAll={this.state.blurAll}
              modal
              close={() => { setTimeout(this.props.close, 500); }}
            />
          </div>
          <div className="modal-footer">
            <button
              onClick={this.props.close}
              className="btn btn-secondary"
              type="button"
              aria-label="close button"
              disabled={false}
            >Cancel</button>
            {expensePolicies.canCreate &&
              <Components.button
                buttonText="Create"
                onClick={this.onSubmit}
                onDisabledClick={() => { this.setState({ blurAll: true }); }}
                className="btn btn-primary"
                ariaLabel="create expense"
                updating={_try(() => this.props.expensesStatus.creating)}
                disabled={disabled}
              />
            }
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_modals_createExpense);

