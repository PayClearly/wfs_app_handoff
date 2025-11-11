import { connect, Component, bindActionCreators, Fragment } from 'component';

import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_integrationcomps_achintegration_DWOLLA_overviews_beneficialowner extends Component {




  render() {
    const { data } = this.props;

    return (
      <div className="components_integrationcomps_achintegration_DWOLLA_overviews_beneficialowner">
        <div className="card card-with-label small-padding">
          <p className="card-label px-1"><strong>Beneficial Owner</strong></p>
          <div className="card-body low-pad">
            {data ?
              <div>
                <div className="flex">
                  <p className="text-muted mb-2">Contact: <strong>{`${data.firstName} ${data.lastName}`}</strong></p>
                  <p className="text-muted mb-2">Status: <strong>{Utils.capitalize(data.status)}</strong></p>
                </div>
                <p className="text-muted mb-2">Ownership Status: <strong>{Utils.capitalize(data.beneficialOwnershipStatus)}</strong></p>
              </div> :
              <strong>Beneficial Owner not set, additional setup is required.</strong>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_integrationcomps_achintegration_DWOLLA_overviews_beneficialowner);


