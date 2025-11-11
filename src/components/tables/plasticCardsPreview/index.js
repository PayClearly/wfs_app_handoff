import { connect, Component } from 'component';

import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  derivedForms: Selectors.plasticCardForms()(state),
  status: state.account.cardsIntegration.status,
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
class components_tables_plasticCardsPreview extends Component {

  state = {
    columns: [
      {
        label: 'Card Holder Name', dataKey: 'cardHolderName', sort: true, default: '--',
      },
      {
        label: 'Type', dataKey: 'cardType', sort: true, default: '--',
      },
      {
        label: 'Memo', dataKey: 'cardMemo', sort: true, default: '--',
      },
      {
        label: 'Status', dataKey: 'valid', sort: true, cellRenderer: formStatus,
      },
      {
        label: 'Actions', dataKey: 'remove', sort: false, cellRenderer: formActions,
      },
    ],
  };

  rowRenderer = (rowData = {}) => (
    <div className="row p-4">
      <div className="col-xs-12 col-md-12">
        <Components.forms.plasticcard
          forCreate
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

    return {
      // form
      initialData: item,
      formKey: item.id,
      hidden: item.removed,

      // rows
      cardHolderName: _try(() => derived.form._values.cardHolderName, '--'),
      cardType: _try(() => derived.form._values.cardType, 100),
      cardMemo: _try(() => derived.form._values.cardMemo, '--'),
      valid: !!derived.valid,
      remove: () => this.props.remove(item.id),
    };
  };

  render() {
    return (
      <Components.uploaders.components.table
        className="components_tables_plasticCardsPreview"
        columns={this.state.columns}
        rowRenderer={this.rowRenderer}
        data={this.props.items}
        adapter={this.rowItemAdapter}
        sortBy="formKey"
        secondarySortBy="formKey"
        orderIn="asc"
        noDataText="No Plastic Cards Available"
        alwaysRenderRow
        lastRowActionButtons={this.props.tableActionButtons}
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_plasticCardsPreview);
