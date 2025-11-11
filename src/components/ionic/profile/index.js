import { connect, Component } from 'component';
import {
  IonButton,
  IonActionSheet,
  IonAvatar,
  IonImg,
  IonSpinner,
} from '@ionic/react';

import Store from 'store';
import Components from 'components';

import './index.scss';

import nopic from 'assets/nopic.svg';
import nbaanopic from 'assets/NBAAnopic.jpeg';
import photoGallery from '../../../utils/photoGallery';

const mapStateToProps = (state, props) => ({
  user: _try(() => state.wfs.oAuth.data.decoded['https://wfscorp.com/custom-claims'], {}),
  // no pic is an svg or png, but the data coming through here might be a jpeg so it should be decorated with data:image/jpg;base64,
  photo: _try(() => (['73179c3655290fde7245575f0e83651f', 'c340bf9f44c27584b8b660da44d1de3d', '6368b7491881bc6c4e3da772a3f0fd95', '5486cc1ed0198129529ea6b01a0dce40'].includes(state.user.profile.data.item._id) ? nbaanopic : nopic)),
  syncedPhoto: state.wfs.data.profileImage || null,
  updatingPhoto: state.wfs.data.updating,
  profile: state.user.profile.data.item,
  env: _try(() => (window.GLOBALCERT.projectId === 'payclearly-test' || window.GLOBALCERT.projectId === 'payclearly-staging') && 'DEV' || 'PROD'),
  device: state.device.data,
});

const mapDispatchToProps = (dispatch, props) => ({
  logout: (env) => {
    dispatch(Store.user.oAuthLogout(`wfsapp${env}${window.GLOBALCERT.WFS_TEST_ENV || ''}`));
  },
  updateWFSData: (data) => {
    dispatch(Store.wfs.updateData(data));
  },
});

const mapResourcesToProps = (state, props) => ({});

class componentsIonicProfile extends Component {

  state = {
    showActionSheet: false,
    newPhoto: false,
    settingPhoto: false,
    userPhoto: {},
    defaultUserPhoto: this.props.photo,
  };





  choosePhoto = async () => {
    const photoTimestamp = Date.now();
    this.setState({ settingPhoto: true, newPhoto: false });
    await photoGallery.choosePhoto(
      `${this.props.profile._id}_profile_image-${photoTimestamp}`,
      (value) => {
        this.props.updateWFSData({ profileImage: value });
        this.setState({ userPhoto: value, newPhoto: true, settingPhoto: false });
        return [value];
      },
      () => {
        this.setState({ settingPhoto: false });
      }
    );
  };

  takePhoto = async () => {
    const photoTimestamp = Date.now();
    this.setState({ settingPhoto: true, newPhoto: false });
    await photoGallery.takePhoto(
      `${this.props.profile._id}_profile_image-${photoTimestamp}`,
      (value) => {
        this.props.updateWFSData({ profileImage: value });
        this.setState({ userPhoto: value, newPhoto: true, settingPhoto: false });
        return [value];
      },
      () => {
        this.setState({ settingPhoto: false });
      }
    );
  };

  removePhoto = async (fileName) => photoGallery.removePhoto(
    fileName,
    () => {
      this.props.updateWFSData({ profileImage: null });
      this.setState({ userPhoto: {}, newPhoto: false });
    }
  );

  render() {
    const { user } = this.props;
    const production = window.GLOBALCERT.projectId === 'payclearly-32f4e';
    const imageToDisplay = (
      (!this.state.newPhoto && this.props.syncedPhoto && this.props.syncedPhoto.webviewPath)
      || this.state.userPhoto.filepath
      || this.state.defaultUserPhoto
      || nopic
    );
    return (
      <div className="components_ionic_profile">
        <div className="avatar-card margin-vertical">
          <IonAvatar
            style={{ width: '170px', height: '170px', marginTop: '20px' }}
            onClick={() => this.setState({ showActionSheet: true })}
          >
            {this.state.settingPhoto
              ? (
                <div className="spin">
                  <IonSpinner name="crescent" className="profile-image-spinner" />
                </div>
              )
              : <IonImg src={imageToDisplay} />}
          </IonAvatar>
          <h3>{`${user.given_name}${user.family_name ? ` ${user.family_name}` : ''}` || user.user_name}</h3>
          <p style={{ margin: 0 }}>{user.email || ''}</p>
        </div>
        <Components.ionic.securityPreferences />
        {!production && <Components.ionic.applicationPreferences />}

        <IonButton
          className="ion-margin margin-vertical"
          fill="outline"
          expand="block"
          onClick={() => this.props.logout(this.props.env)}
        >
          SIGN OUT
        </IonButton>

        <IonActionSheet
          isOpen={this.state.showActionSheet}
          onDidDismiss={() => this.setState({ showActionSheet: false })}
          buttons={[{
            text: 'Remove Photo',
            role: 'destructive',
            handler: () => {
              this.removePhoto(imageToDisplay.split('/')[imageToDisplay.split('/').length - 1].split('.')[0]);
            },
          }, {
            text: 'Choose New Photo',
            handler: () => {
              this.choosePhoto();
            },
          }, {
            text: 'Take New Photo',
            handler: () => {
              this.takePhoto();
            },
          }, this.props.device.platform === 'ios' || this.props.device.model === 'iPhone' ? {
            text: 'Cancel',
            cssClass: 'light',
            role: 'cancel',
            handler: () => {
              this.setState({ showActionSheet: false });
            },
          }
            : {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                this.setState({ showActionSheet: false });
              },
            }]}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(componentsIonicProfile);


