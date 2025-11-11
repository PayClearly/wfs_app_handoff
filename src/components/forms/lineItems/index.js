import {
  connect, Component, bindActionCreators, Fragment,
} from 'component';
import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const FORM_NAME = 'Components.forms.lineItems';
const LINE_ITEM_FIELDS = ['date', 'invoice', 'description', 'balance', 'discount', 'amount'];

const statusRenderer = (isReady) => (!isReady ? <span className="badge rounded-pill bg-danger">Not Ready</span> : <span className="badge rounded-pill bg-primary">Ready</span>);

const mapStateToProps = (state, props) => ({
  form: _try(() => state.forms[FORM_NAME][props.formKey], {}),
  lineItems: Selectors.uploadLineItems(props.formKey)(state),
  filteredAndSortedItems: Selectors.tableItems(FORM_NAME, props.formKey, `Selectors.uploadLineItems(${props.formKey})(state).data`)(state),
  types: state.validations.data.item,
});

const mapDispatchToProps = (dispatch, props) => ({
  ...bindActionCreators(Store.forms, dispatch),
});

const mapResourcesToProps = (state, props) => ({});

class components_forms_lineItems extends Component {

  state = {
    name: FORM_NAME,
    columns: [
      {
        label: 'Status', dataKey: 'isReady', sortable: false, cellRenderer: (isReady) => statusRenderer(isReady),
      },
      {
        label: 'Actions', dataKey: '', sortable: false, cellRenderer: (_value, rowId) => this.actionRenderer(rowId),
      },
      {
        label: 'Total', dataKey: 'amount', sortable: false, cellRenderer: (amount) => (!amount && amount !== 0 ? <i>-</i> : Utils.numeral()(amount).format('$0,0.00')),
      },
      {
        label: 'Balance', dataKey: 'balance', sortable: false, cellRenderer: (balance) => (!balance && balance !== 0 ? <i>-</i> : Utils.numeral()(balance).format('$0,0.00')),
      },
      {
        label: 'Discount', dataKey: 'discount', sortable: false, cellRenderer: (discount) => (!discount && discount !== 0 ? <i>-</i> : Utils.numeral()(discount).format('$0,0.00')),
      },
      {
        label: 'Date', dataKey: 'date', sortable: false, cellRenderer: (date) => (!date ? <i>-</i> : date),
      },
      {
        label: 'Invoice Number', dataKey: 'invoice', sortable: false, cellRenderer: (invoice) => (!invoice ? <i>-</i> : invoice),
      },
      {
        label: 'Description', dataKey: 'description', sortable: false, cellRenderer: (description) => (!description ? <i>-</i> : description),
      },
    ],
  };

  componentDidMount() {
    const { initialize, validate } = this.props;
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';
    const lineItems = this.props.initialData || [];

    const initialFormData = {};
    if (lineItems.length) {
      lineItems.forEach((lineItem, index) => {
        LINE_ITEM_FIELDS.forEach((field) => {
          initialFormData[`lineItem_${index}_${field}`] = Object.prototype.hasOwnProperty.call(lineItem, field) ? lineItem[field] : '';
        });
      });
    }

    initialize(this.state.name, key, initialFormData);
    validate(this.state.name, key, this.validate);

    if (_try(() => this.props.parent.formName && this.props.parent.formKey)) {
      this.props.addChild(this.props.parent.formName, this.props.parent.formKey, this.state.name, key);
    }
  }

  componentWillReceiveProps(nextProps = {}) {
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';
    this.setState({
      key,
    });

    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, this.state.key, this.props.forms[this.state.name][this.state.key]._values);
    }
  }

  componentDidUpdate(prevProps = {}) {
    if (this.props.lineItems.maxId !== prevProps.lineItems.maxId) {
      this.props.validate(this.state.name, this.props.formKey, this.validate);
    }
  }

  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, field, value);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  checkType = (type, against) => Utils.typesvalidator.validateType(this.props.types, type, against).valid;

  validate = (values) => {
    const { lineItems } = this.props;
    const errors = {};

    Object.keys(lineItems.data || {}).forEach((lineItemKey) => {
      const fieldPrefix = `lineItem_${lineItemKey}_`;

      if (!Object.prototype.hasOwnProperty.call(values, `${fieldPrefix}amount`)) { errors[`${fieldPrefix}amount`] = 'Total is required'; }
    });

    return errors;
  };

  actionRenderer = (rowId) => {
    const fieldsToRemove = LINE_ITEM_FIELDS.map((field) => `lineItem_${rowId}_${field}`);

    return (
      <button type="button" className="do-not-expand clickable btn btn-sm btn-outline-secondary" onClick={(e) => { e.stopPropagation(); this.props.removeFields(FORM_NAME, this.props.formKey, fieldsToRemove); }}>
        <span className="do-not-expand mdi mdi-delete-forever">Remove</span>
      </button>
    );
  };

  rowRenderer = (rowId, rowData, expanded) => {
    const { form } = this.props;
    if (!form) { return <Components.horizontalLoader />; }

    return (
      <form className="components_forms_lineItems floating-labels form-group-noBottomMargin pt-3 px-3">
        <div className="row">
          <div className="col-12 col-md-2">
            <Components.forms.components.maskedinput
              form={form}
              maskPlaceholder=""
              type="string"
              field={`lineItem_${rowId}_amount`}
              useNumberMask
              action={this.standardFormAction}
              label="Total"
              disabled={this.props.disabled}
              required
            // hideError={_try(() => !form[`lineItem_${rowId}_amount`].touched)}
            />
          </div>
          <div className="col-12 col-md-2">
            <Components.forms.components.maskedinput
              form={form}
              maskPlaceholder=""
              type="string"
              field={`lineItem_${rowId}_balance`}
              useNumberMask
              action={this.standardFormAction}
              label="Balance"
              disabled={this.props.disabled}
            // hideError={_try(() => !form[`lineItem_${rowId}_balance`].touched)}
            />
          </div>
          <div className="col-12 col-md-2">
            <Components.forms.components.maskedinput
              form={form}
              maskPlaceholder=""
              type="string"
              field={`lineItem_${rowId}_discount`}
              useNumberMask
              action={this.standardFormAction}
              label="Discount"
              disabled={this.props.disabled}
            // hideError={_try(() => !form[`lineItem_${rowId}_discount`].touched)}
            />
          </div>
          <div className="col-12 col-md-2">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field={`lineItem_${rowId}_date`}
              action={this.standardFormAction}
              label="Date"
              disabled={this.props.disabled}
            // hideError={!form[`lineItem_${rowId}_date`].touched}
            />
          </div>
          <div className="col-12 col-md-2">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field={`lineItem_${rowId}_invoice`}
              action={this.standardFormAction}
              label="Invoice Number"
              disabled={this.props.disabled}
            // hideError={!form[`lineItem_${rowId}_invoice`].touched}
            />
          </div>
          <div className="col-12 col-md-2">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field={`lineItem_${rowId}_description`}
              action={this.standardFormAction}
              label="Description"
              disabled={this.props.disabled}
            // hideError={!form[`lineItem_${rowId}_description`].touched}
            />
          </div>
        </div>
      </form>
    );
  };

  render() {
    const { form } = this.props;
    const { lineItems, filteredAndSortedItems, isShowing } = this.props;
    if (!form || !lineItems.count || !isShowing) { return null; }

    return (
      <Components.tables.components.collapsibleTable
        tableName={FORM_NAME}
        tableKey={this.props.formKey}
        initialTableStateOverride={this.props.initialTableStateOverride}
        defaultTableState={{
          filters: {},
          sort: {
            sortKey: 'id',
            orderIn: 'asc',
          },
        }}
        data={{
          items: lineItems.data,
          count: lineItems.count,
        }}
        itemOrder={filteredAndSortedItems}
        columns={this.state.columns}
        rowRenderer={this.rowRenderer}
        typeForNoDataText="Line Items"
        paginate
        initialRowsPerPage={10}
        hideRowsPerPageSelector
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_forms_lineItems);


