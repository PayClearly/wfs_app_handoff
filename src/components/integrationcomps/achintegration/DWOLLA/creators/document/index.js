import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    policies: Selectors.entity('achIntegration_idOrganization_idAccount')(state),
    status: state.account.achIntegration.status,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    submitAchDocument: (data, query) => {
      return dispatch(Store.account.updateIntegration('achIntegration', { type: 'addDocument', data }));
    },
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
    clearStatusErrors: () => {
      return dispatch(Store.account.clearErrorsIntegration('achIntegration'));
    },
  });
};

class components_integrationcomps_achintegration_DWOLLA_creators_document extends Component {

  state = {
    formKey: 'create',
  };

  componentDidMount() { }
  componentWillUnmount() { }

  onDocumentDrop = (files) => {
    this.setState({
      acceptedDocuments: files,
    });
  };

  submit = () => {
    const form = (this.props.forms['Components.integrationcomps.achintegration.DWOLLA.forms.accountdocument'] && this.props.forms['Components.integrationcomps.achintegration.DWOLLA.forms.accountdocument'][this.state.formKey]) || {};

    const file = {
      name: this.state.acceptedDocuments[0].name,
      preview: this.state.acceptedDocuments[0].preview,
      size: this.state.acceptedDocuments[0].size,
      type: this.state.acceptedDocuments[0].type,
    };

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(this.state.acceptedDocuments[0]);
      reader.onload = () => resolve(reader.result);
    })
      .then((contents) => {
        const data = {
          file: {
            contents,
            ...file,
          },
          documentType: form._values.documentType,
          documentContext: this.props.documentContext,
        };
        this.props.submitAchDocument(data);
        // this.setState({ showACHAccountCreatedNotification: false });
      });

  }

  render() {
    const { status } = this.props;

    const error = status.creatingError || status.updatingError;
    const creating = status.creating;
    const updating = status.updating;
    const form = (this.props.forms['Components.integrationcomps.achintegration.DWOLLA.forms.accountdocument'] && this.props.forms['Components.integrationcomps.achintegration.DWOLLA.forms.accountdocument'][this.state.formKey]) || {};
    const documentIsValid = this.state.acceptedDocuments && this.state.acceptedDocuments.length === 1;
    const disabled = updating || creating || form._allInitial || !form._allValid || !documentIsValid;

    let uploadError = '';

    if (!this.state.acceptedDocuments) {
      uploadError = 'A document must be uploaded';
    } else if (this.state.acceptedDocuments !== 1) {
      uploadError = 'Only one document can be uploaded';
    }

    return (
      <Components.creators.creatorwrapper
        canCreate={this.props.policies.canCreate}
        createFormActive
        status={this.props.status}
        onCreate={this.onCreate}
        clearStatusErrors={this.props.clearStatusErrors}
      >
        <Fragment>
          <Components.integrationcomps.achintegration.DWOLLA.forms.accountdocument
            formKey={this.state.formKey}
            blurAll={this.state.blurAll}
            disabled={updating}
            onDocumentDrop={this.onDocumentDrop}
            acceptedDocuments={this.state.acceptedDocuments}
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
            buttonText="Submit Document"
            updating={updating}
            onDisabledClick={() => { this.setState({ blurAll: true }); }}
          />
          {this.state.blurAll && <span className="text-danger"><i className="ps-2 mdi mdi-alert-circle-outline text-danger" />&nbsp;{uploadError}</span>}
        </Fragment>
      </Components.creators.creatorwrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_integrationcomps_achintegration_DWOLLA_creators_document);


