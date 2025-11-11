import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonImg, IonSpinner } from '@ionic/react';
import firebase from 'firebase';

import Store from 'store';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    navigate: (name, params = {}) => {
      dispatch(Store.router.navigateTo(name, params));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_image extends Component {

  state = {
    token: null,
    loaded: false,
  }

  componentDidMount() {
    return firebase.auth().currentUser.getIdToken().then(token => this.setState({ token }));
  }


  onImageLoad = () => {
    this.setState({ loaded: true });
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
    const src = this.props.src || this.getImageSrc(this.props.path, !!this.props.thumbnail, this.props.hash);
    return (
      <div className="components_ionic_image">
        {!this.state.loaded &&
          <IonSpinner name="crescent" />
        }
        <img
          alt={this.props.altText}
          className={this.props.className}
          style={{ display: !this.state.loaded ? 'none' : 'inline-block' }}
          src={src}
          onLoad={this.onImageLoad}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_image);


