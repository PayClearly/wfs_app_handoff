import { connect, Component, bindActionCreators, Fragment } from 'component';
import firebase from 'firebase';

// Third Party Imports ...

import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_imagecontainer extends Component {

  state = {
    token: null,
    loaded: false,
  };

  componentDidMount() {
    return firebase.auth().currentUser.getIdToken().then((token) => {
      this.setState({ token });
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
    return (
      <Fragment>
        {!this.state.loaded &&
          <div className="row justify-content-center">
            <Components.spinner />
          </div>
        }
        <img
          alt={this.props.altText}
          className={'card-img-top img-responsive p-3'}
          style={{ display: !this.state.loaded ? 'none' : 'inline-block' }}
          src={this.getImageSrc(this.props.path, this.props.thumbnail !== false, this.props.hash)}
          onLoad={this.onImageLoad}
        />
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_imagecontainer);


