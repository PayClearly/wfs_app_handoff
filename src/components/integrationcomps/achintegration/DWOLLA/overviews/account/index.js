import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
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

class components_integrationcomps_achintegration_DWOLLA_overviews_account extends Component {




  render() {
    const { data } = this.props;
    return (
      <div className="components_integrationcomps_achintegration_DWOLLA_overviews_account">
        <div className="card card-with-label small-padding">
          <p className="card-label px-1"><strong>Administrator</strong></p>
          <div className="card-body low-pad">
            {data ?
              <div>
                <p className="text-muted mb-2">Name: <strong>{`${data.firstName} ${data.lastName}`}</strong></p>
                <p className="text-muted mb-2">Email: <strong>{`${data.email}`}</strong></p>
              </div> :
              <strong>Administrator not set, additional setup is required.</strong>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_integrationcomps_achintegration_DWOLLA_overviews_account);


