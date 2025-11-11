import { connect, Component, bindActionCreators, Fragment } from 'component';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    countryCodes: Selectors.countryCodes(),
    vendor: state.account.accountVendors.data.items[props.id] || {},
    forms: state.forms,
    status: state.account.accountVendors.status,
    policies: Selectors.entity('accountVendors_idOrganization_idAccount')(state),

  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    updateVendor: (vendor) => {
      dispatch(Store.account.updateAccountVendor(vendor));
    },
    clearStatusErrors: () => {
      return dispatch(Store.account.clearErrorsAccountVendors());
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_entities_checkAddress extends Component {

  state = {
    formName: 'Components.forms.checkAddress',
    editBtnText: 'Edit Address',
  }




  onSubmit = () => {
    const { _values } = this.props.forms[this.state.formName][this.props.id];

    this.props.updateVendor({
      name: this.props.vendor.name,
      ..._values,
      checkAddressUserForceValidated: null,
      checkAddressValidated: null,
    });
  }

  onCancel = () => {
    this.setState({ blurAll: false });
  }

  render() {
    const { canRead, canUpdate, canDelete } = this.props.policies;
    const countryCodes = this.props.countryCodes;
    const form = _try(() => this.props.forms[this.state.formName][this.props.id], {});
    const checkAddressExists = _try(() => this.props.vendor.checkAddressLine1 || this.props.vendor.checkAddressLine2 || this.props.vendor.checkCity || this.props.vendor.checkStateProv || this.props.vendor.checkPostalCode);

    return (
      <Components.entities.entitywrapper
        canRead={canRead}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onSubmit={this.onSubmit}
        updating={this.props.status.updating}
        error={this.props.status.updatingError}
        updateDisabled={this.props.status.updating || !form._allValid || form._allInitial}
        editBtnText={checkAddressExists ? this.state.editBtnText : 'Add Address'}
        orgId={this.props.orgId}
        accountId={this.props.accountId}
        onDisabledClick={() => this.setState({ blurAll: true })}
        onCancel={this.onCancel}
        clearStatusErrors={this.props.clearStatusErrors}
      >
        <Fragment>
          {checkAddressExists ?
            <Fragment>
              <div className="row">

                <div className="col-12 mb-0">
                  <p><strong>Entered Address</strong></p>
                  <p className="mb-0">{this.props.vendor.checkAddressLine1}</p>
                  <p className="mb-0">{this.props.vendor.checkAddressLine2}</p>
                  <p className="mb-0">{this.props.vendor.checkCity ? `${this.props.vendor.checkCity}, ` : ''}{this.props.vendor.checkStateProv || ''} {this.props.vendor.checkPostalCode || ''}</p>
                  <p>{this.props.vendor.checkCountry ? countryCodes[this.props.vendor.checkCountry] : ''}</p>
                </div>
              </div>
              <div className="row">

                {
                  this.props.validatedAddress &&
                  <div className="col-12 mb-0">
                    <p><strong>Recommended Address</strong></p>
                    <p className="mb-0">{this.props.validatedAddress.checkAddressLine1}</p>
                    <p className="mb-0">{this.props.validatedAddress.checkAddressLine2}</p>
                    <p className="mb-0">{this.props.validatedAddress.checkCity ? `${this.props.validatedAddress.checkCity}, ` : ''}{this.props.validatedAddress.checkStateProv || ''} {this.props.validatedAddress.checkPostalCode || ''}</p>
                    <p>{this.props.validatedAddress.checkCountry ? countryCodes[this.props.validatedAddress.checkCountry] : ''}</p>
                  </div>
                }

                {
                  this.props.status.fetching && !this.props.validatedAddress &&
                  <div className="col-12">
                    <Components.spinner />
                  </div>
                }
                {
                  _try(() => this.props.status.fetchingError) &&
                  <div className="col-12">
                    <div className="alert alert-danger" role="alert">
                      <h4 className="alert-heading">Invalid Address</h4>
                      Error: {this.props.status.fetchingError}
                    </div>
                  </div>
                }
              </div>
            </Fragment>
            :
            <div className="alert alert-warning" role="alert">
              <h4 className="alert-heading">No Address Set</h4>
              Please add a check delivery address for this vendor
            </div>
          }
        </Fragment>
        <Components.forms.checkAddress
          formKey={this.props.id}
          initialData={this.props.vendor}

        />
      </Components.entities.entitywrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_entities_checkAddress);


