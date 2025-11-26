import { connect, Component, bindActionCreators, Fragment } from 'component';

import Components from 'components';

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

class components_containers_pendingExpenseReports extends Component {

  render() {
    return (
      <div className="components_containers_pendingExpenseReports">
        <Components.tables.expenseReports
          tableKey="approvals"
          initialTableStateOverride={{
            filters: {
              createdBy: { key: 'createdBy', type: 'string', comparator: 'excludes', value: this.props.userId },
              status: { key: 'status', type: 'option', comparator: 'is', value: 'submitted' },
            },
            sort: {
              sortKey: '_ref',
              orderIn: 'desc',
            },
          }}
          filterConfigKeys={['name', 'dateAfter', 'dateBefore', 'recordTotal']}
          typeForNoDataTextOverride="Pending Expense Reports"
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_containers_pendingExpenseReports);

