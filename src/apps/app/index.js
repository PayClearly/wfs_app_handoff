
import app from '../../app';
import Components from '../../components';
import config from './config.json';
import router from './routerconfig';

import './index.scss';

config.router = router;

function apps_app() {

  const entry = () => (
    <div className="apps_app w-100 h-100" data-version={process.env.APP_VERSION}>
      <Components.head />
      <Components.rootcontroller>
        <Components.rootControllerRenderers.main />
      </Components.rootcontroller>
    </div>
  );

  return app({
    entry,
    config,
  });

}

apps_app();

module.exports = apps_app;
