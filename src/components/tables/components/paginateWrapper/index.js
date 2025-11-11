import {
  connect, Component, bindActionCreators, Fragment,
} from 'component';
import ReactPaginate from 'react-paginate';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => ({
  table: _try(() => state.tables[props.tableName][props.tableKey], {}),
  isOps: state.appConfig.data.metadata.name === 'ops',
  params: _resolve(state, 'router.route.params'),
});

const mapDispatchToProps = (dispatch, props) => ({
  setQueryParams: (data) => {
    dispatch(Store.router.setSearchQueryParams(data));
  },
  ...bindActionCreators(Store.tables, dispatch),
});

const mapResourcesToProps = (state, props) => ({});

class components_tables_components_paginateWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rowsPerPageOptions: [10, 25, 100, 200],
      haveDefaultSelectedRowId: !!props.defaultSelectedRowId,
    };
  }

  componentDidMount() {
    const {
      initialRowsPerPage, defaultSelectedRowId, itemOrder = [], params = {},
    } = this.props;
    let currentPage = params.page ? (Number(params.page) - 1) : 0;
    const rowsPerPage = Number(params.rowsPerPage) || initialRowsPerPage || 10;

    if (defaultSelectedRowId) {
      // handle defaulting to correct page if provided link to specific item
      const indexOfSelectedRow = itemOrder.findIndex((rowId) => rowId === defaultSelectedRowId);
      if (indexOfSelectedRow > 0) {
        currentPage = Math.floor(indexOfSelectedRow / rowsPerPage);
      }
    }

    this.props.changePagination(this.props.tableName, this.props.tableKey, {
      rowsPerPage,
      currentPage,
    });
  }

  componentWillReceiveProps(nextProps = {}) {
    if ((_try(() => this.props.itemOrder.length !== nextProps.itemOrder.length)) && (_try(() => this.props.data.count === nextProps.data.count))) {
      if (this.state.haveDefaultSelectedRowId) {
        this.setState({ haveDefaultSelectedRowId: false });
      } else {
        const stateToSet = {
          currentPage: 0,
        };
        this.props.changePagination(nextProps.tableName, nextProps.tableKey, stateToSet);
      }
    } else if ((_try(() => this.props.itemOrder.length !== nextProps.itemOrder.length))) {
      // the number of items rendered has changed, check to see if we've been left on an invalid page number
      const { pagination = {} } = nextProps.table || {};
      const { rowsPerPage, currentPage } = pagination;
      const itemCount = nextProps.itemOrder.length;

      const maxPage = itemCount ? Math.ceil(itemCount / rowsPerPage) - 1 : 0;
      if (currentPage > maxPage) {
        this.props.changePagination(nextProps.tableName, nextProps.tableKey, { currentPage: maxPage });
      }
    } else if (nextProps.params && (_try(() => this.props.params.page) !== nextProps.params.page || _try(() => this.props.params.rowsPerPage) !== nextProps.params.rowsPerPage)) {
      // use new page number and rows per page if these query params change in the url
      const currentPage = nextProps.params.page ? (Number(nextProps.params.page) - 1) : 0;
      const rowsPerPage = Number(nextProps.params.rowsPerPage) || this.props.initialRowsPerPage || 10;
      nextProps.changePagination(nextProps.tableName, nextProps.tableKey, { currentPage, rowsPerPage });
    }

    // reset pagination based on certain props changes
    // DONE: if number of items changes (based on filter or search)
    // if sort changes (maybe this one)
  }

  componentWillUnmount() { }

  _handlePageClick = (data) => {
    const { selected } = data;

    this.props.changePagination(this.props.tableName, this.props.tableKey, {
      currentPage: selected,
    });

    if (this.props.isOps) {
      const params = this.props.params || {};
      this.props.setQueryParams({ ...params, page: selected + 1 });
    }
  };

  _handleRowsPerPageChange = (e) => {
    this.props.changePagination(this.props.tableName, this.props.tableKey, {
      rowsPerPage: parseInt(e.target.value, 10),
      currentPage: 0,
    });

    if (this.props.isOps) {
      const params = this.props.params || {};
      this.props.setQueryParams({ ...params, rowsPerPage: e.target.value });
    }
  };


  render() {
    const { table, itemOrder, hideRowsPerPageSelector } = this.props;
    const { currentPage, rowsPerPage } = table.pagination || {};
    const startingIndex = currentPage * rowsPerPage;
    const endingIndex = startingIndex + rowsPerPage;
    const itemsLength = this.props.keysLength ? this.props.keysLength : itemOrder.length;
    const pageCount = Math.ceil(itemsLength / rowsPerPage);

    return (
      <div className="components_tables_components_paginateWrapper">
        {this.props.children}
        <div className="row mt-3 mb-2 justify-content-center justify-content-md-end">
          {!hideRowsPerPageSelector
            && <div className="col-auto">
              <div className="h-100 d-flex align-items-center">
                <h6 className="mb-0" style={{ whiteSpace: 'nowrap' }}>Rows per Page:&nbsp;&nbsp;</h6>
                <select className="form-control small" onChange={(e) => this._handleRowsPerPageChange(e)}>
                  {this.state.rowsPerPageOptions.map((value) => <option value={value} selected={value === rowsPerPage}>{value}</option>)}
                </select>
              </div>
            </div>}
          <div className="col-auto">
            <div className="d-flex align-items-center h-100">
              <div className="paginate_info">{itemsLength > 0 ? startingIndex + 1 : itemsLength}-{endingIndex > itemsLength ? itemsLength : endingIndex} of {itemsLength}</div>
            </div>
          </div>
          <div className="col-auto mt-4 mt-md-0">
            <div className="d-flex align-items-center justify-content-end h-100">
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
                pageCount={pageCount}
                marginPagesDisplayed={1}
                pageRangeDisplayed={3}
                onPageChange={this._handlePageClick}
                containerClassName="paginatedTable_paginate p-0"
                activeClassName="current"
                forcePage={currentPage}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_tables_components_paginateWrapper);


