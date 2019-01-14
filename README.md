# Agile Model

**agile-model** painlessly sets up a PERN (PostgreSQL, Express, React Node) application.

# Installation

npm install -g agile-model

# Why

I created this to eliminate all the hustle of setting up models, migrations and database files for your application. It also gives a nice clean highly maintainable project structure that you'll just love.
Also, the time I spend creating the same structure always in my projects, I could use in coming up with more awesome features :)

# Usage

This is a global package and should be run at the root of your project.

## Initialization

To start with, run:

     agile-model init

This creates a file in your project root called **agility.js**. This is the configuration file agile-model will use to create the various entities in your app. We'll talk about this in the section [Using the **agility.js** file for initial configuration](#using-the-agility.js-file-for-initial-configuration)

## Setting Up

When you are ready to setup your project, you run:

    agile-model setup

This command sets up the base structure of your project and adds the **package.json** containing the **[Knex sql builder](https://knexjs.org/)** and **[Objection ORM](https://vincit.github.io/objection.js/)** as well as other useful dependencies.

After, agile-model is done setting your project up, the structure will be as shown below:

    my-app
    +-- dist
    +-- src
    |   +-- client
    |   |   +-- app.js
    |   +-- server
    |   |   +-- config/
    |   |   +-- objection.js
    |   |   +-- models/
    |   |   +-- migrations/
    |   |   +-- services/
    |   |   |   +-- db/
    |   |   |   |   +-- index.js
    +-- knexfile.js
    +-- migrate.bat
    +-- package.json
    +-- rollback.bat
    +-- webpack.common.js
    +-- webpack.dev.js
    +-- webpack.prod.js

## Generating New Models

After you have started working on your project, you may need more models you hadn't set up at the beginning. Don't worry, agile-model has got you covered. Inspired by [Active Record](http://guides.rubyonrails.org/active_record_basics.html) in Ruby on Rails, agile-model allows you to generate new models. (I.e. create the model with it's associated database and migration files).

To generate a new model, run:

    agile-model generate [model-name]

This will create the model file in `src/server/models/` folder and add the corresponding database files in the `src/server/services/db/` folder. By convention, **agile-model** will use a singular noun version of the name you used with the generate command and a plural form for the table name.

> As an example, running the command `agile-model generate user` will create a
> model file called `user.js` containing a model class of `User`.
> The resulting tablename will then be `users`.

# Using the **agility.js** file for initial configuration

When beginning a new app, you might already have the structure for the database. If you do, you can specify it withing the **agility.js** file which is created by running `agile-model init`. The file looks like this:

```
/**
* Modify this file with the models and relations you want in your project
* Please refer to the agile model documentation to find out more
* https://github.com/kwameopareasiedu/agile-model#using-the-agility.js-file-for-initial-configuration
*/


module.exports = {
    models: [],
    relations: ""
};
```

In the **models** array is pretty straightforward. You put your model names within it.

The **relations** string is what brings out the power of agile-model. You specify the relations between your models and agile-model will use that to create a model-graph, from which it will construct the files and file relations.

To illustrate this, let's take a simple scenario. Let's say we want to build a todo-list app where **users** can create **posts** and can also **comment** on posts. We can identify the following relations:

1.  A user has one or many posts

2.  A user has one or many comments

3.  A post has one or many comments

From this, the **agility.js** configuration for this project will be...

```
module.exports = {
    models: ["user", "post", "comment"],
    relations: "user HAS_MANY [post comment], post HAS_MANY comment"
}
```

...and that's it. Agile model will use this to build a dependency graph and create your entire database structure. Simple, don't you thing?

You might be wondering, _"I only specified a relation from **user** to **post**, what about from **post** to **user**?_.

No worries bruh. Agile model takes care of the reverse relations for you. From the model graph it can deduce that a post should belong to a user.

As of **v2.0.0**, the supported relations are "HAS_ONE", "HAS_MANY", and "BELONGS_TO_ONE". In future releases, more relations will be supported.

## The MANY-TO-MANY Relationship

To implement a "many-to-many" relationship, the rules of database says to create a third entity to bridge the two entities. Thus if we have two entities: A and B, and their relationship is many-to-many, then we can break it down to A has-many C and B has-many C where C is our new bridge entity.
In terms of the **agility.js** file, this would be:

    module.exports = {
        model: ["A", "B", "C"],
        relation: "A HAS_MANY C, B HAS_MANY C"
    };

# Testing

agile-model uses [mocha](https://mochajs.org/) and [chai](http://www.chaijs.com/) assetion library to run unit tests. Integration tests will be available with future releases.

To run the tests, simply run:

    npm test

# Contribution

If you love agile-model and want to help out, please feel free to clone, make the changes and submit a pull-request. If it checks out (with tests as well), I'll merge and add you to my contributors.

Visit the Github repository using [this link](https://github.com/kwameopareasiedu/agile-model)

If you'd also like to support me with any donations (monetary or otherwise), please send a mail and let's talk. I'll soon have a patreon account btw :)

If you discover any errors or malfunctions, please don't hesitate to open a issue on the repo and I'll look into it as soon as possible.

When making changes remember to set the NODE_ENV to "development" in the `bin/index.js` file.

# Contributors

-   [Kwame Opare Asiedu](https://github.com/kwameopareasiedu/)

# Changelog

### v2.0.0

-   Removed `--no-routes` and `--no-views` switches from `agile-model setup` and `agile-model generate` commands as the routes and views are specific to each project.
-   Fixed `find-where-conditions.js` in db file group
-   Added HAS_ONE to supported relations
-   Added circular dependency resolution to model-graph-generator
-   Fixed concurrency issues in migration files. This was an issue where migration files for models with dependencies were created before their dependencies resulting in errors when using `knex migrate:latest`
-   Updated ReadME

### v1.2.0

-   Added **routes** and **views** folder structure generation to model scaffolding.
-   Fixed foreign key name resolution in `/migrations` folder
-   Added new `--no-routes` and `--no-views` switches to the `agile-model setup` and `agile-model generate` commands
-   Updated Readme

### v1.1.0

-   Added knex migration file support

-   Fixed issue where database client is ignored from `agile-model setup --database=<database-client>`

-   Updated Readme

### v1.0.1

-   Updated Readme

### v1.0.0

-   Removed options from commands

-   `agile-model init` now generates the agility.js config file

-   Added model graphing

-   Added new command to cmd interface `agile-model setup --database`

### v0.1.1

-   Fixed file path issue which caused [init error](https://github.com/kwameopareasiedu/agile-model/issues/1)
