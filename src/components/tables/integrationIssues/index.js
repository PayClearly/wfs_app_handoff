import { connect, Component, bindActionCreators, Fragment } from 'component';

import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    organization: state.organization.data.id,
    account: state.account.data.id,
    resources: state.account[props.integration].data.resources,
    _resources: state.account[props.integration].data._resources,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_tables_integrationIssues extends Component {




  render() {
    const columns = [
      { label: 'Type', dataKey: 'itemType', sort: true },
      { label: 'Id', dataKey: 'id', sort: true },
      { label: 'Status A', dataKey: 'statusA', sort: true },
      { label: 'Status B', dataKey: 'statusB', sort: true },
    ];

    const rowRenderer = (row) => {
      const projectDbContext = Utils.getglobalcertinfo();
      const { aKeys, bKeys } = Object.keys(row || {}).reduce((acc, cur) => {
        if (cur.toLowerCase().includes('b')) acc.bKeys[cur] = row[cur];
        else acc.aKeys[cur] = row[cur];
        return acc;
      }, { aKeys: {}, bKeys: {} });
      return (
        <div>
          <div className="row">
            <div className="col-md-6" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h2>Resource A</h2>
              {row.idA ?
                <Components.button
                  ariaLabel="View Link In Database"
                  buttonText="VIEW RESOURCE IN DATABASE"
                  className="btn btn-outline-primary mt-2 me-4 btn-sm"
                  icon="mdi mdi-cloud-download"
                  onClick={() => window.open(`https://console.firebase.google.com/u/0/project/${projectDbContext.dbContext}/database/${projectDbContext.projectId}/data/default/state/links/${this.props.integration}/${this.props.organization}/${this.props.account}/resources/${row.itemType}/${row.idA}`)}
                /> : null
              }
            </div>
            <div className="col-md-6" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h2>Resource B</h2>
              {row.idB ?
                <Components.button
                  ariaLabel="View Link In Database"
                  buttonText="VIEW RESOURCE IN DATABASE"
                  className="btn btn-outline-primary mt-2 me-4 btn-sm"
                  icon="mdi mdi-cloud-download"
                  onClick={() => window.open(`https://console.firebase.google.com/u/0/project/${projectDbContext.dbContext}/database/${projectDbContext.projectId}/data/default/state/links/${this.props.integration}/${this.props.organization}/${this.props.account}/_resources/${row.itemType}/${row.idB}`)}
                /> : null
              }
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <p><pre>{row.idA ? JSON.stringify(this.props.resources[row.itemType][row.idA], null, 2) : 'NOT CREATED YET'}</pre></p>
            </div>
            <div className="col-md-6">
              <p><pre>{row.idB ? JSON.stringify(this.props._resources[row.itemType][row.idB], null, 2) : 'NOT CREATED YET'}</pre></p>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h2>Link</h2>
              <Components.button
                ariaLabel="View Link In Database"
                buttonText="VIEW LINK IN DATABASE"
                className="btn btn-outline-primary mt-2 me-4 btn-sm"
                icon="mdi mdi-cloud-download"
                onClick={() => window.open(`https://console.firebase.google.com/u/0/project/${projectDbContext.dbContext}/database/${projectDbContext.projectId}/data/default/state/links/${this.props.integration}/${this.props.organization}/${this.props.account}/links/${row.itemType}/${row.id}`)}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <p><pre>{JSON.stringify(aKeys, null, 2)}</pre></p>
            </div>
            <div className="col-md-6">
              <p><pre>{JSON.stringify(bKeys, null, 2)}</pre></p>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="components_tables_integrationIssues">
        <Components.tables.components.collapsabletable
          columns={columns}
          rowRenderer={rowRenderer}
          data={this.props.data}
          noDataText="Integration currently has no errors"
          paginatedTable
          rowsPerPage={10}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_integrationIssues);


