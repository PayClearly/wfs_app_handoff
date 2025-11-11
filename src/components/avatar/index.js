import { connect, Component } from 'component';

// Third Party Imports ...
import jdenticon from 'jdenticon';

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
// import Components from 'components';
import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({
    userProfile: Resources.userProfile(state, { id: _try(() => props.id || props.user._id) }),
  });
};

class components_avatar extends Component {




  render() {
    const { userProfile } = this.props;

    const loaded = !!userProfile;
    const src = _try(() => userProfile.avatar) || null;
    const width = _try(() => this.props.width) || 35;
    const height = _try(() => this.props.height) || width;

    if (!loaded) {
      return (<span className="components_avatar profile-pic blurred" style={{ 'border-radius': '100%', height: `${height}px`, width: `${width}px` }} >user</span>);
    }
    if (src) {
      return (<img src={src} alt="user" className="components_avatar profile-pic" style={{ 'border-radius': '100%', height: `${height}px`, width: `${width}px` }} />);
    }
    return (<span className="components_avatar avatar" style={{ height: `${height}px`, width: `${width}px` }} dangerouslySetInnerHTML={{ __html: jdenticon.toSvg((userProfile && userProfile._id) || 'Liliana', width, 0) }} />);

  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_avatar);


