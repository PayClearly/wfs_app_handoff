
import app from '../../app';
import Components from '../../components';
import config from './config.json';
import router from './routerconfig';

import './index.scss';

config.router = router;

function apps_wfs() {

  const entry = () => {
    return (
      <div className="apps_wfs w-100 h-100">
        <Components.head />
        <Components.rootcontroller>
          <Components.rootControllerRenderers.main noAuthRoutes={router.noAuthRoutes} layout={Components.wfcomponents.mainlayout} login={Components.wfcomponents.login} />
        </Components.rootcontroller>
      </div>
    );
  };

  return app({
    entry,
    config,
  });

}

apps_wfs();

module.exports = apps_wfs;
