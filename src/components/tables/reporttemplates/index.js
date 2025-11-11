import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Utils from 'utils';
import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    reportTemplates: state.account.reportTemplates.data.items,
    organizationId: state.organization.data.id,
    accountId: state.account.data.id,
    users: state.users.data.items,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    runReport: (organizationId, accountId, reportTemplateId) => {
      dispatch(Store.account.reports.create(organizationId, accountId, reportTemplateId));
    },
    openAreYouSureModal: data => dispatch(Store.router.openModal('Components.modals.areyousure', data)),
    updateReportTemplate: (organizationId, accountId, reportTemplateId, payload) => {
      dispatch(Store.account.reporttemplates.update(organizationId, accountId, reportTemplateId, payload));
    },
  });
};

class components_tables_reporttemplates extends Component {

  state = {
    columns: [
      { label: 'Name', dataKey: 'filename', sort: true },
      { label: 'Description', dataKey: 'description', sort: true, cellRenderer: _formatDescription },
      { label: 'Report Type', dataKey: 'type', sort: true, cellRenderer: _formatString },
      { label: 'Schedule', dataKey: 'schedule', sort: true, cellRenderer: _formatString },
      { label: 'Created By', dataKey: 'user', sort: true, cellRenderer: user => <Components.badges.createdby user={user} /> },
      { label: 'Created Date', dataKey: '_createdAt', sort: true, cellRenderer: _formatDate },
      { label: 'Status', dataKey: 'status', sort: true, cellRenderer: _formatStatus },
    ],
    filterBy: 'status',
    filterValue: 'active',
    searchText: '',
    // searchDate structured this way to be consumed by the daypicker
    searchDate: { value: null },
    rowsToDisplay: 25,
  };

  componentDidMount() {}
  componentWillUnmount() {}

  getRowData = (organizationId, accountId, reportTemplate) => {
    const { users } = this.props;
    const user = users[reportTemplate._createdBy];

    const actionContent = [{
      title: 'Run',
      onClick: () => this.props.runReport(organizationId, accountId, reportTemplate._id),
      disabled: false,
    }, {
      title: 'Delete',
      onClick: this.templateUpdateHandler(organizationId, accountId, reportTemplate._id, 'deleted'),
      disabled: false,
    }];

    return {
      ...reportTemplate,
      user,
      actionContent,
    };
  };

  handleSearchText = e => this.setState({ searchText: e.target.value });
  handleSearchDate = (action, field, date) => {
    if (action !== 'change') return;
    this.setState({ searchDate: { value: date } });
  };

  handleRowsToDisplayChange = e => this.setState({ rowsToDisplay: e.target.value });

  templateUpdateHandler(organizationId, accountId, reportTemplateId, status) {
    return () => {
      this.props.openAreYouSureModal({
        title: 'Delete Template',
        content: `You are about to set the template status to ${status}`,
        noText: 'No',
        yesText: 'Yes',
        onYes: () => this.props.updateReportTemplate(organizationId, accountId, reportTemplateId, { status: 'suspended' }),
      });
    };
  }

  rowRenderer = (rowData) => {
    return (
      <Components.entities.reporttemplate template={rowData} />
    );
  }

  handleStatusFilterChange = (e) => {
    const filterValue = e.target.value === 'all' ? null : e.target.value;
    this.setState({ filterValue });
  }

  render() {
    const { columns, filterBy, filterValue, searchText, searchDate, rowsToDisplay } = this.state;
    const { reportTemplates, organizationId, accountId } = this.props;
    const data = Object.values(reportTemplates)
      .filter(reportTemplate => reportTemplate.status !== 'suspended')
      .map(reportTemplateId => this.getRowData(organizationId, accountId, reportTemplateId));
    const secondarySearchText = searchDate.value ? Utils.dates.dateToDay(searchDate.value, 'dayOnly') : null;

    return (
      <Fragment>
        <h3>Report Templates</h3>
        <div className="row">
          <div className="col-md-4 mb-2 mt-2 mt-md-1 mb-md-4">
            <h6>Search</h6>
            <input type="text" className="form-control small" onChange={this.handleSearchText} value={searchText} placeholder="Name or Description" />
          </div>
          <div className="col-md-2 mb-2 mt-2 mt-md-1 mb-md-4">
            <h6>Filter by Created Date</h6>
            <Components.forms.components.daypicker
              form={this.state}
              field="searchDate"
              action={this.handleSearchDate}
              dateRange={{ max: new Date() }}
            />
          </div>
          <div className="col-md-2 mb-2 mt-2 mt-md-1 mb-md-4">
            <h6>Filter by Status</h6>
            <select className="form-control small" onChange={this.handleStatusFilterChange}>
              <option value="active">Show Active</option>
              <option value="inactive">Show Inactive</option>
              <option value="all">Show All</option>
            </select>
          </div>
          <div className="col-md-2 offset-md-2 mb-2 mt-2 mt-md-1 mb-md-4">
            <h6>Rows to Display</h6>
            <select className="form-control small" onChange={this.handleRowsToDisplayChange}>
              <option value={10}>10</option>
              <option value={25} selected >25</option>
              <option value={100}>100</option>
            </select>
          </div>
          
        </div>
        <Components.tables.components.collapsabletable
          columns={columns}
          data={data}
          filter={{ filterBy, filterValue }}
          noDataText={(searchText || secondarySearchText) ? 'No Matching Templates.' : 'No Templates Available.'}
          rowRenderer={this.rowRenderer}
          orderIn="asc"
          sortBy="_createdAt"
          secondarySortBy="account"
          hasActions
          rightActions
          paginatedTable
          searchText={searchText}
          secondarySearchText={secondarySearchText}
          rowsToDisplay={rowsToDisplay}
        />
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_reporttemplates);

// Internal Helper Functions ...
const _formatDate = date => Utils.dates.dateToDay(date, 'dayOnly');
const _formatString = string => string.charAt(0).toUpperCase() + string.slice(1);
const _formatStatus = status => <Components.badges.status data={_formatString(status)} />;
const _formatDescription = (description) => {
  return (description && description.length > 15) ? `${description.substring(0, 15)}...` : description;
};
