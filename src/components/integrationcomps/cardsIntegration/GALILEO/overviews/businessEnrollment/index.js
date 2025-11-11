import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
// import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    cardsIntegration: _try(() => Selectors.integrations(state).cardsIntegration, {}),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_integrationcomps_cardsIntegration_GALILEO_overviews_businessEnrollment extends Component {




  render() {
    const { details } = _try(() => this.props.cardsIntegration, {});
    return (
      <div className="components_integrationcomps_cardsIntegration_GALILEO_overviews_businessEnrollment">
        <div className="card card-with-label small-padding">
          <p className="card-label px-1"><strong>Business Enrollment</strong></p>
          <div className="card-body low-pad">
            <p className="text-muted mb-2"><strong>Business Enrollment Complete</strong></p>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_integrationcomps_cardsIntegration_GALILEO_overviews_businessEnrollment);


