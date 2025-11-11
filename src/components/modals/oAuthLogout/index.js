import {
  connect,
  Component,
} from 'component';

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  accountResources: state.account,
  env: window.GLOBALCERT.projectId === 'payclearly-test' || window.GLOBALCERT.projectId === 'payclearly-staging' ? 'DEV' : 'PROD',
});

const mapDispatchToProps = (dispatch, props) => ({
  logout: (appName) => {
    dispatch(Store.user.oAuthLogout(appName));
  },
});

class componentsModalsOAuthLogout extends Component {
  state = {};





  render() {
    return (
      <div className="modal-dialog" role="document">
        <div className="modal-content components_modals_oAuthLogout">
          <div className="modal-header">
            <h3 className="modal-title" id="exampleModalLabel">{`${this.props.title}`}</h3>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md mb-4">
                <p>{this.props.content}</p>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <Components.button
              onClick={() => {
                this.props.logout(`${this.props.appName}${this.props.env}${window.GLOBALCERT.WFS_TEST_ENV || ''}`);
              }}
              disabled={false}
              buttonText={'Log out'}
              className={`btn btn-${this.props.yesButtonColor || 'primary'}`}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(componentsModalsOAuthLogout);


