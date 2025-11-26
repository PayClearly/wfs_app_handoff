import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
import api from 'api/achIntegration';


const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    policies: Selectors.entity('achIntegration_idOrganization_idAccount')(state),
    status: state.account.achIntegration.status,
    organizationId: state.organization.data.id,
    accountId: state.account.data.id,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    createACHAccount: (data) => {
      return dispatch(Store.account.updateIntegration('achIntegration', { type: 'createAccount', data }));
    },
    updateACHAccount: (data) => {
      return dispatch(Store.account.updateIntegration('achIntegration', { type: 'updateAccount', data }));
    },
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
    clearStatusErrors: () => {
      return dispatch(Store.account.clearErrorsIntegration('achIntegration'));
    },
    fetchBusinessClassifications: () => {
      return dispatch(Store.account.fetchDwollaBusinessClassifications());
    },
  });
};

class components_integrationcomps_achintegration_DWOLLA_creators_achaccount extends Component {

  state = {
    formKey: 'create',
    loadingBusinessClassifications: true,
  };

  componentDidMount() {
    const { organizationId, accountId } = this.props;

    api.getGroviderSetupResource(organizationId, accountId, 'businessClassifications').then((data) => {
      const items = data.data.data;
      const businessClassificationsOptions = Object.values(items).reduce((acc, classification) => {
        const toReturn = { ...acc };
        toReturn[classification.id] = {
          display: classification.name,
          subOptions: {},
        };

        classification._embedded['industry-classifications'].forEach((industryClassification) => {
          toReturn[classification.id].subOptions[industryClassification.id] = {
            display: industryClassification.name,
          };
        });

        return toReturn;
      }, {});
      this.setState({ loadingBusinessClassifications: false, businessClassificationsOptions });
    });
  }


  onCreate = () => {
    this.setState(() => {
      return {
        showCreatedNotification: true,
      };
    });
  }

  submit = () => {
    const form = (this.props.forms['Components.integrationcomps.achintegration.DWOLLA.forms.createaccount'] && this.props.forms['Components.integrationcomps.achintegration.DWOLLA.forms.createaccount'][this.state.formKey]) || {};

    const data = this.adaptFormData({ ...form._values });
    if (this.props.retry) {
      this.props.updateACHAccount(data);
    } else {
      this.props.createACHAccount(data);
    }

    this.setState({ showACHAccountCreatedNotification: false });
  }

  testSubmit = () => {
    const form = (this.props.forms['Components.integrationcomps.achintegration.DWOLLA.forms.createaccount'] && this.props.forms['Components.integrationcomps.achintegration.DWOLLA.forms.createaccount'][this.state.formKey]) || {};

    const data = {
      adminFirstName: 'John',
      type: 'business',
      adminLastName: 'Doe',
      adminEmail: form._values.adminEmail || `CHANGE_ME_BACKUP_EMAIL`,
      controllerFirstName: form._values.controllerFirstName,
      controllerLastName: 'Doe',
      controllerTitle: 'CEO',
      controllerSSN: '1234',
      controllerDOB: '1990-02-01',
      controllerAddress1: '123 1st',
      controllerAddress2: '',
      controllerCity: 'Portland',
      controllerState: 'OR',
      controllerPostalCode: '97288',
      controllerCountry: 'US',
      businessAddress1: '234 2nd',
      businessAddress2: '',
      businessCity: 'Oakland',
      businessState: 'CA',
      businessPostalCode: '98223',
      businessName: 'Jane Corp',
      businessType: 'corporation',
      businessClassification: 'CHANGE_ME_BUSINESS_CLASSIFICATION',
      businessEIN: '12-3456789',
    };

    this.props.createACHAccount(this.adaptFormData(data));
    this.setState({ showACHAccountCreatedNotification: false });
  }

  adaptFormData(data) {
    return {
      firstName: data.adminFirstName, // The legal first name of the Account Admin or individual signing up the business verified Customer.
      lastName: data.adminLastName, // The legal last name of the Account Admin or individual signing up the business verified Customer.
      email: data.adminEmail,
      type: 'business',
      address1: data.businessAddress1,
      city: data.businessCity,
      state: data.businessState,
      postalCode: data.businessPostalCode,
      controller: {
        firstName: data.controllerFirstName,
        lastName: data.controllerLastName,
        title: data.controllerTitle,
        dateOfBirth: data.controllerDOB,
        ssn: data.controllerSSN,
        address: {
          address1: data.controllerAddress1,
          address2: data.controllerAddress2,
          city: data.controllerCity,
          stateProvinceRegion: data.controllerState,
          postalCode: data.controllerPostalCode,
          country: data.controllerCountry,
        },
      },
      businessClassification: data.businessClassification,
      businessType: data.businessType,
      businessName: data.businessName,
      ein: data.businessEIN,
      status: data.status,
    };
  }

  render() {
    if (this.state.loadingBusinessClassifications) {
      return (
        <Components.spinner />
      );
    }

    const { status } = this.props;

    const error = status.creatingError || status.updatingError;
    const creating = status.creating;
    const updating = status.updating;
    const form = (this.props.forms['Components.integrationcomps.achintegration.DWOLLA.forms.createaccount'] && this.props.forms['Components.integrationcomps.achintegration.DWOLLA.forms.createaccount'][this.state.formKey]) || {};
    const disabled = updating || creating || form._allInitial || !form._allValid;

    return (
      <Components.creators.creatorwrapper
        canCreate={this.props.policies.canCreate}
        createFormActive
        status={this.props.status}
        onCreate={this.onCreate}
        clearStatusErrors={this.props.clearStatusErrors}
      >
        <Fragment>
          <Components.integrationcomps.achintegration.DWOLLA.forms.createaccount
            formKey={this.state.formKey}
            blurAll={this.state.blurAll}
            disabled={updating}
            businessClassificationsOptions={this.state.businessClassificationsOptions}
            retry={this.props.retry}
          />
          {error &&
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Something Went Wrong</h4>
              Error: {error}
            </div>
          }
          {this.state.showACHAccountCreatedNotification &&
            <div className="alert alert-primary" role="alert">
              ACH Account application successfully delivered!
            </div>
          }
          <Components.button
            disabled={disabled}
            onClick={this.submit}
            buttonText={this.props.retry ? 'Resubmit ACH Account' : 'Create ACH Account'}
            updating={updating}
            onDisabledClick={() => { this.setState({ blurAll: true }); }}
          />
          {!this.props.retry &&
            <Components.button
              disabled={(form._values && !form._values.controllerFirstName)}
              onClick={this.testSubmit}
              buttonText={'TEST Create'}
              updating={updating}
              onDisabledClick={() => { this.setState({ blurAll: true }); }}
              className="ms-3 btn btn-warning"
            />
          }
        </Fragment>
      </Components.creators.creatorwrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_integrationcomps_achintegration_DWOLLA_creators_achaccount);


