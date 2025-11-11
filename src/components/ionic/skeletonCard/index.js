import { connect, Component } from 'component';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonSkeletonText,
  IonThumbnail,
} from '@ionic/react';

// import Components from 'components';
// import Resources from 'resources';

import './index.scss';

class componentsIonicSkeletonCard extends Component {

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    return (
      <IonCard className="components_ionic_skeletonCard" key={this.props.key || undefined}>
        <IonCardHeader>
          <IonCardTitle>
            <IonSkeletonText animated style={{ height: '30px' }} />
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList>
            <IonItem lines="none">
              <IonThumbnail slot="start">
                <IonSkeletonText />
              </IonThumbnail>
              <IonLabel>
                <h3>
                  <IonSkeletonText animated style={{ width: '80%' }} />
                </h3>
                <p>
                  <IonSkeletonText animated style={{ width: '60%' }} />
                </p>
                <p>
                  <IonSkeletonText animated style={{ width: '30%' }} />
                </p>
              </IonLabel>
            </IonItem>
            <IonItem lines="none">
              <IonThumbnail slot="start">
                <IonSkeletonText />
              </IonThumbnail>
              <IonLabel>
                <h3>
                  <IonSkeletonText animated style={{ width: '80%' }} />
                </h3>
                <p>
                  <IonSkeletonText animated style={{ width: '60%' }} />
                </p>
                <p>
                  <IonSkeletonText animated style={{ width: '30%' }} />
                </p>
              </IonLabel>
            </IonItem>
          </IonList>
        </IonCardContent>
      </IonCard>
    );
  }
}

export default connect(() => {}, () => {})(componentsIonicSkeletonCard);

// GENERATOR_TYPE='component';
