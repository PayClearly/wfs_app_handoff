import { connect, Component, bindActionCreators, Fragment } from 'component';
import firebase from 'firebase';

const mapStateToProps = (state, props) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_permissionedImage extends Component {
  state = {};

  componentDidMount() {
    return firebase.auth().currentUser.getIdToken().then((token) => {
      this.setState({
        token,
      });
    });
  }

  render() {
    let imageToDisplay = this.props.default;
    if (this.props.path) {
      const cloudFunctionsEndpoint = window.GLOBALCERT.cloudFunctions;
      // added md5Hash query param to force image to reload if user uploads same image but with different cropping
      // ts stands for 'timestamp' as the hash is effectively being used as a measure of when the image was last updated
      imageToDisplay = `${cloudFunctionsEndpoint}/attachments/?token=${this.state.token}&path=${this.props.path}${this.props.ts ? `&ts=${this.props.ts}` : ''}`;
    }
    return (
      <img className={this.props.className} alt={this.props.alt || 'logo'} src={imageToDisplay} />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_permissionedImage);

