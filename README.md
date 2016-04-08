<h1>
Shyp's Sails Fork
</h1>

This is Shyp's fork of the Sails.js project. We use Sails solely as an API, and
we have removed support for many upstream features:

- Grunt
- Blueprints
- Socket support
- Auto routes
- Support for any datastore besides Postgres
- Connect/connect-flash
- Sessions
- CSRF
- Multiple validation errors for a single request (only one error is returned)
- Custom bootstrap in config/bootstrap.js
- Sails no longer clobbers the SIGTERM, SIGUSR2, and SIGINT handlers.

By limiting the feature set we hope to reduce the attack surface and ship
something that's more reliable and predictable.

## Contribute/Project Direction

We'll read community error reports, issues and PR's, though it's unlikely that
we'll have time to test and merge them.

## Tests

We run tests on CircleCI. Here's an image showing whether the tests pass or
fail.

**With [node](http://nodejs.org) [installed](http://sailsjs.org/#!documentation/new-to-nodejs):**
```sh
$ npm install sails@git+https://github.com/Shyp/sails.git#v4.1.0
```

## Your First Sails Project

**Create a new app:**
```sh
# Create the app
$ sails new testProject
```

**Lift sails:**
```sh
# cd into the new folder
$ cd testProject

# fire up the server
$ sails lift
```


## Compatibility

Sails is built on [Node.js](http://nodejs.org/), and [Express](http://expressjs.com/)

Sails [controllers](http://sailsjs.org/#!documentation/controllers) are compatible with Connect middleware, so in most cases, you can paste code into Sails from an existing Express project and everything will work.


The ORM, [Waterline](https://github.com/balderdashy/waterline), has a
well-defined adapter system for supporting Postgres.

## Team
This fork is actively built and maintained by [the Shyp engineering team](https://github.com/Shyp)

## License

[MIT License](http://sails.mit-license.org/)  Copyright © 2012-2014 Mike McNeil

> Sails is built around so many great open-source technologies that it would never have crossed our minds to keep it proprietary.  We owe huge gratitude and props to TJ Holowaychuk ([@visionmedia](https://github.com/visionmedia)) and Guillermo Rauch ([@guille](https://github.com/guille)) for the work they did, as well as the stewards of all the other open-source modules we use.  Sails could never have been developed without your tremendous contributions to the node community.
