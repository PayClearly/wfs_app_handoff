import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    policies: Selectors.entity('expenses_idOrganization_idAccount')(state),
    forms: state.forms,
    status: state.account.expenses.status,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    create: (data) => {
      dispatch(Store.account.createExpense(data));
    },
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
    blurForm: (name, key, fields) => {
      dispatch(Store.forms.blur(name, key, fields));
    },
    clearStatusErrors: () => {
      dispatch(Store.account.clearErrorsExpenses());
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_creators_expense extends Component {

  constructor(props) {
    super(props);
    this.state = {
      formName: 'Components.forms.expense',
      formId: props.formKey,
    };
  }

  componentDidMount() { }
  componentWillUnmount() { }

  onCreate = () => {
    this.props.resetForm(this.state.formName, this.state.formId, Object.keys(this.props.forms[this.state.formName][this.state.formId]._values).reduce((acc, cur) => { acc[cur] = undefined; return acc; }, {}));
    // for modal only
    if (this.props.close && typeof this.props.close === 'function') this.props.close();
  }

  onDisabledClick = () => {
    this.props.blurForm(this.state.formName, this.state.formId, this.props.forms[this.state.formName][this.state.formId]._values);
  }

  render() {
    const { status, modal } = this.props;
    const error = status.creatingError;
    const { canCreate } = this.props.policies;
    if (!canCreate) return <Components.invalidpermissions />;

    const form = _try(() => this.props.forms[this.state.formName][this.state.formId], {});

    return (
      <Components.creators.creatorwrapper
        className="components_creators_expense"
        canCreate={canCreate}
        createFormActive
        status={status}
        includeButton={!modal}
        onCreateNotification="Expense successfully created!"
        createDisabled={!form._allValid || form._allInitial || status.creating}
        clearStatusErrors={this.props.clearStatusErrors}

        onCreate={this.onCreate}
        onDisabledClick={this.onDisabledClick}
      >
        <Fragment>
          <Components.forms.expense
            formKey={this.state.formId}
            blurAll={this.props.blurAll}
          />
          {error &&
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Something Went Wrong</h4>
              Error: {error}
            </div>
          }
        </Fragment>
      </Components.creators.creatorwrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_creators_expense);


