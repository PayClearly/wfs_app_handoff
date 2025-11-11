import { connect, Component } from 'component';

import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state) => ({
  derivedForms: Selectors.uploaders.clientVendorLinkForms()(state),
  status: _resolve(state, 'account.clientVendorLinks.status', {}),
});

const mapDispatchToProps = () => ({});

const formStatus = (status) => (status
  ? <span className="badge rounded-pill bg-primary">Ready</span>
  : <span className="badge rounded-pill bg-danger">Not Ready</span>
);

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
class components_uploaders_components_tables_clientVendorLinksPreview extends Component {

  state = {
    columns: [
      {
        label: 'Vendor Name', dataKey: 'vendorName', sort: true, default: '--',
      },
      {
        label: 'Client Name', dataKey: 'clientName', sort: true, default: '--',
      },
      {
        label: 'Credentials',
        dataKey: 'credentialsDisplay',
        sort: true,
        cellRenderer: (value) => <Components.badges.clientVendorLinkCredentialsDisplay data={value} />,
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
        <Components.forms.clientVendorLink
          formKey={rowData.formKey}
          initialData={rowData.initialData}
          status={this.props.status}
          blurOnInit={!!this.props.initialUploaded[rowData.formKey]}
          blurAll={this.props.blurAll}
          hideComponents={!isShowing}
        />
      </div>
    </div>
  );

  rowItemAdapter = (item) => {
    const derived = this.props.derivedForms[item.id] || {};

    let credentialsDisplay = 'none';
    if (derived.hasCredentials) { credentialsDisplay = derived.credentialsFormValid ? 'valid' : 'invalid'; }

    return {
      // form
      initialData: item,
      formKey: item.id,
      hidden: item.removed,

      // rows
      vendorName: _try(() => derived.form._values.vendorName),
      clientName: _try(() => derived.form._values.clientName),
      credentialsDisplay,

      valid: _try(() => derived.valid, true),
      remove: () => { this.props.remove(item.id); },
    };
  };

  render() {
    return (
      <Components.uploaders.components.table
        className="components_uploaders_components_tables_clientVendorLinksPreview"
        columns={this.state.columns}
        rowRenderer={this.rowRenderer}
        data={this.props.items}
        adapter={this.rowItemAdapter}
        sortBy="formKey"
        secondarySortBy="formKey"
        orderIn="asc"
        noDataText="No Client-Vendor Links Available"
        alwaysRenderRow
        lastRowActionButtons={this.props.tableActionButtons}
      />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(components_uploaders_components_tables_clientVendorLinksPreview);
