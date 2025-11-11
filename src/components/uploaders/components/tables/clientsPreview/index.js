import { connect, Component } from 'component';

import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  derivedForms: Selectors.uploaders.clientForms()(state),
  status: _resolve(state, 'account.clients.status', {}),
});
const mapDispatchToProps = () => ({});


const formStatus = (status) => (status
  ? <span className="badge rounded-pill bg-primary">Ready</span>
  : <span className="badge rounded-pill bg-danger">Not Ready</span>);
const formActions = (remove) => (
  <button
    type="button"
    className="do-not-expand clickable badge rounded-pill btn-outline-danger"
    onClick={(e) => { e.stopPropagation(); remove(); }}
  >
    <span className="do-not-expand mdi mdi-delete-forever">Remove</span>
  </button>
);

// eslint-disable-next-line camelcase
class components_uploaders_components_tables_clientsPreview extends Component {

  state = {
    columns: [
      {
        label: 'Name', dataKey: 'name', sort: true, default: '--',
      },
      {
        label: 'Display Name', dataKey: 'displayName', sort: true, default: '--',
      },
      {
        label: 'Contact Name', dataKey: 'contactName', sort: true, default: '--',
      },
      {
        label: 'Contact Email', dataKey: 'contactEmail', sort: true, default: '--',
      },
      {
        label: 'Status', dataKey: 'valid', sort: true, cellRenderer: formStatus,
      },
      {
        label: 'Actions', dataKey: 'remove', sort: false, cellRenderer: formActions,
      },
    ],
  };

  // eslint-disable-next-line default-param-last
  rowRenderer = (rowData = {}, isShowing) => (
    <div className={`row p-4${!isShowing ? ' d-none' : ''}`}>
      <div className="col-xs-12 col-md-12">
        <Components.forms.client
          formKey={rowData.formKey}
          initialData={rowData.initialData}
          status={this.props.status}
          blurOnInit={!!this.props.initialUploaded[rowData.formKey]}
          blurAll={this.props.blurAll}
          duplicateNamesUsedInUpload={this.props.duplicateNamesUsedInUpload}
        />
      </div>
    </div>
  );

  rowItemAdapter = (item) => {
    const derived = this.props.derivedForms[item.id] || {};

    return {
      // form
      initialData: item,
      formKey: item.id,
      hidden: item.removed,

      // rows
      name: _try(() => derived.form._values.name),
      displayName: _try(() => derived.form._values.displayName),
      contactName: _try(() => derived.form._values.contactName),
      contactEmail: _try(() => derived.form._values.contactEmail),

      valid: _try(() => derived.valid, true),
      remove: () => { this.props.remove(item.id); },
    };
  };

  render() {
    return (
      <Components.uploaders.components.table
        className="components_uploaders_components_tables_clientsPreview"
        columns={this.state.columns}
        rowRenderer={this.rowRenderer}
        data={this.props.items}
        adapter={this.rowItemAdapter}
        sortBy="formKey"
        secondarySortBy="formKey"
        orderIn="asc"
        noDataText="No Clients Available"
        alwaysRenderRow
        lastRowActionButtons={this.props.tableActionButtons}
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_uploaders_components_tables_clientsPreview);
