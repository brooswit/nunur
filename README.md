# Introduction

Nunur is a chat app. It uses Vue.js to handle the front-end interface. It uses Node, Express, and WebSockets on the back end, along with a custom distributed eventing library called Cthulhu.

Nunur does not persist content on the back-end. The front-end is minimalistic, straight forward, and not distracting.

The goal is to provide a fully transparent chat platform that users can trust. We cannot share our users data, location, activity, or behavior because we do not capture anything ever.

# Requirements

### Node

Node is required.
Google can probably provide the best, most up to date instructions for your OS. ¯\\\_(ツ)\_/¯

### Parcel

The build process uses Parcel.js. To install Parcel, use NPM:

      npm install -g parcel-bundler

The intneded development pipeline will automatically build for you, but to build manually, use `npm run`:

      npm run build

### Grunt

Not absolutely required, but is utilized in the intended development pipeline.

      npm install -g grunt

# Development pipeline explained

- This project uses Adderall to expedite local development by watching for changes to any existing file, or the creation of any file.
- Once this occurs, the dev process then pulss in all remote changes.
- The dev process then runs all tests. If any fails, the dev process then goes back to watching all files.
- If these tests pass, then the dev process then compiles the webapp into the build folder.
- The dev process then pushes all local changes up to the remote branch
- Every time a change is pushed to master CircleCI tests the code again
- If these tests pass, the new build is automatically redeployed on Heroku.
