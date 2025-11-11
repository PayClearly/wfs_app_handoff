import { connect, Component } from 'component';
import resolvePath from 'object-resolve-path';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  revenueShares: state.revenueShares.data.items,
  organizations: state.organizations.data.items,
  accounts: state.admin.accounts.data.item,
  statements: state.statements.data.items,
  fetched: state.revenueShares.status.fetched,
  status: state.revenueShares.status,
});

const mapDispatchToProps = (dispatch) => ({
  updateRevenueShare: (organizationId, accountId, revenueShareId, data) => {
    dispatch(Store.revenueshares.update(organizationId, accountId, revenueShareId, data));
  },
});

// Internal Helper Functions ...
function _formatLessThanTen(time) {
  return time < 10 ? `0${time}` : time;
}

function _dateToDay(at) {
  const date = new Date(at);

  const dd = _formatLessThanTen(date.getDate());
  const mm = _formatLessThanTen(date.getMonth() + 1);
  const yyyy = date.getFullYear();

  return `${mm}-${dd}-${yyyy}`;
}

const ApplyDate = (at) => _dateToDay(at);

// eslint-disable-next-line camelcase
class components_tables_revenueshares extends Component {

  state = {
    columns: [],
    filterBy: 'status',
    filterValue: 'active',
  };

  componentDidMount() {
    const columns = [
      {
        label: 'Apply Date', dataKey: 'applyDate', sort: true, cellRenderer: ApplyDate,
      },
      { label: 'Frequency', dataKey: 'schedule' },
      { label: 'Level 3/LTI', dataKey: 'level3LTI' },
      { label: 'Status', dataKey: 'status' },
      { label: '', dataKey: 'buttonData', cellRenderer: this.ToggleActiveButton },
    ];
    this.setState({ columns });
  }

  getRowData = (organizationId, accountId, revenueShareId) => {
    const revenueShare = this.props.revenueShares[organizationId][accountId][revenueShareId];
    const statements = Object.keys(revenueShare.statements || {}).reduce((acc, curr) => {
      acc[curr] = this.props.statements
        ? resolvePath(this.props, `statements["${organizationId}"]["${accountId}"]["${curr}"]`)
        : {};
      return acc;
    }, {});
    const organization = this.props.organizations[organizationId];
    const account = this.props.accounts[organizationId][accountId];

    const buttonData = {
      organizationId, accountId, revenueShareId, status: revenueShare.status,
    };

    return {
      ...revenueShare,
      statements,
      account,
      organization,
      buttonData,
    };
  };

  toggleFilterValue = () => {
    const filterValue = (this.state.filterValue !== 'active')
      ? 'active'
      : null;

    this.setState({ filterValue });
  };

  ToggleActiveButton = (data) => {
    const {
      status, organizationId, accountId, revenueShareId,
    } = data;

    const updating = this.props.status.updating || this.props.status.creating;

    const buttonText = status === 'active'
      ? 'Deactivate'
      : 'Activate';

    const buttonClass = status === 'active'
      ? 'btn btn-danger'
      : 'btn btn-primary';

    return (
      <div style={{ width: '80px' }}>
        <Components.forms.components.button
          onClick={() => {
            const payload = status === 'active'
              ? { status: 'inactive' }
              : { status: 'active' };

            return this.props.updateRevenueShare(organizationId, accountId, revenueShareId, payload);
          }}
          buttonText={buttonText}
          className={`${buttonClass} btn-sm do-not-expand w-100`}
          disabled={updating}
          updating={updating}
        />
      </div>
    );
  };

  rowRenderer = (rowData = {}) => (
    <div className={'py-3 revenue-share-row'}>
      <span className={'display-6 fw-light'}>Revenue Share Terms</span>
      <div className="col">
        <Components.revenueshareoverview revenueShare={rowData} />
      </div>
      <span className={'display-6 fw-light pt-3'}>Statements</span>
      <Components.creators.statement
        accountId={this.props.accountId}
        organizationId={this.props.organizationId}
        revenueShare={rowData}
      />
      <Components.tables.statements
        accountId={this.props.accountId}
        filterOptions
        organizationId={this.props.organizationId}
        statements={rowData.statements}
      />
    </div>
  );


  render() {
    const { filterBy, filterValue, columns } = this.state;
    const {
      revenueShares, organizationId, accountId, fetched,
    } = this.props;

    if (!fetched || !organizationId || !accountId) { return <Components.spinner />; }

    const revShares = _try(() => revenueShares[organizationId][accountId], {});
    const data = Object.keys(revShares)
      .map((revenueShareId) => this.getRowData(organizationId, accountId, revenueShareId));

    return (
      <div className="components_tables_revenueshares">
        <div className="row">
          <div className="col">
            <div className="form-group mt-2 mb-0">
              <div className="checkbox checkbox-primary">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={accountId}
                  onChange={() => this.toggleFilterValue()}
                  value={!this.state.filterValue}
                  checked={!this.state.filterValue}
                />
                <label className="form-check-label" htmlFor={accountId}>Show Inactive Revenue Shares</label>
              </div>
            </div>
          </div>
        </div>
        <Components.tables.components.collapsabletable
          columns={columns}
          data={data}
          filter={{ filterBy, filterValue }}
          noDataText="No revenue shares available"
          orderIn="asc"
          rowRenderer={this.rowRenderer}
          secondarySortBy="account"
          sortBy="organization"
        // hasActions
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_revenueshares);
