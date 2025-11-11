import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    integrations: Selectors.integrations(state),
    achAccountCredentialsStatus: state.account.achAccountCredentials.status,
    form: (state.forms && state.forms['Components.forms.achAccountCredentials'] && state.forms['Components.forms.achAccountCredentials'].setup) || {},
    forms: state.forms,
    fundingDetails: Selectors.funding(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    createIntegration: (data, fundingPreferencesData) => {
      dispatch(Store.account.updateachAccountCredentials(data, fundingPreferencesData));
    },
  });
};

class components_modals_achSetup extends Component {



  componentWillReceiveProps(nextProps) {
    if (nextProps.integrations.achFundingSource.linked) {
      this.props.close();
    }
  }



  onClose() {
    this.props.close();
  }

  submitClicked() {
    const fundingPreferencesForm = this.props.forms['Components.forms.fundingPreferences'].default;
    const fundingPreferencesData = {
      automaticFundingType: _try(() => fundingPreferencesForm._values.automaticFundingEnabled) ? _try(() => fundingPreferencesForm._values.automaticFundingType) : null,
      fundingStrategy: _try(() => fundingPreferencesForm._values.fundingStrategy) === 'earmark' ? 'earmark' : null,
    };

    this.props.createIntegration(this.props.form._values, fundingPreferencesData);
  }

  render() {
    const allValid = this.props.form._allValid;
    return (
      <div className="modal-dialog components_modals_achSetup" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title" id="exampleModalLabel">Auto Draft Funding Source</h2>
            <button onClick={() => { return this.onClose(); }} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="row mt-3">
              <div className="col-md mb-4" >
                <p className="mb-4">We'll need some information about your Funding Bank Account in order to perform Auto Drafts on your behalf</p>
                <Components.forms.achAccountCredentials
                  formKey="setup"
                />
                {this.props.achAccountCredentialsStatus.updatingError &&
                  <div className="alert alert-danger" role="alert">
                    <div className="row align-items-center">
                      <div className="col-xs-12 col-md-8 mt-1 mb-1">
                        {this.props.achAccountCredentialsStatus.updatingError}
                      </div>
                    </div>
                  </div>
                }
                <Components.button
                  onClick={() => { this.submitClicked(); }}
                  updating={this.props.achAccountCredentialsStatus.updating}
                  disabled={!allValid}
                  buttonText="Submit"
                  className="btn btn-primary float-end"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_achSetup);


