import { connect, Component, bindActionCreators, Fragment } from 'component';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import overlayFactory from 'react-bootstrap-table2-overlay';
import { DragDropContext } from 'react-beautiful-dnd';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => {
  return ({
    transactions: state.transactionDetails.data.items,
    status: state.transactionDetails.status,
  });
};

const mapDispatchToProps = (dispatch) => {
  return ({});
};

class components_datatable extends Component {

  state = {};





  render() {
    const { data, columns, defaultSorted, onTableChange, handleCustomize, status } = this.props;

    if (!Object.keys(data).length) return <div style={{ minHeight: '500px' }}><Components.spinner /></div>;

    return (
      <div className={'components_datatable'}>
        <ToolkitProvider
          bootstrap4
          keyField="_id"
          data={data}
          columns={columns}
          search
        >
          {
            props => (
              <Fragment>
                <Components.forms.reportsearch
                  {...props.searchProps}
                  handleCustomize={handleCustomize || this.handleCustomize}
                />
                <BootstrapTable
                  {...props.baseProps}
                  defaultSorted={defaultSorted}
                  pagination={paginationFactory()}
                  overlay={overlayFactory({ spinner: true, background: 'rgba(192,192,192,0.3)' })}
                  bordered={false}
                  onTableChange={onTableChange || this.onTableChange}
                  wrapperClasses={'w-100 pb-5'}
                  hover
                  striped
                  loading={status.fetching}
                />
              </Fragment>
            )
          }
        </ToolkitProvider>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_datatable);


