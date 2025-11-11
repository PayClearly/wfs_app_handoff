import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import jdenticon from 'jdenticon';

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

class components_usericon extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    const { user } = this.props;

    if (!user) return null;

    const id = user._id || null;
    const src = user.avatar || null;
    const width = this.props.width || 35;
    const height = this.props.height || width;

    if (src) {
      return (<img src={src} alt="user" className="profile-pic" style={{ 'border-radius': '100%', height: `${height}px`, width: `${width}px` }} />);
    }
    return (<span className="avatar" style={{ height: `${height}px`, width: `${width}px` }} dangerouslySetInnerHTML={{ __html: jdenticon.toSvg(id, width, 0) }} />);

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_usericon);


