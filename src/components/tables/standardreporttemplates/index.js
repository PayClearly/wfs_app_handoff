import { connect, Component } from 'component';

// Third Party Imports ...
import Utils from 'utils';
import Store from 'store';
import Components from 'components';

// import './index.scss';

const mapStateToProps = (state) => ({
  reportTemplates: state.reportTemplates.data.items,
  organizationId: state.organization.data.id,
  accountId: state.account.data.id,
  users: state.users.data.items,
});

const mapDispatchToProps = (dispatch) => ({
  openAreYouSureModal: (data) => dispatch(Store.router.openModal('Components.modals.areyousure', data)),
});

// Internal Helper Functions ...
const _formatDate = (date) => Utils.dates.dateToDay(Date.parse(date) || Date.now(), 'dayOnly');
const _formatString = (string) => string.charAt(0).toUpperCase() + string.slice(1);
const _formatStatus = (status) => (
  <span className={`badge rounded-pill bg-${status === 'active' ? 'success' : 'danger'}`}>{_formatString(status)}</span>
);

class components_tables_standardreporttemplates extends Component {

  state = {
    columns: [],
  };

  componentDidMount() {
    const columns = [
      { label: 'Name', dataKey: 'filename', sort: true },
      { label: 'Description', dataKey: 'description', sort: true },
      {
        label: 'Report Type', dataKey: 'type', sort: true, cellRenderer: _formatString,
      },
      {
        label: 'Frequency', dataKey: 'schedule', sort: true, cellRenderer: _formatString,
      },
      {
        label: 'Created By', dataKey: 'createdBy', sort: true, default: 'unknown',
      },
      {
        label: 'Created Date', dataKey: '_createdAt', sort: true, cellRenderer: _formatDate,
      },
      {
        label: 'Status', dataKey: 'status', sort: true, cellRenderer: _formatStatus,
      },
    ];
    this.setState({ columns });
  }

  getRowData = (organizationId, accountId, reportTemplateId) => {
    const { users, reportTemplates } = this.props;
    const reportTemplate = reportTemplates[organizationId][accountId][reportTemplateId];
    const user = users[reportTemplate._createdBy];
    let createdBy = 'Unknown';
    if (user) { createdBy = (user.firstName && user.lastName) ? `${user.firstName} ${user.lastName}` : user.username; }

    const actionContent = [
      {
        title: 'Run',
        onClick: () => this.props.runReport(),
        disabled: false,
      }, {
        title: 'Edit',
        onClick: () => this.props.editReport(),
        disabled: false,
      }, {
        title: 'Delete',
        onClick: this.templateUpdateHandler(organizationId, accountId, reportTemplateId, 'deleted'),
        disabled: false,
      },
    ];

    // const buttonData = { organizationId, accountId, reportTemplateId, status: reportTemplate.status };

    return {
      ...reportTemplate,
      createdBy,
      actionContent,
    };
  };

  rowRenderer = (rowData) => (
    <Components.entities.reporttemplate template={rowData} />
  );

  templateUpdateHandler(organization, account, reportTemplateId, status) {
    return () => {
      this.props.openAreYouSureModal({
        title: 'Delete Template',
        content: `You are about to set the template status to ${status}`,
        noText: 'No',
        yesText: 'Yes',
        onYes: () => this.props.updateReport(organization._id, account._id, reportTemplateId, { status }),
      });
    };
  }

  render() {
    const { columns } = this.state;
    const { reportTemplates, organizationId, accountId } = this.props;
    const templates = (reportTemplates[organizationId]) ? reportTemplates[organizationId][accountId] : undefined;
    if (!templates) { return null; }

    const data = Object.keys(templates)
      .map((reportTemplateId) => this.getRowData(organizationId, accountId, reportTemplateId));

    return (
      <div className="components_tables_standardreporttemplates">
        <Components.tables.components.collapsabletable
          columns={columns}
          data={data}
          noDataText="No templates available."
          rowRenderer={this.rowRenderer}
          orderIn="desc"
          sortBy="_createdAt"
          secondarySortBy="account"
          hasActions
          rightActions
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_standardreporttemplates);
