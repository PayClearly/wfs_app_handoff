import { connect, Component } from 'component';

// Third Party Imports ...
import classNames from 'classnames';
import { Collapse } from 'react-collapse';
import ReactPaginate from 'react-paginate';
import { Popover, PopoverBody } from 'reactstrap';

import './index.scss';

const mapStateToProps = () => ({});
const mapDispatchToProps = () => ({});

/*

Collapsable Table View
======================

You will need three key things: columns, rowRenderer and data. Below is an example of the data structure.

const columns = [
  { label: '#', dataKey: 'index' },
  { label: 'Name', dataKey: 'name', sort: true, default: 'Unknown' },
  { label: 'Id', dataKey: '_id', sort: true },
  {
    label: 'Status',
    dataKey: 'active',
    sort: false,
    cellRenderer: (data) => {
      return data ?
        <span className="badge rounded-pill bg-success">Active</span> :
        <span className="badge rounded-pill bg-danger">Inactive</span>;
    },
  },
];

const rowRenderer = (row) => {
  return (<div>{row.name}</div>);
};

const data = [
  { name: 'Kiran', _id: '123112312', active: true },
  { name: 'Aaron', _id: '123112313', active: false },
  { name: 'Austin', _id: '123112314', active: true },
];

Here is how you use it.
<CollapsableTable columns={columns} rowRenderer={rowRenderer} data={data} />

You can optionally pass the default sort, secondary sort, ordering and no data text.
<CollapsableTable
  columns={columns}
  data={data}
  rowRenderer={rowRenderer}
  sortBy="name"
  orderIn="asc"
  noDataText="Nothing to show here"
  secondarySortBy="_id"
/>

You can also pass search text to filter the data by the specified search test
<CollapsableTable
  columns={columns}
  data={data}
  rowRenderer={rowRenderer}
  sortBy="name"
  orderIn="asc"
  noDataText="Nothing to show here"
  secondarySortBy="_id"
  searchText="payclearly"
/>

You can also pass on click or doNotExpand props
<CollapsableTable
  columns={columns}
  data={data}
  onClick={onClick}
  doNotExpand
  sortBy="name"
  orderIn="asc"
/>
On click and do not expand props are mutually exclusive, they both indicate that the row is not exandable, but do not expand assumes the row is not interactive while onclick allows for the row to perform a function on click.

*/
const escapeRegExp = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

// eslint-disable-next-line camelcase
class components_tables_components_collapsabletable extends Component {
  state = {
    selectedRowIndex: -1,
    wasExpandedIndex: -1,
    selectedItem: -1,
    popoverOpenIndex: -1,
    sortBy: this.props.sortBy || '',
    sortKey: this.props.defaultSortKey || '',
    orderIn: this.props.orderIn || 'asc',
    numberOfRowsPerPage: this.props.paginatedTable ? this.props.rowsPerPage : null,
    startingIndex: this.props.paginatedTable ? 0 : null,
    endingIndex: this.props.paginatedTable ? this.props.rowsPerPage : null,
    currentPage: this.props.paginatedTable ? 0 : null,
    secondarySortKey: null,
    id: Math.random().toString(30).substring(7),
  };

  componentDidMount() {
    if (this.props.defaultSelectedItemId && this.props.defaultIdLabel) {
      const filteredData = this._filterDataAndSortData();
      const itemIndex = this.props.data
        .findIndex((item) => item[this.props.defaultIdLabel] === this.props.defaultSelectedItemId);
      const defaultIndex = filteredData.findIndex((item) => item === itemIndex);

      this.setState({
        selectedRowIndex: defaultIndex,
        selectedItem: filteredData[defaultIndex],
      });
    }
  }

  componentWillReceiveProps(nextProps = {}) {
    if (this.props.paginatedTable) {
      if (
        this.props.searchText !== nextProps.searchText
        || (this.props.filter && this.props.filter.filterValue !== nextProps.filter.filterValue)
      ) {
        this.setState({ startingIndex: 0, endingIndex: this.state.numberOfRowsPerPage, currentPage: 0 });
      }
      if (this.props.rowsPerPage !== nextProps.rowsPerPage) {
        // fix the endingIndex based on changing this prop
        this.setState({
          numberOfRowsPerPage: nextProps.rowsPerPage,
          startingIndex: 0,
          endingIndex: nextProps.rowsPerPage,
          currentPage: 0,
        });
      }
      if (this.props.sortBy !== nextProps.sortBy) {
        // fix the endingINdex based on changing this prop
        this.setState({
          numberOfRowsPerPage: nextProps.rowsPerPage,
          startingIndex: 0,
          endingIndex: nextProps.rowsPerPage,
          currentPage: 0,
        });
      }
    }
  }

  _handleSort = (item) => {
    const {
      dataKey, sort, sortKey, secondarySortKey,
    } = item;
    let { startingIndex, endingIndex, currentPage } = this.state;

    if (secondarySortKey && !this.state.secondarySortKey && secondarySortKey !== this.state.secondarySortKey) {
      this.setState({ secondarySortKey });
    } else if (!secondarySortKey && this.state.secondarySortKey) {
      this.setState({ secondarySortKey: null });
    }

    if (this.props.paginatedTable) {
      startingIndex = 0;
      endingIndex = this.state.numberOfRowsPerPage;
      currentPage = 0;
    }

    if (sort) {
      const sortBy = dataKey;
      const orderIn = (sortBy === this.state.sortBy)
        ? this._inverseOrderIn(this.state.orderIn)
        : this.state.orderIn;
      this.setState({
        sortBy,
        sortKey,
        orderIn,
        selectedRowIndex: -1,
        selectedItem: -1,
        startingIndex,
        endingIndex,
        currentPage,
      });
      this._setSelectedRow(-1);
    }
  };

  _handleRowClick = (row, index, e, doNotExpand) => {
    if (doNotExpand
      || (
        typeof e.target.className.includes === 'function'
        && (e.target.className.includes('do-not-expand')
          || e.target.parentNode.className.includes('do-not-expand'))
      )) {
      return;
    }

    if (this.props.onClick) {
      this.props.onClick(row);
    } else {
      this._setSelectedRow(index !== this.state.selectedRowIndex ? index : -1);
    }
  };

  _setSelectedRow = (index) => {
    const filteredData = this._filterDataAndSortData();
    this.setState({
      selectedRowIndex: index,
      wasExpandedIndex: this.state.selectedRowIndex,
      selectedItem: filteredData[index] || filteredData[index] === 0 ? filteredData[index] : -1,
    });

    setTimeout(() => {
      this.setState({
        wasExpandedIndex: -1,
      });
    }, 500);
  };

  _inverseOrderIn = (orderIn) => {
    if (orderIn === 'asc') {
      return 'desc';
    }
    if (orderIn === 'desc') {
      return 'asc';
    }
  };

  _sortClassNames = (item) => {
    const { dataKey, sort } = item;
    return classNames(
      { 'mdi pointer': sort },
      { 'mdi-chevron': (this.state.sortBy !== dataKey && sort) },
      { 'mdi-chevron-down': (this.state.sortBy === dataKey && this.state.orderIn === 'desc') },
      { 'mdi-chevron-up': (this.state.sortBy === dataKey && this.state.orderIn === 'asc') }
    );
  };

  _thClassNames = (sort) => classNames(
    { pointer: sort }
  );

  _headerRow = () => {
    const {
      columns,
      doNotExpand,
      hasActions,
      iconClass,
      onClick,
      rightActions,
    } = this.props;

    const notExpandable = Boolean(doNotExpand) || Boolean(onClick);

    return (
      <thead>
        <tr className="fixedHeight">
          {(!notExpandable
            || (hasActions > 0 && !rightActions)
            || (notExpandable && (!hasActions || (hasActions && rightActions)) && iconClass))
            && <th scope="col"><span className="sr-only">Hidden Content Container</span></th>}
          {
            columns.map((item) => {
              if (item.dataKey === 'actionButton' && typeof item.headerRenderer === 'function') {
                return (
                  <th
                    scope="col"
                    className={this._thClassNames(item.sort)}
                    key={item.dataKey}
                  >
                    {item.headerRenderer()}
                  </th>
                );
              }
              return (
                <th
                  scope="col"
                  className={this._thClassNames(item.sort)}
                  key={item.dataKey}
                  onClick={() => { this._handleSort(item); }}
                >
                  <span className="small">{(typeof item.label === 'function') ? item.label() : item.label}</span>
                  <span className={this._sortClassNames(item)} />
                </th>
              );
            })
          }
          {hasActions && rightActions
            && <th scope="col">Actions</th>}
        </tr>
      </thead>
    );
  };

  _dataRow = (row, index) => {
    const {
      columns, rowRenderer, doNotExpand, hasActions, rightActions, iconClass,
    } = this.props;
    const expanded = index === this.state.selectedRowIndex;
    const wasExpanded = index === this.state.wasExpandedIndex;

    const notExpandable = Boolean(doNotExpand) || Boolean(this.props.onClick);
    const uniqueId = `options-${this.state.id}-${index}`;

    let actionContent = null;
    if (_try(() => typeof this.props.generateActionContent === 'function')) {
      actionContent = this.props.generateActionContent(row);
    } else {
      actionContent = row.actionContent;
    }

    return (
      <>
        <tr
          style={(!expanded && this.state.selectedRowIndex !== -1 && { opacity: '.2' }) || {}}
          className={classNames('fixedHeight', {
            clickable: !doNotExpand,
            'do-not-expand': doNotExpand,
          }, { active: expanded })}
          onClick={(e) => { this._handleRowClick(row, index, e, doNotExpand); }}
        >
          {((!notExpandable
            && (!hasActions || (hasActions && rightActions)))
            || (notExpandable && (!hasActions || (hasActions && rightActions)) && iconClass)) && (
              <th className={classNames('fixedWidth', 'wpx-50', 'text-center', 'expandIcon')}>
                <i
                  className={(iconClass && classNames('mdi', iconClass))
                    || (row.iconClass && classNames('mdi', row.iconClass))
                    || classNames('mdi', 'mdi-chevron-right', 'table-arrow', expanded && 'rotate90')}
                />
              </th>
            )}
          {(hasActions && !rightActions) && (
            <th
              id={uniqueId}
              role="button"
              className={classNames('fixedWidth', 'wpx-50', 'text-center', 'popover-cell', {
                disabled: !_try(() => actionContent.length),
              })}
              onClick={(e) => {
                e.stopPropagation();
                if (!_try(() => actionContent.length)) { return; }
                this._onClickTogglePopover(index);
              }}
            >
              <i className={(this.props.popoverIconClass && classNames('mdi', this.props.popoverIconClass))
                || classNames('mdi', 'mdi-dots-vertical')}
              />
              <Popover
                placement={'right'}
                isOpen={this.state.popoverOpenIndex === index}
                target={uniqueId}
                toggle={() => { this._onClickTogglePopover(index); }}
                trigger="legacy"
                className="components_tables_components_collapsabletable action-popover"
              >
                <PopoverBody>
                  {
                    (_try(() => actionContent) || []).map((item, i) => {
                      const {
                        title,
                        disabled,
                        onDisabledClick,
                        onDisabledDoubleClick,
                      } = item;

                      return (
                        <>
                          {i > 0 && <hr className="my-1" />}
                          <p
                            className={`m-0 action-item px-1${disabled ? ' disabled' : ''}`}
                            onClick={(e) => {
                              e.preventDefault();
                              if (disabled && onDisabledClick) {
                                if (typeof onDisabledClick === 'function') { onDisabledClick(); }
                                this._onClickTogglePopover();
                              }
                              if (disabled && onDisabledDoubleClick) {
                                if (this.state.disabledClickCount) {
                                  if (typeof onDisabledDoubleClick === 'function') { onDisabledDoubleClick(); }
                                  this._onClickTogglePopover();
                                } else {
                                  this.setState({ disabledClickCount: 1 });
                                  setTimeout(() => { this.setState({ disabledClickCount: 0 }); }, 300);
                                }
                              }
                              if (!disabled && item.onClick) {
                                if (typeof item.onClick === 'function') { item.onClick(); }
                                this._onClickTogglePopover();
                              }
                            }}
                          >
                            {title}
                          </p>
                        </>
                      );
                    })
                  }
                </PopoverBody>
              </Popover>
            </th>
          )}
          {
            columns.map((column) => {
              const defaultValue = column.default;
              let data = row[column.dataKey];
              if (data === undefined || data === null) {
                // Remember data can be boolean or empty string
                data = defaultValue;
              }
              if (column.dataKey === 'index') {
                data = index + 1;
                return (<td className="fixedWidth">{data}</td>);
              }
              if (column.cellRenderer) {
                return (<td className="fixedWidth"> {column.cellRenderer(data)} </td>);
              }
              return (<td className="fixedWidth">{data}</td>);
            })
          }
          {hasActions && rightActions && (
            <th
              id={`options-${this.state.id}-${index}`}
              role="button"
              className={classNames('fixedWidth', 'wpx-50', 'text-center', 'popover-cell', {
                disabled: !_try(() => actionContent.length),
              })}
              onClick={(e) => {
                e.stopPropagation();
                if (!_try(() => actionContent.length)) { return; }
                this._onClickTogglePopover(index);
              }}
            >
              <i className={(this.props.popoverIconClass && classNames('mdi', this.props.popoverIconClass))
                || classNames('mdi', 'mdi-dots-horizontal')}
              />
              <Popover
                placement={'left'}
                isOpen={this.state.popoverOpenIndex === index}
                target={`options-${this.state.id}-${index}`}
                toggle={() => this._onClickTogglePopover(index)}
                trigger="legacy"
                className="components_tables_components_collapsabletable action-popover"
              >
                <PopoverBody>
                  {
                    (_try(() => actionContent) || []).map((item, i) => {
                      const {
                        title,
                        disabled,
                        onDisabledClick,
                        onDisabledDoubleClick,
                      } = item;

                      return (
                        <>
                          {i > 0 && <hr className="my-1" />}
                          <p
                            className={`m-0 action-item px-1${disabled ? ' disabled' : ''}`}
                            onClick={(e) => {
                              e.preventDefault();
                              if (disabled && onDisabledClick) {
                                if (typeof onDisabledClick === 'function') { onDisabledClick(); }
                                this._onClickTogglePopover();
                              }
                              if (disabled && onDisabledDoubleClick) {
                                if (this.state.disabledClickCount) {
                                  if (typeof onDisabledDoubleClick === 'function') { onDisabledDoubleClick(); }
                                  this._onClickTogglePopover();
                                } else {
                                  this.setState({ disabledClickCount: 1 });
                                  setTimeout(() => { this.setState({ disabledClickCount: 0 }); }, 300);
                                }
                              }
                              if (!disabled && item.onClick) {
                                if (typeof item.onClick === 'function') { item.onClick(); }
                                this._onClickTogglePopover();
                              }
                            }}
                          >
                            {title}
                          </p>
                        </>
                      );
                    })
                  }
                </PopoverBody>
              </Popover>
            </th>
          )}
        </tr>
        <tr className="collapsableRow">
          <td colSpan={columns.length + 1}>
            <Collapse isOpened={expanded} hasNestedCollapse>
              {(expanded || wasExpanded || this.props.alwaysRenderRow) && _try(() => rowRenderer(row))}
            </Collapse>
          </td>
        </tr>
      </>
    );
  };

  _onClickTogglePopover = (index) => {
    this.setState((prevState) => ({
      popoverOpenIndex: prevState.popoverOpenIndex === index ? -1 : index,
    }));
  };

  _filterDataAndSortData = () => {
    const {
      data, searchText, secondarySearchText, filter, secondaryFilter,
    } = this.props;
    const secondarySortBy = (this.state.secondarySortKey)
      ? this.state.secondarySortKey
      : this.props.secondarySortBy;

    const { sortBy } = this.state;
    const { sortKey } = this.state;

    let filteredData = data.map((item, index) => index);
    // filter value can be boolean
    if (filter && filter.filterBy !== null && filter.filterValue !== null && filter.filterValue !== '') {
      filteredData = filteredData.filter((index) => (data[index][filter.filterBy] === filter.filterValue));
    }

    // secondary filter
    if (secondaryFilter && secondaryFilter.filterBy !== null && secondaryFilter.filterValue !== null && secondaryFilter.filterValue !== '') {
      filteredData = filteredData.filter((index) => (data[index][secondaryFilter.filterBy] === secondaryFilter.filterValue));
    }

    if (searchText) {
      const regex = new RegExp(escapeRegExp(searchText.toLowerCase()));
      filteredData = filteredData.filter((index) => {
        const rowasstr = JSON.stringify(data[index]);
        const matchFound = regex.test(rowasstr.toLowerCase());
        return matchFound;
      });
    }

    if (secondarySearchText) {
      const regex = new RegExp(escapeRegExp(secondarySearchText.toLowerCase()));
      filteredData = filteredData.filter((index) => {
        const rowasstr = JSON.stringify(data[index]);
        return regex.test(rowasstr.toLowerCase());
      });
    }

    filteredData.sort((a, b) => {
      const dataA = sortKey ? (data[a][sortBy] && data[a][sortBy][sortKey]) : data[a][sortBy];
      const dataB = sortKey ? (data[b][sortBy] && data[b][sortBy][sortKey]) : data[b][sortBy];

      if (dataA < dataB) { return -1; }
      if (dataA > dataB) { return 1; }
      if (secondarySortBy && sortBy !== secondarySortBy) {
        if (data[a][secondarySortBy] < data[b][secondarySortBy]) { return -1; }
        if (data[a][secondarySortBy] > data[b][secondarySortBy]) { return 1; }
      }
      return 0;
    });

    if (this.state.orderIn === 'desc') { filteredData.reverse(); }

    return filteredData;
  };

  handlePageClick = (data) => {
    const { selected } = data;
    const startingIndex = selected * this.state.numberOfRowsPerPage;
    const endingIndex = selected * this.state.numberOfRowsPerPage + this.state.numberOfRowsPerPage;

    this.setState({
      startingIndex,
      endingIndex,
      currentPage: selected,
    });
  };

  render() {
    const filteredData = this._filterDataAndSortData();
    const filteredDataToDisplay = this.props.paginatedTable ? filteredData.slice(this.state.startingIndex, this.state.endingIndex) : filteredData;

    if (this.props.setInScope) {
      const currentlyInScope = filteredDataToDisplay.reduce((acc, cur) => {
        const item = this.props.data[cur];
        if (item._id) { acc[item._id] = true; } else { acc[item.id] = true; }
        return acc;
      }, {});
      this.props.setInScope(currentlyInScope);
    }
    // check to see if the current item doens't match the selected item
    const newSelectedItem = filteredData[this.state.selectedRowIndex] || filteredData[this.state.selectedRowIndex] === 0 ? filteredData[this.state.selectedRowIndex] : -1;
    if (newSelectedItem !== this.state.selectedItem) {
      this.setState({ selectedRowIndex: -1, selectedItem: -1 });
    }

    const numberOfColumns = this.props.columns.length + 1 + (this.props.hasActions && this.props.rightActions ? 1 : 0);

    return (
      <div className={`components_tables_components_collapsabletable table-scroll-container${this.props.nestedTable ? ' nested-table' : ''}`}>
        <table className={`table responsive${this.props.paginatedTable ? ' paginate_table' : ''}`}>
          {this._headerRow()}
          {
            filteredData.length
              ? filteredDataToDisplay.map((item, index) => this._dataRow(this.props.data[item], index))
              : (<tr><td colSpan={numberOfColumns} className="text-center"><i><small>{this.props.noDataText || 'No data available'}</small></i></td></tr>)
          }
        </table>
        {this.props.paginatedTable
          && (
            <div className="row mt-3">
              <div className="col-xs-12 col-md-4">
                <div className="d-flex align-items-center h-100">
                  <div className="paginate_info">Showing {filteredData.length > 0 ? this.state.startingIndex + 1 : filteredData.length} to {this.state.endingIndex > filteredData.length ? filteredData.length : this.state.endingIndex} of {filteredData.length}</div>
                </div>
              </div>
              <div className="col-xs-12 col-md-8 mt-4 mt-md-0">
                <div className="d-flex align-items-center justify-content-start justify-content-md-end h-100">
                  <ReactPaginate
                    previousLabel="Previous"
                    previousClassName="paginate_page previous"
                    previousLinkClassName="paginate_button"
                    nextLabel="Next"
                    nextClassName="paginate_page next"
                    nextLinkClassName="paginate_button"
                    breakLabel={<span className="ellipsis">...</span>}
                    breakClassName="paginate_page"
                    pageLinkClassName="paginate_button"
                    pageClassName="paginate_page"
                    pageCount={Math.ceil(filteredData.length / this.state.numberOfRowsPerPage)}
                    marginPagesDisplayed={1}
                    pageRangeDisplayed={3}
                    onPageChange={this.handlePageClick}
                    containerClassName="paginatedTable_paginate p-0"
                    activeClassName="current"
                    forcePage={this.state.currentPage}
                  />
                </div>
              </div>
            </div>
          )}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_components_collapsabletable);


