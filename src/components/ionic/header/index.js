import { connect, Component } from 'component';
import {
  IonHeader,
  IonToolbar,
  IonButton,
  IonButtons,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import { airplane, caretDownSharp } from 'ionicons/icons';
import wfsrewards from 'assets/wfsrewards.png';

import Utils from 'utils';
import Store from 'store';

import './index.scss';

const mapStateToProps = (state, props) => ({
  router: state.router,
  context: state.wfs.data.context,
  preferences: state.wfs.preferences.data,
  status: state.wfs.status,
  user: _resolve(state, 'wfs.oAuth.data.decoded'),
  memberRewards: state.wfs.memberRewards,
});

const mapDispatchToProps = (dispatch, props) => ({
  openTailSelectModal: () => {
    dispatch(Store.router.openModal('Components.ionic.modals.flightDeptSelect', {}));
  },
  openInAppBrowser: (url) => {
    dispatch(Store.device.openInAppBrowser(url));
  },
});

const mapResourcesToProps = (state, props) => ({});

class componentsIonicHeader extends Component {

  state = {};

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {}

  componentWillUnmount() {}

  render() {
    const memberRewards = this.props.memberRewards || {};
    const routeName = _try(() => this.props.router.route.name.split('.')[0]);
    const { user, context } = this.props;
    const { pointSummary, memberTier } = memberRewards.data[(memberRewards.collections.customerIds[context.customerNumber] || [])[0]] || {};
    return (
      <IonHeader className="components_ionic_header" style={{ ...(this.props.style || {}) }}>
        <IonToolbar>

          <h1>{Utils.capitalize(routeName)}</h1>
          <IonButtons slot="end">

            <IonButton className="tail-select-button" fill="solid" color="medium" onClick={this.props.openTailSelectModal}>
              <IonIcon slot="start" color="primary" icon={airplane} />
              {!this.props.status.initialized ? <IonSpinner name="dots" color="light" /> : _resolve(context, 'tailNumber', 'Select a Tail')}
              <IonIcon className="select-icon" slot="end" icon={caretDownSharp} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <div
          className={`rewards-banner ${(pointSummary && routeName === 'wallet') ? 'shown' : 'hidden'}`}
          onClick={() => this.props.openInAppBrowser('https://worldfuelrewardsprogram.com/')}
        >
          <span className="world-fuel-rewards">
            <img className="rewards-image" src={wfsrewards} alt="Rewards" />
          </span>
          <span className="points-message">
            <div>Welcome back, {_try(() => user['https://wfscorp.com/custom-claims'].given_name)}.</div>
            <div>
              You have <strong>{pointSummary && _formatPoints(pointSummary.pointBalance)}</strong> World Fuel Reward Points.
            </div>
            <div><strong>{memberTier}</strong> Member</div>
          </span>
        </div>
      </IonHeader>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(componentsIonicHeader);

// Internal Helper Functions ...
const _formatPoints = (balance = 0) => balance.toLocaleString();
// GENERATOR_TYPE='component';
