const fs = require('fs-extra');
const gitit = require('@pclabs/gitit');
const shellpromise = require('shellpromise');

const apps = fs.readdirSync('./src/apps').filter((app) => app !== 'index.js');
const envs = ['staging', 'prod'];

const config = {
  repo: {
    location: './',
    branch: 'develop',
    creds: {},
    entryParser: {},
  },
  project: {
    name: 'WFS Frontend',
    commitParsers: [/Merge pull request #(:<prId>[0-9]{1,7}) from CHANGE_ME\/(:<ticketId>(PC-|WFS-|WKC-|PAY-|QA-|PS-|MWW-)[0-9]{1,7}(-[0-9]+)*)/],
    branchParsers: [/\/(:<wipId>(PC-|WFS-|WKC-|PAY-|QA-|PPS-|MWW-)[0-9]{1,7}(-[0-9]+)*)$/],
    tagParsers: [
      /build_app_(:<buildId>[0-9]{10,15})$/,
      /envreq_(:<envReqId>[A-Za-z]{2,10}_[a-z0-9_]{2,30})$/,
      /env_(:<envId>[A-Za-z]{2,10}_[A-Za-z]{2,15})$/,
      /releasereq_(:<releaseReqId>[A-Za-z]{2,10}_[v.a-z0-9]{2,20})$/,
      /release_(:<releaseId>[A-Za-z]{2,10}_[v.a-z0-9]{2,15})$/,
    ],
  },
  tickets: {},
  delegates: {
    onAnswers: async (answers) => {
      let command;
      if (answers.newVersion) {
        const tag = `releasereq_${answers.app}_v${answers.newVersion}`;
        command = `git tag ${tag} ${answers.commitHash} && git push origin ${tag}`;
      } else if (answers.env) {
        const tag = `envreq_${answers.app}_${answers.env}`;
        command = `git tag ${tag} ${answers.commitHash} && git push origin ${tag}`;
      }

      if (command) {
        await shellpromise(command);
        console.log('-- Action Created --');
        console.log('-->   https://github.com/CHANGE_ME/CHANGE_ME/actions');
      } else {
        console.log('-- Not Handled --');
      }
    },
  },
};

const instance = gitit(config);
instance.prompt({ apps, envs }, {});
