WorldSkills Angular App Skeleton
==================================

This application skeleton is to be used when creating WS Applications.

It contains a good base for a project and includes many useful components helping you to kickstart your application.



Features
-----------


* Yeoman base
* Angular 1.4.0
	* Including angular-resource, angular-cookies, angular-sanitize
	ngAnimate, ngAria, ngCookies, ngMessages, ngResource, ngRoute, ngSanitize, ngTouch
* WorldSkills Bootstrap and App templates already integrated
* [angular-ui-router](https://github.com/angular-ui/ui-router) to allow nested views
	* example views and controllers (click on the competition navi item)
* [angular-translate](https://github.com/angular-translate/angular-translate) internationalization support integrated
	* includes angular-translate-loader-url, angular-translate-static-files and angular-translate-storage-local to allow you to load static JSON files for UI element translations and store current translation in local storage (cookie fallback)
* jquery
* [angular ui-bootstrap](http://angular-ui.github.io/bootstrap)
	* **Note** If you wan't to customize your templates, remove '-tpls' from app/angular-bootstrap/bower.json under 'main'. The templates can be found from the **templates** folder under app.
* select2 ***is not*** included automatically, it's replaced by ui-select, see [angular-ui](https://angular-ui.github.io/) project for a lot of useful extras


Starting a new project
------------------------

	# Clone a shallow copy of the repository (no history)
	$ git clone --depth 1 git@github.com:worldskills/WorldSkills-Angular-Skeleton.git my_application
	$ cd my_application

	# remove existing git data
	$ rm -rf .git
	
	# initialize git for a new project
	$ git init
	
	$ npm install
	# see bower.json and update version numbers (latest stable for angular libs)
	$ bower update
	
	# start the project
	$ grunt serve
	
	# to build for distribution
	$ grunt build


It is recommended also to rename your application, at the moment it is called 'worldSkillsApp'

	angular.module('worldSkillsApp')

It is safe to use global search & replace to rename. There should be 18 references accross the project. 	
	
	

Routing your application
--------------------------

Routing is done with [angular-ui-router](https://github.com/angular-ui/ui-router)
Routing configuration can be found from **app.js**

* [API Docs](http://angular-ui.github.io/ui-router/site/#/api/ui.router)
	


Yeoman
--------
See yeoman instructions on how to create new controllers, views, directives etc.

[Yeoman on github](https://github.com/yeoman/generator-angular)


Testing
---------
**Karma unit tests**
Test files under /test/spec

	$ grunt test
	
**Protractor E2E testing**
Test files under /test/protractor

	# Start the standalone selenium server
	$ ./node_modules/selenium-standalone/bin/start-selenium
	
	# Run tests
	$ protractor protractor.conf
	


Extras
----------
[Angular-UI](http://angular-ui.github.io/) project has many other useful extras that are worth looking into depending on the needs of your project
