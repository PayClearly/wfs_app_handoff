import { connect, Component, bindActionCreators, Fragment } from 'component';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@ionic-native/file-opener';
import { IonButton, IonIcon, IonSpinner } from '@ionic/react';
import { documentTextOutline } from 'ionicons/icons';

import Store from 'store';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    pdfs: state.wfs.pdfs,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    getDocumentPDF: (resourceId) => {
      dispatch(Store.wfs.getDocumentPDF(resourceId));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_nativePDF extends Component {

  state = {
    loader: true,
    initial: true,
  }
  componentDidMount() {
    if (!this.props.pdfs.data[this.props.id]) {
      this.props.getDocumentPDF(this.props.id);
    }
  }

  componentWillUnmount() {
    this.props.close();
  }

  documentViewClick = async () => {
    const res = await Filesystem.writeFile({
      path: this.props.name,
      data: this.props.pdfs.data[this.props.id].content,
      directory: Directory.Cache,
    });
    this.props.setWritten();
    FileOpener.open(res.uri, 'application/pdf',
      {
        success: () => this.setState({ loader: false }),
      });
  }
  render() {
    if (this.props.pdfs.data[this.props.id] && this.props.pdfs.data[this.props.id].content && this.state.initial) {
      this.setState({ initial: false });
      this.documentViewClick();
    }
    return (
      <IonButton style={{ width: '100%' }} onClick={this.documentViewClick}>
        {this.state.loader ?
          <IonSpinner name="crescent" />
          :
          <IonIcon size="large" icon={documentTextOutline} color="light" />
        }
      </IonButton>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_nativePDF);


