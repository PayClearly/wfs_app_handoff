import { connect, Component } from 'component';

// Third party imports
import numeral from 'numeral';

import Utils from 'utils';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  derivedForms: Selectors.paymentcardforms()(state),
  status: state.account.paymentCards.status,
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
class components_tables_paymentcardspreview extends Component {

  state = {
    columns: [
      {
        label: 'Card', dataKey: 'name', sort: true, default: '--',
      },
      {
        label: 'Amount', dataKey: 'amount', sort: true, default: '--',
      },
      {
        label: 'Uses', dataKey: 'maxUses', sort: true, default: '--',
      },
      {
        label: 'Date', dataKey: 'validThrough', sort: true, default: '--',
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
  rowRenderer = (rowData = {}) => (
    <div className="row p-4">
      <div className="col-xs-12 col-md-12">
        <Components.forms.paymentCard
          formKey={rowData.formKey}
          initialFormData={rowData.initialData}
          status={this.props.status}
          blurAll={!!this.props.initialUploaded[rowData.formKey] || this.props.blurAll}
        />
      </div>
    </div>
  );

  rowItemAdapter = (item) => {
    const derived = this.props.derivedForms[item.id] || {};
    const plusThreeYearsMinusOneDay = Utils.dates.plusThreeYearsMinusOneDay(Date.now());

    return {
      // form
      initialData: item,
      formKey: item.id,
      hidden: item.removed,

      // rows
      name: _try(() => derived.form._values.name, '--'),
      maxUses: _try(() => derived.form._values.maxUses, 99999),
      amount: _try(() => derived.form._values.amount
        && numeral(derived.form._values.amount).format('$0,0.00'), '', '--'),
      valid: _try(() => derived.valid, true),
      validThrough: _try(
        () => derived.form._values.validThrough.toLocaleDateString(),
        plusThreeYearsMinusOneDay.toLocaleDateString()
      ),
      remove: () => { this.props.remove(item.id); },
    };
  };

  render() {
    return (
      <Components.uploaders.components.table
        className="components_tables_paymentcardspreview"
        columns={this.state.columns}
        rowRenderer={this.rowRenderer}
        data={this.props.items}
        adapter={this.rowItemAdapter}
        sortBy="formKey"
        secondarySortBy="formKey"
        orderIn="asc"
        noDataText="No Payments Available"
        alwaysRenderRow
        lastRowActionButtons={this.props.tableActionButtons}
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_paymentcardspreview);
