import {
  connect, Component, Fragment,
} from 'component';

// Third Party Imports ...
import classNames from 'classnames';
import { Collapse } from 'react-collapse';


import './index.scss';

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_uploaders_components_table extends Component {
  state = {
    expandedRowId: null,
    items: [],
  };

  componentDidMount() {
    // it needs a tick before anything is set up as valid so we wrap it in setTimeout
    setTimeout(() => this.setState({ items: this._sortItemsByValidity(this.props.data), itemsSet: true }), 0);
  }

  componentWillReceiveProps(nextProps = {}) {
    const newData = Object.keys(nextProps.data || {});
    const currentData = Object.keys(this.props.data || {});
    if (_try(() => !this.state.items.length) && !this.state.itemsSet) {
      this.setState({ items: this._sortItemsByValidity(nextProps.data), itemsSet: true });
    }
    if (_try(() => newData.length) < _try(() => currentData.length)) {
      this.setState({ expandedRowId: null });
    }
    if (_try(() => newData.length) !== _try(() => currentData.length)) {
      this._updateItems(newData);
    }
    // when they are both 1 someone is manually creating a new item
    if (_try(() => newData.length === 1) && _try(() => currentData.length === 1)) {
      this.setState({ expandedRowId: newData[0] });
    }
  }

  _sortItemsByValidity = (data) => {
    // so not a real "sort" but it places the items into two lists, ready and not ready, and then concatenates them
    let rowIds = Object.keys(data || {});
    const items = rowIds.reduce((acc, cur) => {
      const row = this.props.adapter(data[cur]);
      acc[cur] = row.valid || false;
      return acc;
    }, {});
    const notReady = rowIds.filter((id) => !items[id]);
    const ready = rowIds.filter((id) => items[id]);
    rowIds = [...notReady, ...ready];
    return rowIds;
  };

  _updateItems = (newData) => {
    // the table must manage its own state regarding what order items need to be displayed
    // preserve the correctt oreder
    let data = [...this.state.items];

    // an item was added
    if (newData.length > data.length) {
      const newItem = newData.filter((item) => !data.includes(item));
      data = [...data, ...newItem];
    }
    // an item was removed
    if (newData.length < data.length) { data = data.filter((item) => newData.includes(item)); }
    this.setState({ items: [...data] });
  };

  _headerRow = () => {
    const { columns } = this.props;
    return (
      <thead>
        <tr className="fixedHeight">
          <th scope="col" />
          {
            columns.map((item) => (
              <th
                scope="col"
                key={item.dataKey}
              >
                <span className="small">{item.label}</span>
              </th>
            ))
          }
        </tr>
      </thead>
    );
  };

  _dataRow = (rowId) => {
    const row = this.props.adapter(this.props.data[rowId]);
    const { columns, rowRenderer } = this.props;

    const expanded = this.state.expandedRowId === rowId;

    return (
      <Fragment key={rowId}>
        <tr
          style={(!expanded && this.state.expandedRowId && { opacity: '.2' } || {})}
          className={classNames('fixedHeight', 'clickable', { active: expanded })}
          onClick={(e) => { this.setState({ expandedRowId: this.state.expandedRowId !== rowId && rowId }); }}
        >
          <th className={classNames('fixedWidth', 'wpx-50', 'text-center', 'expandIcon')}>
            <i className={classNames('mdi', 'mdi-chevron-right', 'table-arrow', expanded && 'rotate90')} />
          </th>
          {
            columns.map((column) => {
              const defaultValue = column.default;
              let data = row[column.dataKey];
              if (data === undefined || data === null) {
                // Remember data can be boolean or empty string
                data = defaultValue;
              }
              if (column.cellRenderer) {
                return (<td className="fixedWidth"> {column.cellRenderer(data)} </td>);
              }
              return (<td className="fixedWidth">{data}</td>);
            })
          }
        </tr>
        <tr className="collapsableRow">
          <td colSpan={columns.length + 1}>
            <Collapse isOpened={expanded} hasNestedCollapse>
              {rowRenderer(row, expanded)}
            </Collapse>
          </td>
        </tr>
      </Fragment>
    );
  };

  _addAdditionalRow = () => {
    const { columns, lastRowActionButtons } = this.props;
    const colSpan = columns.length + 1;
    return (
      <tr
        className={classNames('fixedHeight', 'actionRow')}
      >
        <td
          className="fixedWidth"
          colSpan={colSpan}
        >
          <div className="d-flex justify-content-around">
            {lastRowActionButtons.map((actionButton, index) => (
              <div
                role="tooltip"
                style={{ width: `${100 / lastRowActionButtons.length}%` }}
                className={`d-flex justify-content-center action-button ${index === 0 && 'first'} ${(index === (lastRowActionButtons.length - 1)) && 'last'} no-select ${index > 0 && 'border-left'}`}
                onClick={() => {
                  const id = actionButton.action();
                  this.setState({ expandedRowId: id });
                }}
              >
                {actionButton.icon && <i className={`mdi ${actionButton.icon} ${actionButton.iconColor || 'text-primary'} me-2`} />}
                <span>{actionButton.text}</span>
              </div>
            ))}
          </div>
        </td>
      </tr>
    );
  };

  render() {
    const { lastRowActionButtons } = this.props;
    const { items } = this.state;
    const rowIds = items || [];

    // check to see if the current item doens't match the selected item
    return (
      <div className="components_uploaders_components_table table-scroll-container">
        <table className="table responsive">
          {this._headerRow()}
          {rowIds.map((id) => this._dataRow(id))}
          {_try(() => lastRowActionButtons.length) && this._addAdditionalRow()}
        </table>
      </div>
    );

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_uploaders_components_table);


