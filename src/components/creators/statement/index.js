import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    access: state.user.access,
    statementCreatePolicy: state.user.policies.data.item['statements_*_*_create'],
    revenueShares: state.revenueShares || {},
    statements: state.statements || {},
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    createStatement: (organizationId, accountId, revenueShareId, data) => {
      return dispatch(Store.statements.create(organizationId, accountId, revenueShareId, data));
    },
    resetForm: (name, key, values) => {
      dispatch(Store.forms.reset(name, key, values));
    },
    clearStatusErrors: () => {
      dispatch(Store.statements.clearErrors());
    },
    destroyForm: (name, key) => {
      dispatch(Store.forms.destroy(name, key));
    },
    syncStatements: (organizationId, accountId, jobIds) => {
      dispatch(Store.statements.sync(organizationId, accountId, jobIds));
    },
    syncJobs: (organizationId, accountId, jobIds) => {
      dispatch(Store.jobs.sync('statements', organizationId, accountId, jobIds));
    },
  });
};

class components_creators_statement extends Component {

  state = {
    createFormActive: true,
    showStatementCreatedNotification: false,
  };




  onCreate = () => {
    this.props.resetForm('Components.forms.createstatement', this.props.revenueShare._id, this.props.forms['Components.forms.createstatement'][this.props.revenueShare._id]._values);
    this.setState({ showStatementCreatedNotification: true });
  };

  onDisabledClick = () => {
    this.setState({ blurAll: true });
  };

  submit = (organizationId, accountId, revenueShareId) => {
    this.setState({ showStatementCreatedNotification: false });
    const form = this.props.forms['Components.forms.createstatement'][this.props.revenueShare._id];
    const { month, year, fileType } = form._values;

    const data = { month, year, fileType };

    return this.props.createStatement(organizationId, accountId, revenueShareId, data)
      .then((newStatementId) => {
        this.props.syncJobs(organizationId, accountId, [newStatementId]);
        this.props.syncStatements(organizationId, accountId, [newStatementId]);
      });
  };

  render() {
    return (
      <Components.creators.creatorwrapper
        canCreate={this.props.statementCreatePolicy}
        createFormActive={this.state.createFormActive}
        status={this.props.statements.status}
        onCreate={this.onCreate}
        clearStatusErrors={this.props.clearStatusErrors}
      >
        <Components.forms.createstatement
          submit={() => {
            const { organizationId, accountId } = this.props;
            return this.submit(organizationId, accountId, this.props.revenueShare._id);
          }}
          showCreatedNotification={this.state.showStatementCreatedNotification}
          blurAll={this.state.blurAll}
          onDisabledClick={this.onDisabledClick}
          revenueShareId={this.props.revenueShare._id}
        />
      </Components.creators.creatorwrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_creators_statement);


