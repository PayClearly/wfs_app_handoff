import {
  connect, Component, bindActionCreators, Fragment,
} from 'component';
import classNames from 'classnames';
import { Collapse } from 'react-collapse';
import download from 'downloadjs';
import { Parser } from 'json2csv';

import Store from 'store';
import Components from 'components';

import './index.scss';

const _handleLineItemExport = (row, dataMap, lineItemHeaders) => {
  const lineItemDataMap = [];
  const lineItems = row.created.lineItems || [];

  // Create a row for each line item
  lineItems.forEach((lineItem) => {
    const lineItemRow = { ...dataMap };

    // Clear out the payment amount for line items, as it's not relevant and indicates a line item row
    lineItemRow.Amount = '-';

    // Add the line item fields to the row
    const lineItemFields = Object.keys(lineItem);

    lineItemFields.forEach((field) => {
      const customFieldName = `Line Item ${field}`;
      const fieldValue = lineItem[field] || '-';
      lineItemRow[customFieldName] = fieldValue;
      if (!lineItemHeaders.includes(customFieldName)) {
        lineItemHeaders.push(customFieldName);
      }
    });

    lineItemDataMap.push(lineItemRow);
  });

  return lineItemDataMap;
};

const mapStateToProps = (state, props) => ({
  tables: _try(() => state.tables, {}),
  baseUrl: state.router.baseUrl,
  isOps: state.appConfig.data.metadata.name === 'ops',
  customFieldDefinition: state.account.paymentCustomFields,
});

const mapDispatchToProps = (dispatch, props) => ({
  ...bindActionCreators(Store.tables, dispatch),
});

const mapResourcesToProps = (state, props) => ({});

class components_tables_components_collapsibleTable extends Component {
  state = {
    expandedRowId: null,
    wasExpandedRowId: null,
    popoverIdentifier: Math.random().toString(30).substring(7),
    openPopoverId: null,
    popoverOpen: false,
  };

  componentDidMount() {
    const { defaultSelectedRowId, defaultTableState, initialTableStateOverride } = this.props;

    let expandedRowId = null;
    if (defaultSelectedRowId) {
      expandedRowId = defaultSelectedRowId;
    }

    // Initializes the table
    const initialTableState = defaultTableState;
    if (_try(() => initialTableStateOverride.filters)) { initialTableState.filters = initialTableStateOverride.filters; }
    if (_try(() => initialTableStateOverride.sort)) { initialTableState.sort = initialTableStateOverride.sort; }
    const tableKey = this.props.tableKey || 'default';
    this.props.initialize(this.props.tableName, tableKey, initialTableState);

    this.setState({
      expandedRowId,
      tableKey,
    });
  }

  componentWillReceiveProps(nextProps = {}) {
    const currentPageChanged = _try(() => Object.prototype.hasOwnProperty.call(this.props.tables[this.props.tableName][this.state.tableKey].pagination, 'currentPage') && this.props.tables[this.props.tableName][this.state.tableKey].pagination.currentPage !== nextProps.tables[nextProps.tableName][this.state.tableKey].pagination.currentPage);
    const rowsPerPageChanged = _try(() => this.props.tables[this.props.tableName][this.state.tableKey].pagination.rowsPerPage && this.props.tables[this.props.tableName][this.state.tableKey].pagination.rowsPerPage !== nextProps.tables[nextProps.tableName][this.state.tableKey].pagination.rowsPerPage);
    const filterStatusHasChanged = (_try(() => this.props.itemOrder.length !== nextProps.itemOrder.length)) && (_try(() => this.props.data.count === nextProps.data.count));
    if (this.state.expandedRowId && (currentPageChanged || rowsPerPageChanged || filterStatusHasChanged)) {
      this.setState((prevState) => ({
        expandedRowId: null,
        wasExpandedRowId: prevState.expandedRowId,
      }));
    }
  }

  componentWillUnmount() {
    this.props.destroy(this.props.tableName, this.state.tableKey);
  }

  togglePopover = () => {
    this.setState({ popoverOpen: !this.state.popoverOpen });
  };

  _headerRow = () => {
    // need to handle actions and rightActions equivalent
    // handle icon in place of arrow
    const {
      columns = [],
      doNotExpand,
      onRowClick,
      iconOverride,
      actions,
      actionsInFirstColumn,
      enableExportCSV,
      itemOrder,
      updateActive,
    } = this.props;
    const staticRow = !!doNotExpand || !!onRowClick;

    let actionsInPaddingColumn = false;
    let actionsInLastColumn = false;
    if (actions) {
      if (actionsInFirstColumn) {
        actionsInPaddingColumn = true;
      } else {
        actionsInLastColumn = true;
      }
    }
    const renderIconOverride = staticRow && iconOverride && !actionsInPaddingColumn;
    // Only show butotn if updatebale table is not active, and if able to export;
    const renderPaddingColumn = !staticRow || actionsInPaddingColumn || renderIconOverride || enableExportCSV;
    const additionalActions = [{
      title: 'Export CSV',
      onClick: this.downloadCSV,
      disabled: itemOrder.length < 1,
    },
    ...(this.props.additionalActions || []),
    ];
    return (
      <thead>
        <tr className="fixedHeight">
          {renderPaddingColumn && !enableExportCSV
            && <th scope="col" />}
          {
            renderPaddingColumn && enableExportCSV && !updateActive
            && (
              <th scope="col">
                {this.props.additionalActions
                  ? (
                    <Components.tables.components.actionWrapper
                      popoverClassName="components_tables_components_collapsibleTable"
                      actionContent={additionalActions}
                      popoverIdentifier={this.state.popoverIdentifier}
                      itemId={''}
                      openPopoverId={this.state.openPopoverId}
                      toggleOpenPopover={this._onClickTogglePopover}
                      paddingColumnPosition
                      disabled={itemOrder.length < 1}
                    />
                  )
                  : (
                    <Components.button
                      onClick={this.downloadCSV}
                      className="btn btn-primary"
                      icon="mdi mdi-download"
                      aria-label="export button"
                      disabled={itemOrder.length < 1}
                      updating={this.state.downloadingFile}
                    />
                  )}
              </th>
            )
          }
          {_try(() => this.props.resourceSelector.resourceSelectorColumn)
            && (
              <th
                scope="col"
                className={classNames({ pointer: this.props.resourceSelector.resourceSelectorColumn.sortable })}
                key={this.props.resourceSelector.resourceSelectorColumn.dataKey}
                onClick={() => {
                  this._handleHeaderItemClick(this.props.resourceSelector.resourceSelectorColumn);
                }}
              >
                <span className="small">
                  {(typeof this.props.resourceSelector.resourceSelectorColumn.label === 'function')
                    ? this.props.resourceSelector.resourceSelectorColumn.label()
                    : this.props.resourceSelector.resourceSelectorColumn.label}
                </span>
                <span className={this._sortClassNames(this.props.resourceSelector.resourceSelectorColumn)} />
              </th>
            )}
          {
            columns.map((column) => {
              // will disable rendering on columns that we dont want to show but we want in our exported items
              if (column.disableRender) {
                return null;
              }

              const columnHeaderIsButton = column.dataKey === 'actionButton'
                && typeof column.headerRenderer === 'function';

              return (
                <th
                  scope="col"
                  className={classNames({ pointer: column.sortable })}
                  key={column.dataKey}
                  onClick={() => {
                    if (columnHeaderIsButton) { return null; }
                    this._handleHeaderItemClick(column);
                  }}
                >
                  {!columnHeaderIsButton
                    && (
                      <>
                        <span className="small">
                          {(typeof column.label === 'function') ? column.label() : column.label}
                        </span>
                        <span className={this._sortClassNames(column)} />
                      </>
                    )}
                  {columnHeaderIsButton
                    && (
                      <>
                        {column.headerRenderer()}
                      </>
                    )}
                </th>
              );
            })
          }
          {actionsInLastColumn
            && <th scope="col">Actions</th>}
        </tr>
      </thead>
    );
  };

  _sortClassNames = (column) => {
    const sortData = _try(() => this.props.tables[this.props.tableName][this.state.tableKey].sort, {});
    const { sortKey, orderIn } = sortData;
    const { sortable, dataKey, sortKey: columnSortKey } = column;

    const columnKey = columnSortKey || dataKey;
    return classNames(
      { 'mdi pointer': sortable },
      { 'mdi-chevron': (sortKey !== columnKey && sortable) },
      { 'mdi mdi-chevron-down': (sortKey === columnKey && orderIn === 'desc') },
      { 'mdi mdi-chevron-up': (sortKey === columnKey && orderIn === 'asc') }
    );
  };

  _handleHeaderItemClick = (column) => {
    const {
      sortable, dataKey, sortKey, tieBreakKey,
    } = column;
    if (sortable) {
      const newSortData = {
        sortKey: sortKey || dataKey,
      };

      if (tieBreakKey) {
        newSortData.tieBreakKey = tieBreakKey;
      } else if (this.props.defaultTieBreakKey) {
        newSortData.tieBreakKey = this.props.defaultTieBreakKey;
      } else {
        newSortData.tieBreakKey = '';
      }

      this.props.changeSort(this.props.tableName, this.state.tableKey, newSortData);
    }
  };

  _dataRow = (rowId, index) => {
    const {
      actions,
      actionsInFirstColumn,
      actionIconClass,
      columns,
      data = {},
      doNotExpand,
      onRowClick,
      renderAllRows,
      iconOverride,
      rowRenderer,
    } = this.props;
    let row = _try(() => data.items[rowId]);
    if (_try(() => typeof this.props.adapter === 'function')) {
      // might need an adapter for row items? like in aaron's table
      row = this.props.adapter(row);
    }

    if (!row) { return null; }

    // expanded settings
    const expanded = this.state.expandedRowId === rowId;
    const wasExpanded = this.state.wasExpandedRowId === rowId;

    // action content
    const actionContent = this._getActionContent(row);

    // column rendering status
    const staticRow = !!doNotExpand || !!onRowClick;
    let actionsInPaddingColumn = false;
    let actionsInLastColumn = false;
    if (actions && actionContent.length > 0) {
      if (actionsInFirstColumn) {
        actionsInPaddingColumn = true;
      } else {
        actionsInLastColumn = true;
      }
    }
    const renderIconOverride = staticRow && iconOverride && !actionsInPaddingColumn;
    const renderIconInPaddingColumn = (!staticRow || renderIconOverride) && !actionsInPaddingColumn;
    const renderActionsInPaddingColumn = actionsInPaddingColumn;

    return (
      <>
        <tr
          style={((!expanded && this.state.expandedRowId && { opacity: '.2' }) || {})}
          className={classNames('fixedHeight', { clickable: !doNotExpand }, { active: expanded })}
          onClick={() => { this._handleRowClick(rowId); }}
        >
          {renderIconInPaddingColumn
            && (
              <th
                className={classNames('fixedWidth', 'wpx-50', 'text-center', 'expandIcon')}
                aria-label="Show Action Menu"
              >
                <i className={
                  (iconOverride && classNames('mdi', iconOverride))
                  || (row.iconClass && classNames('mdi', row.iconClass))
                  || classNames('mdi', 'mdi-chevron-right', 'table-arrow', expanded && 'rotate90')
                }
                />
              </th>
            )}
          {renderActionsInPaddingColumn
            && <Components.tables.components.actionWrapper
              popoverClassName="components_tables_components_collapsibleTable"
              actionContent={actionContent}
              popoverIdentifier={this.state.popoverIdentifier}
              itemId={rowId}
              openPopoverId={this.state.openPopoverId}
              actionIconClass={actionIconClass}
              toggleOpenPopover={this._onClickTogglePopover}
              paddingColumnPosition
            />}
          {_try(() => this.props.resourceSelector.resourceSelectorColumn) && (
            <td className="fixedWidth">
              {this.props.resourceSelector.resourceSelectorColumn.cellRenderer(undefined, rowId, row)}
            </td>
          )}
          {
            columns.map((column) => {
              if (column.disableRender) { return null; }
              const defaultValue = column.default;
              let columnData = row[column.dataKey];

              if (columnData === undefined || columnData === null) {
                // Remember data can be boolean or empty string
                columnData = defaultValue;
              }
              if (column.dataKey === 'index') {
                columnData = index + 1;
                return (<td className="fixedWidth">{columnData}</td>);
              }
              if (column.cellRenderer) {
                return (<td className="fixedWidth">{column.cellRenderer(columnData, rowId, row)}</td>);
              }
              return (<td className="fixedWidth">{columnData}</td>);
            })
          }
          {actionsInLastColumn
            && <Components.tables.components.actionWrapper
              popoverClassName="components_tables_components_collapsibleTable"
              actionContent={actionContent}
              popoverIdentifier={this.state.popoverIdentifier}
              itemId={rowId}
              openPopoverId={this.state.openPopoverId}
              actionIconClass={actionIconClass}
              toggleOpenPopover={this._onClickTogglePopover}
            />}
        </tr>
        <tr className="collapsibleRow">
          <td colSpan={columns.length + 1}>
            <Collapse isOpened={expanded} hasNestedCollapse>
              {(expanded || wasExpanded || renderAllRows) && _try(() => rowRenderer(rowId, row, expanded))}
            </Collapse>
          </td>
        </tr>
      </>
    );
  };

  _handleRowClick = (rowId) => {
    const { doNotExpand, onRowClick, baseUrl } = this.props;
    const staticRow = !!doNotExpand || !!onRowClick;
    if (!staticRow) {
      this.setState((prevState) => ({
        expandedRowId: rowId === prevState.expandedRowId ? null : rowId,
        wasExpandedRowId: prevState.expandedRowId,
      }));

    } else if (_try(() => typeof onRowClick === 'function')) {
      this.props.onRowClick(rowId);
    }
  };

  _onClickTogglePopover = (id) => {
    this.setState((prevState) => ({
      openPopoverId: prevState.openPopoverId === id ? null : id,
    }));
  };

  _getActionContent = (row) => {
    let actionContent = null;
    if (_try(() => typeof this.props.generateActionContent === 'function')) {
      actionContent = this.props.generateActionContent(row);
    } else {
      actionContent = row.actionContent;
    }
    return actionContent;
  };

  downloadCSV = () => {
    const { customFieldDefinition, exportOptions } = this.props;
    const {
      type, includeCustomFields, includeVendorId, includeBatchId, includeLineItems,
    } = exportOptions || {};
    // itemOrder represents all filtered and sorted items including ones hidden by rows per page
    let keysToMap;
    if (this.props.isOps) {
      keysToMap = Object.keys(this.props.data.items);
    } else {
      keysToMap = Object.values(this.props.itemOrder);
    }

    // Get all column fields except for actions or non-labeled column. Add an id column to the end of the row
    const fields = this.props.columns.filter((header) => (header.label && header.label !== 'Actions') && !header.disableExport).map((column) => column.label);

    // Payment Table Specific Handling
    let hasLineItems = false;
    const lineItemHeaders = [];
    let hasCustomFields = false;
    let customFieldHeaders = [];

    if (type === 'payment') {
      // Add custom fields to the fields if they exist and are enabled
      hasCustomFields = includeCustomFields && customFieldDefinition.data && customFieldDefinition.data.item && Object.keys(customFieldDefinition.data.item).length > 0;
      if (hasCustomFields) {
        customFieldHeaders = Object.values(customFieldDefinition.data.item).map((field) => field.name);
        fields.push(...customFieldHeaders);
      }
    }
    // End of Payment Table Specific Handling

    // Utilizing flatMap to handle line items for payments table
    const data = keysToMap.flatMap((id) => {
      // Get Data Row
      const row = this.props.data.items[id] || {};
      // Map each column based on row data
      const dataMap = this.props.columns.reduce((acc, column, index) => {
        const defaultValue = column.default;
        let fieldValue = row[column.dataKey];
        // Add the id to the row
        if (index === 0) {
          acc['CHANGE_ME_COMPANY_NAME Id'] = row._id || row.id || '-';
        }
        if (column.disableExport || !column.label || column.label === 'Actions') { return acc; }

        if (column.exportFormatter) {
          fieldValue = column.exportFormatter(fieldValue) || '-';
        } else {
          if (fieldValue === undefined || fieldValue === null) { fieldValue = defaultValue; } // Remember data can be boolean or empty string

          if (column.dataKey === 'index') {
            fieldValue = index + 1;
            acc[column.label] = fieldValue;
            return acc;
          }
        }
        // Object Formatting: Look at all keys of the object and if true then append it to the value with |. Helps with objects such as Accepts: { vCard: true, ACH: true, check: true }
        if (typeof fieldValue === 'object' && fieldValue !== null) {
          const tempData = Object.keys(fieldValue).filter((fieldName) => Boolean(fieldValue[fieldName])).join(' | ');
          fieldValue = tempData;
        }
        // All unset (null) values will be rendered as -
        acc[column.label] = fieldValue;
        return acc;
      }, {});

      // Payment Table Specific Handling
      if (type === 'payment') {
        const hasBeenCreated = row.created || false;
        const thisPaymentHasCustomFields = hasCustomFields && hasBeenCreated && row.created.customFields;

        // Custom Field Handling
        if (thisPaymentHasCustomFields && hasBeenCreated) {
          customFieldHeaders.forEach((field) => {
            const fieldValue = row.created.customFields[field] || '-';
            dataMap[field] = fieldValue;
          });
        }

        // Line Item Handling
        let lineItemDataMap = [];
        const thisPaymentHasLineItems = includeLineItems && hasBeenCreated && row.created.lineItems;
        if (thisPaymentHasLineItems) {
          if (row.created.lineItems) {
            if (!hasLineItems) {
              hasLineItems = true;
            }
            lineItemDataMap = _handleLineItemExport(row, dataMap, lineItemHeaders);
          }
        }

        if (includeVendorId && hasBeenCreated) {
          dataMap['CHANGE_ME_COMPANY_NAME Vendor Id'] = row.created.vendorId || '-';
        }
        if (includeBatchId) {
          dataMap['CHANGE_ME_COMPANY_NAME Batch Id'] = row._batchId || '-';
        }
        if (includeLineItems && hasLineItems) {
          return [dataMap, ...lineItemDataMap];
        }

        return [dataMap];
      }
      // End of Payment Table Specific Handling

      return [dataMap];
    });

    // Payment Table Specific Handling
    if (type === 'payment') {
      // Line Item Handling
      if (includeLineItems && hasLineItems) {
        fields.push(...lineItemHeaders);
      }

      // Vendor Id Handling
      if (includeVendorId) {
        fields.push('CHANGE_ME_COMPANY_NAME Vendor Id');
      }

      // Batch Id Handling
      if (includeBatchId) {
        fields.push('CHANGE_ME_COMPANY_NAME Batch Id');
      }
    }
    // End of Payment Table Specific Handling

    // Add id to the fields
    fields.push('CHANGE_ME_COMPANY_NAME Id');

    // Parse the data using fields and data, maps fields to data row
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    // Filename uses exportName passed in and adds current date (Day Mon DD YYYY)
    const date = new Date();
    const fileName = `${this.props.exportName} (${date.toDateString()})`;
    download(csv, fileName, 'text/csv');
  };

  render() {
    const {
      itemOrder = [], data = {}, columns = [], paginate, tables, enableExport, exportFilePrefix, loading,
    } = this.props;
    const table = _try(() => tables[this.props.tableName][this.state.tableKey]);
    if (!table) { return null; }

    const numberOfColumns = columns.length + 1 + (this.props.hasActions && this.props.rightActions ? 1 : 0);
    const filteringInProgress = _try(() => itemOrder.length) !== _try(() => data.count);
    let noDataText = this.props.noDataText || 'No data available';
    if (this.props.typeForNoDataText) { noDataText = filteringInProgress ? `No Matching ${this.props.typeForNoDataText}` : `No ${this.props.typeForNoDataText} Available`; }

    let itemsToRender = itemOrder;
    if (paginate) {
      const havePaginationState = _try(() => table.pagination.currentPage > -1) && table.pagination.rowsPerPage;
      itemsToRender = havePaginationState ? itemOrder.slice(table.pagination.currentPage * table.pagination.rowsPerPage, (table.pagination.currentPage * table.pagination.rowsPerPage) + table.pagination.rowsPerPage) : [];
    }

    if (this.props.setItemScopeForUpdate) {
      this.props.setItemScopeForUpdate(itemsToRender.reduce((acc, id) => { acc[id] = true; return acc; }, {}));
    }

    const TABLE_COMP = (
      <Fragment>
        {loading && <Components.spinner />}
        <table className={`table responsive${paginate ? ' paginate_table' : ''}`}>
          {!loading && this._headerRow()}
          {!loading && Boolean(itemOrder.length)
            && itemsToRender.map((id, index) => this._dataRow(id, index))}
          {!loading && !itemOrder.length
            && <tr><td colSpan={numberOfColumns} className="text-center"><i><small>{noDataText}</small></i></td></tr>}
        </table>
        {enableExport
          && <Components.tables.components.exportWrapper
            tableName={this.props.tableName}
            tableKey={this.state.tableKey}
            columns={columns}
            data={data}
            itemOrder={itemOrder}
            paginate={paginate}
            exportFilePrefix={exportFilePrefix}
          />}
      </Fragment>
    );

    return (
      <div className={`components_tables_components_collapsibleTable table-scroll-container${this.props.nestedTable ? ' nested-table' : ''}`}>
        {!paginate
          && TABLE_COMP}
        {paginate
          && <Components.tables.components.paginateWrapper
            tableName={this.props.tableName}
            tableKey={this.state.tableKey}
            data={data}
            itemOrder={itemOrder}
            initialRowsPerPage={this.props.initialRowsPerPage}
            defaultSelectedRowId={this.props.defaultSelectedRowId}
            hideRowsPerPageSelector={this.props.hideRowsPerPageSelector}
            handleLoadResource={this.props.handleLoadResource}
            keysLength={this.props.keysLength}
          >
            {TABLE_COMP}
          </Components.tables.components.paginateWrapper>}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_tables_components_collapsibleTable);

