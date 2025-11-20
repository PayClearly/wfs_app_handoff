import { connect, Component } from 'component';
import { cloneElement } from 'react';

// Third Party Imports ...

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';


const mapStateToProps = (state) => ({
  status: _try(() => state.account.kyc.status, {}),
  customers: _try(() => state.account.kyc.data.items.customers, {}),
  providerTheme: Selectors.providerTheme(state),
  forms: state.forms,
});

const mapDispatchToProps = (dispatch) => ({
  openAreYouSureModal: (data) => { dispatch(Store.router.openModal('Components.modals.areyousure', data)); },
  removeEnrollment: (id) => dispatch(Store.account.deleteCustomerEnrollment(id)),
  updateCustomerEnrollment: (data, id) => dispatch(Store.account.updateCustomerEnrollment(data, id)),
  retrieveCustomerEnrollments: () => dispatch(Store.account.retrieveCustomerEnrollments()),
});

// eslint-disable-next-line camelcase
class components_tables_customerEnrollments extends Component {
  state = {
    columns: [
      { label: 'First Name', dataKey: 'firstName', sortable: false },
      { label: 'Last Name', dataKey: 'lastName', sortable: false },
      {
        label: 'Status',
        dataKey: 'status',
        sortable: false,
        cellRenderer: (data) => (data === 'pass'
          ? <span className="badge rounded-pill bg-primary">{Utils.capitalize(data)}</span>
          : <span className="badge rounded-pill bg-danger">{Utils.capitalize(data)}</span>),
      },
      {
        label: '', dataKey: '_id', sortable: false, cellRenderer: (data) => this.actionButtonRenderer(data),
      },
    ],
  };

  componentDidMount() { this.props.retrieveCustomerEnrollments(); }

  actionButtonRenderer = (id) => {
    const { customers, removeEnrollment, status } = this.props;
    const data = customers[id];
    return (
      <span>
        <Components.button
          onClick={() => {
            this.props.openAreYouSureModal({
              title: 'Remove User Enrollment',
              content: `You are about to remove ${data.firstName} ${data.lastName}.`,
              noText: 'No',
              yesText: 'Yes',
              onYes: () => removeEnrollment(id),
            });
          }}
          className="btn btn-danger do-not-expand"
          type="button"
          aria-label="remove button"
          disabled={status.updating || false}
          buttonText="Remove"
        />
      </span>
    );
  };

  rowRenderer = (rowId, rowData) => {
    switch (rowData.status) {
      case 'partial':
      case 'fail':
      case 'error':
        return (
          <div className="p-4">
            <div className="row">
              <div className="col-12 mb-3">
                <div className="alert alert-warning" role="alert">
                  Please address the error or contact our support team at
                  <strong>{this.props.providerTheme.supportPhone}</strong> or
                  <a href={`mailto:${this.props.providerTheme.supportEmail}`}>
                    <strong>{this.props.providerTheme.supportEmail}</strong>
                  </a>.
                </div>
              </div>
            </div>
            {rowData.providerMessage
              && (
                <div className="row">
                  <div className="col-12 mb-3">
                    <strong>{Utils.capitalize(rowData.providerName)} instructions:</strong> {rowData.providerMessage}
                  </div>
                </div>
              )}
            {rowData._lastErrorMessage
              && (
                <div className="row">
                  <div className="col-12 mb-3">
                    <strong>Error:</strong> {rowData._lastErrorMessage}
                  </div>
                </div>
              )}
            {
              <>
                <hr className="m-0 mb-1" />
                <h3 className="card-title mt-1 mb-2">Update User</h3>
                {
                  cloneElement(this.props.children, { id: rowData._id })
                }
                <div className={'row'}>
                  <div className={'col-12'}>
                    <Components.button
                      onClick={() => {
                        this.updateCustomer(rowData._id);
                      }}
                      className="btn btn-primary mt-0"
                      type="button"
                      aria-label="submit button"
                      disabled={false}
                      buttonText={'Update'}
                    />
                  </div>
                </div>
              </>
            }
          </div>
        );
      case 'pass':
      default:
        return (
          <div className="p-4">
            <div className="row">
              <div className="col-12">
                <div className="alert alert-primary" role="alert">
                  Customer was successfully enrolled!
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  updateCustomer = (id) => {
    const form = _try(() => this.props.forms[this.props.updateFormName][this.props.updateFormKey]) || {};
    const formFields = Object.keys(form._values);
    const updatedFormFields = formFields.filter((fieldKey) => form[fieldKey].initial !== form[fieldKey].value);
    const updatedFormData = updatedFormFields.reduce((acc, curr) => {
      acc[curr] = form[curr].value;
      return acc;
    }, {});
    this.props.updateCustomerEnrollment(updatedFormData, id);
  };

  render() {
    const { customers } = this.props;

    return (
      <>
        <h2 className="card-title mb-2">Users</h2>
        <Components.tables.components.collapsibleTable
          tableName="Components.tables.customerEnrollments"
          tableKey={this.props.tableKey}
          initialTableStateOverride={this.props.initialTableStateOverride}
          defaultTableState={{
            sort: {
              sortKey: 'name',
              orderIn: 'asc',
            },
          }}
          data={{
            items: customers,
            count: _try(() => Object.keys(customers).length, 0),
          }}
          rowRenderer={this.rowRenderer}
          itemOrder={Object.keys(this.props.customers)}
          columns={this.state.columns}
          typeForNoDataText="User Enrollments"
          enableExportCSV={false}
        />
        <hr className="mt-0" />
      </>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_customerEnrollments);
