# WFS App

## Table of Contents

[Introduction](#introduction) 

[Features](#features)

[Technical Overview](#technical-overview)

[Setup & Installation](#setup--installation)

[Usage & Workflow](#usage--workflow)

[Testing](#testing)

[Deployment](#deployment)

[Internal Documentation](#internal-documentation)

[Feedback & Suggestions](#feedback--suggestions)

[Changelog](#changelog)

## Introduction

WFS App is a monorepo-like project housing shared view components, state management layer, and authentication processes. All WFS products live in App and utilize as many shared aspects as possible.

## Features

__Dashboard__: Displays available funds, pending payments and a summary of payment activity.

__Payments__: Provides the tools a user needs to make payments, from setting up vendors, funding bank account, creating payments, managing payment history and downloading csv files.

__Reports__: Allows the user to generate custom report templates, schedule reports, generate ad hoc reports, and schedule reports to be delivered via email, uploaded to our FTP server or downloaded to the local client.
 
__Settings__: Allows the user to customize their account configurations, integrate with 3rd party payment providers and create custom upload and download templates.

__Admin__: Tools for managing organization, account, users, and feature flags. The admin section is also used to monitor the status of 3rd party inegrations.

__Support Dashboard__: Views for our operations team to search and filter various resources, transactions history and procedures for making payments.

__Global Database__: Views for managing and creating global vendors and payment procedures.

__Automation__: Tools for managing, starting and stopping payment automation runs.

__Exceptions__: Tabular view for managing payment expceptions.

## Technical Overview

- [Redux: the state management layer](http://redux.js.org/)
- [React: the view engine](https://reactjs.org/)
- [Firebase](https://firebase.google.com/)
- [Webpack: the build tool](https://webpack.js.org/)
- [Less: css pre-compiler](http://lesscss.org/)
- [Airbnb Javascript Style Guide](https://github.com/airbnb/javascript)

Code is broken into three primary groups:
 - Client API (api)
 - state (state)
 - view (view)

Client-facing code is stored in src. Shared view components, state, and client API are located in `components/`, `store/`, and `api/`, respectively. Other shared code is are located top-level in `src/`. App-specific code, such as: configs, style-sheets, and the entry-point, is located in `apps/`.

## Setup & Installation
Steps to setup the PayClearly APP development environment.

1. Make sure you are running node 16.15.0, this is the node version that runs on Google's cloud functions

    `$: n 16.15.0`
    or
    `$: nvm 16.15.0`

2. Install the Firebase CLI by following these [steps](https://firebase.google.com/docs/cli/).

- Login by running `firebase login`.
- Login using your WFS email.
- You must be logged in to locally serve cloud functions and run end to end tests.

3. Clone and install the repo, use SSH rather than https.

    `$: git clone git@github.com:CHANGE_ME/CHANGE_ME.git`

    `$: npm install`

   To generate a new SSH key in GitHub account follow these steps:
      ["https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent"].

   To add the SSH key to GitHub account follow these steps:
      [https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/adding-a-new-ssh-key-to-your-github-account].

4. Select the project you want pointed to.

   List the projects you have.
    - Make sure you followed step 2 and logged in
    `$: firebase projects:list`

    Select what project you want to test/dev against. Should
    default to the `CHANGE_ME` project.

    `$: firebase use [PROJECT_NAME]`

__Developing Locally__
- Use ` $: CERT=[CERT] npm run dev --app=[APP]` to start the local minion server.
- The `CERT` env variable must be used to set the correct development environment.
   - `prod` will reference the product backend with no need to run local API.
   - Other CERTs will require the API to be running locally, reference the api Readme.md.
- The `--app=` flag must be set to the correct application to run on local host.

__Example__ `$: CERT=prod npm run dev  --app=app`

__Styles__

All apps created in WFS App will utilize the same general styles and color palette. If styles or variables need to be modified for a specific app please follow these tips:

- For variables: set new variables in `src/apps/APPNAME/variables.scss` above the default variable import line
- For general styling: define new styles in `src/apps/APPNAME/index.scss`. Use of the *!important* flag is sometimes required to override existing style rules

## Testing

WIP

## Deployment

We use an internal release tool to deploy the app. The bundled assets are hosted on a Virtual Machine called 'minion' in our Google Cloud project. To run the release tool, run command `npm run release` 

Here is a [Loom video](https://www.loom.com/share/e33b5ce9271d43acbebd76dce82b6957?sid=a7210e68-657c-4980-95ee-6ad2b587ea11) demonstrating the deployment process.

## Internal Documentation

Internal Documentation can be found in [CHANGE_ME](CHANGE_ME)

## Feedback & Suggestions

[CHANGE_ME](CHANGE_ME) is used for project managament.

## Changelog
