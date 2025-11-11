
import app from '../../app';
import Components from '../../components';
import config from './config.json';
import router from './routerconfig';

import './index.scss';

config.router = router;

function apps_vroozi() {

  const entry = () => {

    return (
      <div className="apps_vroozi w-100 h-100">
        <Components.head />
        <Components.rootcontroller>
          <Components.rootControllerRenderers.main />
        </Components.rootcontroller>
      </div>
    );
  };

  return app({
    entry,
    config,
  });

}

 apps_vroozi();

 module.exports = apps_vroozi;
