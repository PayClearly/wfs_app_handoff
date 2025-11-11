import { connect, Component, bindActionCreators, Fragment } from 'component';
import firebase from 'firebase';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_containers_image extends Component {
  state = {
    token: null,
    loaded: false,
  };

  componentDidMount() {
    return firebase.auth().currentUser.getIdToken().then((token) => {
      this.setState({
        token,
      });
    });
  }


  onImageLoad = () => {
    this.setState({
      loaded: true,
    });
  };

  getImageSrc = (path, thumb, hash) => {
    const cloudFunctionsEndpoint = window.GLOBALCERT.cloudFunctions;
    // added md5Hash query param to force image to reload if user uploads same image but with different cropping
    // ts stands for 'timestamp' as the hash is effectively being used as a measure of when the image was last updated
    if (thumb) {
      return `${cloudFunctionsEndpoint}/attachments/?token=${this.state.token}&path=${path}&thumb=true${hash ? `&ts=${hash}` : ''}`;
    }

    return `${cloudFunctionsEndpoint}/attachments/?token=${this.state.token}&path=${path}${hash ? `&ts=${hash}` : ''}`;
  };

  render() {
    if (!this.state.token) {
      return (
        <div className="row">
          <Components.spinner />
        </div>
      );
    }

    return (
      <Fragment>
        {!this.state.loaded &&
          <div className="row h-100 justify-content-center align-items-center">
            <Components.spinner />
          </div>
        }
        <img
          alt={this.props.altText}
          className={`card-img-top img-responsive components_containers_image ${this.props.className ? this.props.className : 'p-3'}`}
          style={{ display: !this.state.loaded ? 'none' : 'inline-block' }}
          src={this.getImageSrc(this.props.path, !!this.props.thumbnail, this.props.hash)}
          onLoad={this.onImageLoad}
        />
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_containers_image);


