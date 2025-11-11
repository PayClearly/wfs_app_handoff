import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    userId: _try(() => state.user.profile.data.item._id, ''),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_containers_completedExpenseReports extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    return (
      <div className="components_containers_completedExpenseReports">
        <Components.tables.expenseReports
          tableKey="completed"
          initialTableStateOverride={{
            filters: {
              createdBy: { key: 'createdBy', type: 'string', comparator: 'excludes', value: this.props.userId },
              completedReport: { key: 'completedReport', type: 'bool', comparator: 'is', value: true },
            },
            sort: {
              sortKey: '_ref',
              orderIn: 'desc',
            },
          }}
          filterConfigKeys={['name', 'dateAfter', 'dateBefore', 'recordTotal']}
          typeForNoDataTextOverride="Completed Expense Reports"
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_containers_completedExpenseReports);


