// eslint-disable-next-line import/no-extraneous-dependencies
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const Handlebars = require('handlebars');
const ifaces = require('os').networkInterfaces();

const app = process.env.npm_config_app || process.env.APP || 'app';

// build static index.html for local mobile app development.
// index.html is required at build time for mobile apps and is not served normally through minion.
class BuildIndexHTML {
  constructor() {
    this.hasRan = false;
  }

  apply(compiler) {
    compiler.hooks.done.tapPromise('BuildIndexHTML', async(stats) => {
      // only run this on the first compile and during local development.

      if (this.hasRan === true || ((process.env.CERT || '').length === 0)) return Promise.resolve();

      const certName = process.env.CERT;
      const root = path.join(__dirname, '../src');

      const cert = await axios.get(`https://CHANGE_ME.firebaseio.com/manifest/certs/${certName}.json`).then(item => item && item.data || null);
      if (!cert) return Promise.reject(`Could not find manifest for target "${certName}"`);

      const useLocalIp = certName !== 'prod' && certName !== 'staging' && certName !== 'test'; // set as environment variable
      if (useLocalIp) {
        const addresses = [];
        Object.values(ifaces).forEach((iface) => {
          Object.values(iface).forEach((details) => {
            if (details.family === 'IPv4' && !details.internal) addresses.push(details.address);
          });
        }, []);

        if (addresses.length > 1) console.error(`Found more than one internal IP address. Picking address "${addresses[0]}" from "${addresses.join(', ')}" for cloud function URL `);
        cert.cloudFunctions = `http://${addresses[0]}:5000/CHANGE_ME/us-central1/api`;
      }

      const config = fs.readJsonSync(path.join(root, `apps/${app}/config.json`));
      const file = fs.readFileSync(path.join(root, 'index.hbs')).toString();
      const template = Handlebars.compile(file);
      const indexHTML = template({ appCert: cert, logo: config.logo, favicon: config.favicon }, { helpers: { toJSON: appCert => JSON.stringify(appCert) } });

      const outputDirectory = process.env.OUTPUT_BUILD_DIRECTORY || 'localDev';

      fs.outputFileSync(path.join(root, `../build/${app}/${outputDirectory}/index.html`), indexHTML);
      this.hasRan = true;
      return Promise.resolve();
    });
  }
}
module.exports = BuildIndexHTML;
