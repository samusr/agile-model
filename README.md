# Agile Model

**agile-model** is a project generator framework that painlessly helps you set up an Express.js project with PostgreSQL and React running on the NodeJS runtime.

This was created to eliminate all the hustle of setting up models, migrations and database files that are involved when starting a new application or adding more to an existing one. It also gives a nice, clean and very maintainable project structure that you'll just love.

_​agile-model handles the boring repetitive stuff, so that you can handle the interesting creative stuff._

# Installation

This should be installed as a global package. To do so, run the command below

​ `npm install -g agile-model`

# Getting started

When you a new project, you might already have decided what your project models and relationships are. If so, you can load them into a special file called `agility.js` at the root of your project and agile-model will generate the necessary files for you. To create the this file, run the command:

`agile-model init`

We'll talk about this in the section [Using the agility.js file for initial configuration](#using-the-agility.js-file-for-initial-configuration)

## Setting up

When you are ready to create your actual project directory content, run the command:

`agile-model setup`

This command sets up the base structure of your project and adds the **package.json** containing the [Knex sql builder](https://knexjs.org/) and [Objection ORM](https://vincit.github.io/objection.js/) as well as other useful dependencies.

After, agile-model is done setting your project up, the structure will be as shown below:

    my-app
    +-- dist
        +-- ...
    +-- src
        +-- client
            +-- ...
        +-- server
            +-- config/
            +-- objection.js
            +-- models/
            +-- migrations/
            +-- services/
                +-- db/
                    +-- index.js
    +-- .babelrc
    +-- .eslintrc
    +-- .gitignore
    +-- agility.js
    +-- knexfile.js
    +-- migrate.bat
    +-- nodemon.json
    +-- package.json
    +-- rollback.bat
    +-- webpack.common.js
    +-- webpack.dev.js
    +-- webpack.prod.js

## Generating new models

After you have started working on your project, you may need more models you hadn't set up at the beginning. Don't worry, agile-model has got you covered. Inspired by [Active Record](http://guides.rubyonrails.org/active_record_basics.html) in Ruby on Rails, agile-model allows you to generate new models. (I.e. create the model with it's associated database and migration files).

To generate a new model, run the command:

`agile-model generate <model name>`

This will create the model file in `src/server/models/` folder and add the corresponding database files group in the `src/server/services/db/` folder. agile-model will use a singular noun version of the name you specify with the generate command and a plural form for the table name.

> As an example, running the command `agile-model generate user` will create a
> model file called `user.js` containing a model class of `User`.
> The resulting tablename will then be `users`.

# Using the **agility.js** file for initial configuration

The content of the agility.js file is shown below:

```
/**
* Modify this file with the models and relations you want in your project
* Please refer to the agile model documentation to find out more
* https://github.com/kwameopareasiedu/agile-model#using-the-agility.js-file-for-initial-configuration
*/


module.exports = {
    models: [],
    relations: "",
    portals: []
};
```

In the previous section, we saw how to create the agility.js file. Let's examine the content a bit more.

We mentioned that you can specify your models and model relationships in this file.

The purpose of the **models** array should be then pretty straightforward. You put your model names within it.

The **relations** string is what brings out the power of agile-model. You specify the relationships between your models in here and agile-model will use that to create the files containing the models, their corresponding database file groups and syntactical relations to other models.

To illustrate this, let's take a simple scenario. Let's say we want to build a very simepl blog where **users** can create **posts** and can also **comment** on posts. We can identify the following relations:

1.  A user has one or many posts

2.  A user has one or many comments

3.  A post has one or many comments

Looking at the relationship between these models, we can deduce that, in a relational database setting, every **post** object should have a foreign key linking it to its **user**. We would have a similar configuration for the **comment** object.

From this simple scenario, our agility.js configuration for this project will be as show below:

```
module.exports = {
    models: ["User", "Post", "Comment"],
    relations: "User HAS_MANY [Post Comment], Post HAS_MANY Comment"
    // Let's ignore the portals array for now
}
```

...and that is literally all you have to do.

agile-model will use this to build a model graph, determine which models are linked, determine the type of link (one-to-one, one-to-many, etc.), resolve the names of tables amongst other things and create your entire database structure. Simple, don't you think?

You might be wondering, _"I only specified a relation from **User** to **Post**, what about from **Post** to **User**?_.

No worries there. **agile-model** has the added benefit of inferring the reverse relations of all relations you specified.

What this means is that, for example, if you specify a relationship such as **user HAS_MANY post**, agile-model will add the relation **post BELONGS_TO_ONE user** for you.

As of **v3.0.0**, the supported relations are "HAS_ONE", "HAS_MANY", and "BELONGS_TO_ONE". In future releases, more relations will be supported.

## The illusive MANY-TO-MANY Relationship

To implement a "many-to-many" relationship between two models, the rules of relational databases say to create a third model to bridge the two models. Thus if we have two models: **A** and **B**, and their relationship is many-to-many, then we can break it down to **A HAS_MANY C** and **B HAS_MANY C** where **C** is our new bridge model.

If we had to specify this in the **agility.js** file, it would be:

```
module.exports = {
    model: ["A", "B", "C"],
    relation: "A HAS_MANY C, B HAS_MANY C"
};
```

However, if you do not want to come up with a third model yourself, you can delegate the task to agile-model.

In that case your **agility.js** would look like:

```
module.exports = {
    model: ["A", "B"],
    relation: "A HAS_MANY B, B HAS_MANY A"
};
```

This creates what is known as a **circular dependency** between A and B. agile-model, in this case, will automatically create a new model by merging the names of the two models. In this case, you'd notice a new model **AB** being created as the bridge model

## Portals

A portal is essentially a modular part of the client-side of your application that work independently from each other.

As as example, if you were building some sort of management application, you'd have one portal for users and another portal for administrators.

Portals in agile-model are generated using [React](https://reactjs.org) and [Redux](https://redux.js.org). All the files of each portals are bundled into one by the configured [Webpack module bundler](https://webpack.js.org) and served in `/dist/[portal name]/bundle.js` within your project directory.

While working on your application, if and when you need to create a new portal, run the command:

`agile-model create-portal <portal name>`

After generating a new portal, agile-model will rewrite your `/src/server/routes/index.js` to make sure it can be accessed by a url.

It also reconfigures the `/webpack.common.js` to include your new portal in the build pipeline (This means it will compile the portals files so that it can be accessed from a url as an HTML page)

# Testing

agile-model uses [mocha](https://mochajs.org/) and [chai](http://www.chaijs.com/) assetion library to run unit tests. Integration tests will be available with future releases.

To run the tests, simply run:

`npm test`

**_When adding new test, MAKE ABSOLUTELY SURE to set `process.env.NODE_ENV="development"` in the `before()` hook. Failing to do this will cause the tests to create files withing the projects root folder, instead of the dedicated `/test/app/` directory._**

# Contribution

If you love agile-model and want to help out, please feel free to clone, make the changes and submit a pull-request. If it checks out (with tests as well), I'll merge and add you to my contributors.

Visit the Github repository using [this link](https://github.com/kwameopareasiedu/agile-model)

If you'd also like to support me with any donations (monetary or otherwise), please send a mail and let's talk. I'll soon have a patreon account btw :)

If you discover any errors or malfunctions, please don't hesitate to open a issue on the repo and I'll look into it as soon as possible.

# Contributors

-   [Kwame Opare Asiedu](https://github.com/kwameopareasiedu/)

# Changelog

### v3.1.1

-   Updated ReadME

### v3.1.0

-   Fixed foreign key name generated by the name-generator in the model and migration template files
-   Added feature where a `find-by-#relation-id.js` is created for a model if it has a **BELONGS_TO_ONE** relation. As an example, if a model `User` **HAS_MANY** `Post` , then the reverse relationship is `Post` **BELONGS_TO_ONE** `User`. This means the `Post` model will have a **find-by-user-id.js** file as part of its database files
-   Added `authenticate` page to the portal generation
-   Replaced `DATABASE_URI` env variable in **/rollback.bat** with `DATABASE_URL`

### v3.0.0

-   Added new `create-portal` command
-   Modified structure of `agility.js` to include portal creation
-   Refactored model classes used in processing
-   Replaced `generate-model-graph.js` with `agility-parser.js` which contains much less complicated, more understandable procedures
-   Extended unit test suite to cover all utility files
-   Replaced `DATABASE_URI` environment variable in `nodemon.json` templace with `DATABASE_URL`
-   Updated ReadME

### v2.0.0

-   Removed `--no-routes` and `--no-views` switches from `agile-model setup` and `agile-model generate` commands as the routes and views are specific to each project.
-   Fixed `find-where-conditions.js` in database files group
-   Added HAS_ONE to supported relations
-   Added circular dependency resolution to model-graph-generator
-   Fixed concurrency issues in migration files. This was an issue where migration files for models with dependencies were created before their dependencies resulting in errors when using `knex migrate:latest`
-   Updated ReadME

### v1.2.0

-   Added **routes** and **views** folder structure generation to model scaffolding.
-   Fixed foreign key name resolution in `/migrations` folder
-   Added new `--no-routes` and `--no-views` switches to the `agile-model setup` and `agile-model generate` commands
-   Updated ReadME

### v1.1.0

-   Added knex migration file support
-   Fixed issue where database client is ignored from `agile-model setup --database=<database-client>`
-   Updated ReadME

### v1.0.1

-   Updated ReadME

### v1.0.0

-   Removed options from commands
-   `agile-model init` now generates the agility.js config file
-   Added model graphing
-   Added new command to cmd interface `agile-model setup --database`

### v0.1.1

-   Fixed file path issue which caused [init error](https://github.com/kwameopareasiedu/agile-model/issues/1)
