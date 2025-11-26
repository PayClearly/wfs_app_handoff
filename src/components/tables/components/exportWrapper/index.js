import { connect, Component, bindActionCreators, Fragment } from 'component';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import Utils from 'utils';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    table: _try(() => state.tables[props.tableName][props.tableKey], {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_tables_components_exportWrapper extends Component {
  state = {
    exporting: false,
    dropDownIsOpen: false,
  }

  componentWillReceiveProps(nextProps = {}) { }

  handleCSVExport = (type) => {
    const { table, columns = [], data = {}, itemOrder = [], paginate, exportFilePrefix } = this.props;
    const { currentPage, rowsPerPage } = table.pagination || {};
    const headers = columns.reduce((acc, column) => {
      if (column.disableExport) return acc;
      acc[column.dataKey] = column.label;
      return acc;
    }, {});

    let dataToExport;
    let fileName;
    if (type === 'all') {
      fileName = `all_${exportFilePrefix || 'table'}_export_${(new Date()).toLocaleDateString()}`;
      dataToExport = Object.values(data.items);
    } else if (type === 'searched' && Object.keys(table.filters || {}).length) {
      fileName = `searched_${exportFilePrefix || 'table'}_export_${(new Date()).toLocaleDateString()}`;
      dataToExport = itemOrder.map(id => data.items[id]);
    } else {
      fileName = `${exportFilePrefix || 'table'}_export_${(new Date()).toLocaleDateString()}`;
      let itemsToExport = itemOrder;
      if (paginate) itemsToExport = itemOrder.slice(currentPage * rowsPerPage, (currentPage * rowsPerPage) + rowsPerPage);
      dataToExport = itemsToExport.map(id => data.items[id]);
    }

    Utils.exportCSVFile(fileName, dataToExport, headers);
  }

  toggle = () => {
    this.setState((prevState) => {
      return { dropdownIsOpen: !prevState.dropdownIsOpen };
    });
  };

  render() {
    const { table, paginate } = this.props;
    const hasFilters = Object.keys(table.filters || {}).length;
    return (
      <div className={`components_tables_components_exportWrapper ${paginate ? 'mb-2 mt-2 mt-md-0 d-flex d-md-block justify-content-center' : 'no-pagination ms-1 my-1'}`}>
        <Dropdown isOpen={this.state.dropdownIsOpen} toggle={this.toggle} direction="down">
          <DropdownToggle caret className={'btn btn-outline-primary'}>
            Export CSV
          </DropdownToggle>
          <DropdownMenu>
            {paginate ?
              <DropdownItem onClick={e => this.handleCSVExport()}>
                <span className="mdi mdi-download">&nbsp;&nbsp;Current Page</span>
              </DropdownItem>
              :
              <Fragment />
            }
            {hasFilters ?
              <DropdownItem onClick={e => this.handleCSVExport('searched')}>
                <span className="mdi mdi-download">&nbsp;&nbsp;Searched Items</span>
              </DropdownItem>
              :
              <Fragment />
            }
            <DropdownItem onClick={e => this.handleCSVExport('all')}>
              <span className="mdi mdi-download-multiple">&nbsp;&nbsp;All Items</span>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_tables_components_exportWrapper);

