#Periodic [![Build Status](https://travis-ci.org/typesettin/periodicjs.svg?branch=master)](https://travis-ci.org/typesettin/periodicjs) [![NPM version](https://badge.fury.io/js/periodicjs.svg)](http://badge.fury.io/js/periodicjs)

## Periodic is an application framework built on top of Express and MongoDB designed for data driven, content based web and mobile applications. 

The platform is 100% open source and composed of extremely modular components that enable creating bespoke [Node.js](nodejs.org)/[Express](expressjs.com)/[MongoDB](http://www.mongodb.org/) based applications efficiently with new or existing themes and extensions.

### What can I build with Periodic?
The platform is built with the UNIX / small utility / modular application design philosophy in mind. Content creators, developers, software engineers and entrepreneurs are encouraged to build large robust applications by integrating small single purposed extensions.

Periodic emphasizes a curated (and non-opinionated) workflow, using Express with MongoDB and an extremely malleable data model. 

The use of additional frameworks, templating languages and design libraries is highly encouraged.

Applications built with Periodic range from simple blogs, complicated enterprise media publications, mobile application datastores, e-commerce platforms and more.

### What's included?
* **Flexible information hierarchy & data model**  
    Efficiently create custom content items and groupings, with custom content types and additional data attributes
* **Theming & unrestrictive layouts**  
    Override application functionality with framework friendly, design library agnostic custom themes.
* **Modular & infinitely extendible**  
    Add extensions, node modules and more functionality with ease. 
* **High Scalable, Deployment & Enterprise Friendly**  
    Quickly deploy and manage instances with PM2. Cloud friendly and create edge nodes, read only and private content management instances. 

[Get started with your first Periodic Application](https://github.com/typesettin/periodicjs/wiki/Getting-Started)

### Quick start guide
```
$ npm start --e [name-of-environment (development by default)] # runs nodemon
$ npm run forever --e [name-of-environment (development by default)] # runs forever + nodemon
$ npm run deploy --e [name-of-environment (development by default)] # deploys with pm2
$ npm run sync # syncs dependencies
```

| [![Install home](https://raw.githubusercontent.com/typesettin/wiki-resources/master/images/periodic/install-start-screen.png)](https://raw.githubusercontent.com/typesettin/wiki-resources/master/images/periodic/install-start-screen.png) | [![Admin home](https://raw.githubusercontent.com/typesettin/wiki-resources/master/images/periodic/admin-content-dropdown.png)](https://raw.githubusercontent.com/typesettin/wiki-resources/master/images/periodic/admin-content-dropdown.png) | [![New Item](https://raw.githubusercontent.com/typesettin/wiki-resources/master/images/periodic/admin-item-new-2.png)](https://raw.githubusercontent.com/typesettin/wiki-resources/master/images/periodic/admin-item-new-2.png) | [![review revision](https://raw.githubusercontent.com/typesettin/wiki-resources/master/images/periodic/admin-review-revisions-collection.png)](https://raw.githubusercontent.com/typesettin/wiki-resources/master/images/periodic/admin-review-revisions-collection.png) |
|---------------|----------------|--------------------|-----------------|
| [![View default](https://raw.githubusercontent.com/typesettin/wiki-resources/master/images/periodic/view-default.png)](https://raw.githubusercontent.com/typesettin/wiki-resources/master/images/periodic/view-default.png) | [![Settings](https://raw.githubusercontent.com/typesettin/wiki-resources/master/images/periodic/admin-settings-periodic.png)](https://raw.githubusercontent.com/typesettin/wiki-resources/master/images/periodic/admin-settings-periodic.png) | [![Edit Collection](https://raw.githubusercontent.com/typesettin/wiki-resources/master/images/periodic/admin-collection.png)](https://raw.githubusercontent.com/typesettin/wiki-resources/master/images/periodic/admin-collection.png) | [![View home](https://raw.githubusercontent.com/typesettin/wiki-resources/master/images/periodic/view-home.png)](https://raw.githubusercontent.com/typesettin/wiki-resources/master/images/periodic/view-home.png) |
| [![list extensions](https://raw.githubusercontent.com/typesettin/wiki-resources/master/images/periodic/admin-extensions.png)](https://raw.githubusercontent.com/typesettin/wiki-resources/master/images/periodic/admin-extensions.png) | [![search extensions](https://raw.githubusercontent.com/typesettin/wiki-resources/master/images/periodic/admin-extensions-install.png)](https://raw.githubusercontent.com/typesettin/wiki-resources/master/images/periodic/admin-extensions-install.png) | [![new theme install modal](https://raw.githubusercontent.com/typesettin/wiki-resources/master/images/periodic/admin-themes-install-modal.png)](https://raw.githubusercontent.com/typesettin/wiki-resources/master/images/periodic/admin-themes-install-modal.png) | [![assets](https://raw.githubusercontent.com/typesettin/wiki-resources/master/images/periodic/admin-collection-assets-list.png)](https://raw.githubusercontent.com/typesettin/wiki-resources/master/images/periodic/admin-collection-assets-list.png) |
