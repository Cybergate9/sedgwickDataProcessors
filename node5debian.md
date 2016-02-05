### Installing Node.js 5.x on Debian

A number of problems are solved by moving from node.js 0.10.x (a standard 'apt-get install nodejs' uses 0.10.x) to 5.4.x on Debian. So the quick version is:

Install 5.x using:

`apt-get install curl`

`curl -sL https://deb.nodesource.com/setup_5.x | bash -`
 (as per [this](https://github.com/nodejs/node-v0.x-archive/wiki/Installing-Node.js-via-package-manager))

`apt-get install nodejs`

You should now have a full node/npm 5.x install, confirm with `node -v` and `nodejs -v`

At this point it's probably best to reinstall all the NPM modules, so:

* delete your node_modules dir (e.g. `rm -rf node_modules` in your *project directory only*)

* force a re-install with `npm install`, which will read dependencies to install as usual from package.json

I had issues installing a number of npm modules before this.. and no problems installing either on Debian after getting Node.js 5.x installed using this approach.
