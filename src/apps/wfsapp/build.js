const firebase = require('firebase');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const tmp = require('tmp');
const AdmZip = require('adm-zip');
const Handlebars = require('handlebars');
const shellpromise = require('shellpromise');

const VALID_CERTS = {
  test: 'test',
  prod: 'prod',
  staging: 'staging',
};

const build = async () => {
  // staging, prod, test, ...etc
  try {
    if (!VALID_CERTS[process.env.CERT || 'undefined']) throw new Error(`"${process.env.CERT}" is not a valid cert name.`);
    let releaseVersion;
    if (process.env.CI_PLATFORM) {
      const tags = await shellpromise('git tag --contains');
      releaseVersion = tags.split('\n').find(tag => tag.includes('release_wfsapp_v')).split('release_wfsapp_v')[1];
    }

    // android version uptick
    if (process.env.CI_PLATFORM === 'android') {
      let newBuildGradle = '';
      const buildGradle = fs.readFileSync('./src/apps/wfsapp/android/app/build.gradle', 'utf-8');
      newBuildGradle = buildGradle.replace(/versionCode 1/g, `versionCode ${_versionCode(releaseVersion, process.env.CERT)}`);
      newBuildGradle = newBuildGradle.replace(/versionName "1.0"/g, `versionName "${releaseVersion}"`);
      fs.writeFileSync('./src/apps/wfsapp/android/app/build.gradle', newBuildGradle, 'utf-8');
    }

    // ios version uptick
    if (process.env.CI_PLATFORM === 'ios') {
      const buildVersion = releaseVersion + (process.env.CERT === 'staging' ? '.1' : '.2');
      await shellpromise(`cd ./src/apps/wfsapp/ios/App && agvtool new-marketing-version ${releaseVersion} && agvtool new-version -all ${buildVersion}`);
    }

    const root = path.join(__dirname, '../../../');
    const manifest = await _getManifest();
    const app = process.env.APP;

    if (!app) throw new Error(`"${app}" is not a valid appName`);

    const cert = manifest.certs[process.env.CERT];
    const build = manifest.builds[process.env.CERT];
    const buildKey = process.env.CERT === 'test' ? 'local' : build[app];

    const buildDir = path.join(root, 'build/wfsapp/localDev');

    if (process.env.CERT !== 'test' && process.env.CI_PLATFORM) {
      fs.ensureDirSync(buildDir);
      const tmpFilename = tmp.fileSync().name;
      const response = await axios.get(`https://storage.googleapis.com/CHANGE_ME.appspot.com/deployBuilds/${app}/${buildKey}.zip`, { responseType: 'stream' });
      await _writeFile(tmpFilename, response.data);
      const zip = new AdmZip(tmpFilename);
      zip.extractAllTo(buildDir, true);
    }

    const config = fs.readJsonSync(path.join(root, `src/apps/${app}/config.json`));
    const file = fs.readFileSync(path.join(root, 'src', 'index.hbs')).toString();
    const template = Handlebars.compile(file);
    let WFS_TEST_ENV = null;
    if (process.env.CERT === 'staging') {
      WFS_TEST_ENV = process.env.WFS_TEST_ENV && 'Test';
    }
    const indexHTML = template({ appCert: { releaseVersion, buildKey, WFS_TEST_ENV, ...cert }, logo: config.logo, favicon: config.favicon }, { helpers: { toJSON: appCert => JSON.stringify(appCert) } });
    fs.outputFileSync(path.join(buildDir, 'index.html'), indexHTML);

    await fs.stat('./build/wfsapp')
      .then((result) => { if (typeof result == Error) throw new Error(); })
      .catch(() => { throw new Error('./build/wfsapp does not exist') });

    await fs.stat('./node_modules')
      .then((result)=> { if (typeof result == Error) throw new Error(); })
      .catch(() => { throw new Error('./node_modules does not exist') });

    await Promise.all([
      shellpromise('ionic deploy manifest'),
      fs.remove('./www').then(() => shellpromise(`ln -Ffs ${buildDir} ./www`)),
      fs.remove('./src/apps/wfsapp/www').then(() => shellpromise(`ln -Ffs ${buildDir} ./src/apps/wfsapp/www`)),
      fs.remove('./android').then(() => shellpromise('ln -Ffs ./src/apps/wfsapp/android ./android')),
      fs.remove('./ios').then(() => shellpromise('ln -Ffs ./src/apps/wfsapp/ios/ ./ios')),
      fs.remove('./resources').then(() => shellpromise('ln -Ffs ./src/apps/wfsapp/resources/ ./resources')),
    ]);

    await shellpromise('cd ./src/apps/wfsapp/ && ln -Ffs ../../../node_modules ./node_modules');
    await shellpromise('cd ./src/apps/wfsapp/ && ln -Ffs ../../../package.json ./package.json');
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

const _versionCode = (releaseVersion, env) => {
  const major = releaseVersion.split('.')[0].padStart(3, '0');
  const minor = releaseVersion.split('.')[1].padStart(2, '0');
  const patch = releaseVersion.split('.')[2].padStart(2, '0');
  const envNum = env === 'prod' ? '1' : '0';

  return parseInt(major + minor + patch + envNum, 10);
};

const _writeFile = (filename, stream) => {
  const writer = fs.createWriteStream(filename);
  return new Promise((resolve, reject) => {
    stream.pipe(writer);
    let error = null;
    writer.on('error', err => {
      error = err;
      writer.close();
      reject(err);
    });
    writer.on('close', () => {
      if (!error) {
        resolve(true);
      }
    });
  });
};

const _getManifest = () => {
  const wfsApp = firebase.initializeApp({
    apiKey: "CHANGE_ME",
    authDomain: "CHANGE_ME.firebaseapp.com",
    databaseURL: "https://CHANGE_ME.firebaseio.com",
    projectId: "CHANGE_ME",
    storageBucket: "CHANGE_ME.appspot.com",
    messagingSenderId: "CHANGE_ME",
  }, 'wfsApp');
  return firebase.database(wfsApp).ref('/manifest').once('value').then(snap => snap.val());
};

module.exports = build;
