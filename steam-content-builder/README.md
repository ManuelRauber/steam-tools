# Steam Content Builder

This tool does the actual deployment to a Steam branch and set's it live automatically.
Whilst you can use it for real live deployments, it's recommended to use this tool only for automated beta or preview release branches.
Depending on your build system, every commit/build can be pushed to Steam for delivering a truly up-to-date continuous deployment.

## Prerequisites

* Node.js >= 8

## Usage

Most likely for a continuous deployment, this tools needs to run on a server.
A build trigger will trigger the tool to start a deployment.
Then, a build adapter will be used to fetch the latest build artifacts (e.g. binaries) available for your game, which then will be uploaded directly to Steam.

### Setup

If you haven't used the tool before, please do the following:

* Please make sure, you are familiar with the concepts of [SteamPipe](https://partner.steamgames.com/doc/sdk/uploading).
* Create a new Steam account for the builder. **PLEASE DO NOT USE YOUR REAL STEAM ACCOUNT FOR THE BUILDER**
    Whilst you can use your real Steam account, it's highly recommended to create a new account for the purpose of pushing updates to Steam.
    More information about this can be found [here](https://partner.steamgames.com/doc/sdk/uploading#Build_Account).
* Copy the whole folder `steam-content-builder` to your server.
* Install Node.js.
* Run `npm i` within `steam-content-builder` folder.
* Run `npm run setup` to start the setup process.
