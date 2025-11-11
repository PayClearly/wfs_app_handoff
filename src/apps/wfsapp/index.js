
import { IonApp, setupConfig, isPlatform } from '@ionic/react';

import app from '../../app';
import Components from '../../components';
import config from './config.json';
import router from './routerconfig';

import './index.scss';

config.router = router;

function apps_wfsapp() {

  const entry = () => {
    return (
      <IonApp className="apps_wfsapp">
        <Components.head />
        <Components.ionic.rootcontroller>
          <Components.rootControllerRenderers.ionic noAuthRoutes={router.noAuthRoutes} layout={Components.ionic.tablayout} login={Components.ionic.login} notAuthed={Components.ionic.notAuthed} />
        </Components.ionic.rootcontroller>
      </IonApp>
    );
  };

  return app({
    entry,
    config,
  });

}

setupConfig({
  rippleEffect: false,
  mode: isPlatform('ios') ? 'ios' : 'md',
});

apps_wfsapp();

module.exports = apps_wfsapp;
