import {
  connect, Component, bindActionCreators, Fragment,
} from 'component';

// Third Party Imports ...
import numeral from 'numeral';

import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const formStatus = (status) => (status ? <span className="badge rounded-pill bg-primary">Ready</span> : <span className="badge rounded-pill bg-danger">Not Ready</span>);
const formActions = (remove) => (
  <button type="button" className="do-not-expand clickable badge rounded-pill btn-outline-danger" onClick={(e) => { e.stopPropagation(); remove(); }}>
    <span className="do-not-expand mdi mdi-delete-forever">Remove</span>
  </button>
);

const mapStateToProps = (state, props) => ({
  derivedForms: Selectors.paymentforms()(state),
  paymentPipelinePreferences: state.account.paymentPipelinePreferences.data.item,
});

const mapDispatchToProps = (dispatch, props) => ({});

class components_tables_paymentspreview extends Component {
  state = {
    columns: [
      {
        label: 'To', dataKey: 'vendorName', sort: true, default: '--',
      },
      {
        label: 'Amount', dataKey: 'amount', sort: true, default: '--',
      },
      {
        label: 'Vertical', dataKey: 'category', sort: true, default: '--',
      },
      {
        label: 'Method', dataKey: 'method', sort: true, cellRenderer: (data) => <Components.badges.acceptsmethod data={data} />,
      },
      {
        label: 'Linked', dataKey: 'linked', sort: true, cellRenderer: (data) => <Components.badges.checkmark data={data} />,
      },
      {
        label: 'Status', dataKey: 'valid', sort: true, cellRenderer: formStatus, default: '--',
      },
      {
        label: 'Actions', dataKey: 'remove', sort: false, cellRenderer: formActions, default: '--',
      },
      { label: 'Memo', dataKey: 'memo', sort: true },
    ],
  };

  componentDidMount() {
    const { columns } = this.state;

    if (this.props.paymentPipelinePreferences.enableCommissions) {
      columns.splice(2, 0, {
        label: '',
        dataKey: 'isCommission',
        sort: true,
        cellRenderer: (data) => {
          if (!data) { return null; }
          return (
            <span style={{ fontSize: '28px' }} className="text-primary">
              <Components.tooltip className="float-start pe-2">
                <div><i className="mdi mdi-account-cash-outline" /></div>
                <div>Commission</div>
              </Components.tooltip>
            </span>
          );
        },
      });
    }

    this.setState(columns);
  }



  rowItemAdapter = (item) => {
    const derived = this.props.derivedForms[item.id] || {};
    return {
      // form
      initialData: item,
      formKey: item.id,
      hidden: item.removed,
      isCommission: item.isCommission,
      aggregatedNonCommissionPaymentsTotal: this.props.aggregatedNonCommissionPaymentsTotal,
      uploadCheckNumbers: this.props.checkNumbers,

      // rows
      vendorName: _try(() => derived.selectedVendor.display, '--'),
      amount: _try(() => derived.fee.formatedNetAmount || ((derived.form._values.amount || derived.form._values.amount === 0) && numeral(derived.form._values.amount).format('$0,0.00')), '', '--'),
      method: _try(() => derived.form._values.method, ''),
      linked: _try(() => derived.selectedVendor.linkedWithPayClearlyVendorId, false),
      valid: _try(() => derived.valid, true),
      category: _try(() => derived.form._values.globalVendorTagName, '--'),
      memo: _try(() => item.fields[Object.keys(item.fields).find((field) => field.toLowerCase() === 'memo')], ''),
      remove: () => { this.props.remove(item.id); },
    };
  };

  // eslint-disable-next-line default-param-last
  rowRenderer = (rowData = {}, isShowing) => (
    <div className="row p-4">
      <div className="col-xs-12 col-md-12">
        <Components.forms.payment
          formKey={rowData.formKey}
          initialData={rowData.initialData}
          isShowing={isShowing}
          isCommission={rowData.isCommission}
          aggregatedNonCommissionPaymentsTotal={rowData.aggregatedNonCommissionPaymentsTotal}
          uploadCheckNumbers={rowData.uploadCheckNumbers}
          blurAll={!!this.props.initialUploaded[rowData.formKey] || this.props.blurAll}
        />
      </div>
    </div>
  );

  render() {

    return (
      <Components.uploaders.components.table
        className="components_tables_paymentspreview"
        columns={this.state.columns}
        rowRenderer={this.rowRenderer}
        data={this.props.items}
        adapter={this.rowItemAdapter}
        sortBy="status"
        secondarySortBy="formKey"
        orderIn="asc"
        noDataText="No Payments Available"
        alwaysRenderRow
        lastRowActionButtons={this.props.tableActionButtons}
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_paymentspreview);


