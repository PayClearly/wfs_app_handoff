import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => {
  return ({
    statements: Selectors.approvedStatements(state),
    fetched: state.statements.status.fetched,
    organizationId: state.organization.data.id,
    accountId: state.account.data.id,
  });
};

const mapDispatchToProps = (dispatch) => {
  return ({});
};

class components_cards_completedrevenueshares extends Component {
  state = {
    searchText: '',
  }

  render() {
    const { organizationId, accountId, statements, fetched } = this.props;
    if (!fetched) return <Components.spinner />;

    return (
      <div className="components_cards_completedrevenueshares">
        <div className="row">
          <div className="col-md-4 mb-2 mt-2 mt-md-1 mb-md-4">
            <h6>Search</h6>
            <input type="text" className="form-control small" onChange={this.handleSearch} value={this.state.searchText} placeholder="Name or Description" />
          </div>
          <div className="col-md-2 mb-2 mt-2 mt-md-1 mb-md-4">
            <h6>Rows to Display</h6>
            <select className="form-control small" onChange={this.handleRowsToDisplayChange}>
              <option value={10}>10</option>
              <option value={25} selected >25</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        <Components.tables.statements
          organizationId={organizationId}
          accountId={accountId}
          statements={statements}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_cards_completedrevenueshares);


