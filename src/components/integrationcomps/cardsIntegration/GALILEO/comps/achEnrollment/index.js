import { connect, Component, bindActionCreators, Fragment } from 'component';

import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    cardsIntegration: _try(() => Selectors.integrations(state).cardsIntegration, {}),
    forms: state.forms,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_integrationcomps_cardsIntegration_GALILEO_comps_achEnrollment extends Component {
  state = {
  };

  componentDidMount() {
  }


  render() {
    const updatingError = _try(() => this.props.cardsIntegration.status.updatingError);

    return (
      <div className="components_integrationcomps_cardsIntegration_GALILEO_comps_achEnrollment">
        <Fragment>
          <div className="row mb-3">
            <div className="col-12">
              <div className="alert alert-primary" role="alert">
                <h4 className="alert-heading">Enroll Funding Account</h4>
                <p className="m-0">
                  Please enter the necessary information to connect a funding account.
                </p>
              </div>
            </div>
          </div>
          <Components.integrationcomps.cardsIntegration.GALILEO.creators.achEnrollment blurAll={this.state.formBlurAll} />
          {updatingError &&
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Something Went Wrong</h4>
              Error: {updatingError}
            </div>
          }
        </Fragment>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_integrationcomps_cardsIntegration_GALILEO_comps_achEnrollment);


