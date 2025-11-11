import { connect, Component, bindActionCreators, Fragment } from 'component';
// Third Party Imports ...

import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_containers_video extends Component {

  state = {
  };

  componentDidMount() {
    const video = document.getElementsByTagName('video')[0];
    video.src = this.props.src;
    video.controls = true;
    video.onloadeddata = () => video.play();
    video.load();
  }

  componentWillReceiveProps(newProps) {
  }

  // destroy player on unmount
  componentWillUnmount() {
    if (this.player) {
      this.player.dispose();
    }
  }

  render() {
    return (
      <div className="col-6">
        <video style={{ width: '100%' }}></video>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_containers_video);


