# Customizing Your Application 

Periodic applications are comprised of three component features that can be customized:

1. Your Application
2. Your Extensions
3. Your Contianer

## 1. Your Application
Periodic applications are configured per runtime environment, this means for example in a development environment you could use a disk based/ or memory based configuration with Lowkie, in QA and Staging you could use a document based configuration in Mongo or Redis, and in Production you could use a SQL based configuration.

Configurations and Database connections are all instances of Core Data. Core Data allows you to have a heterogenious mix of resources from different databases (You could have your user, order, and transaction data in SQL, and your product catelog in Mongo).

The general configuration flow is to:
1. Define where your configuration database
2. Create environment specific configuration json documents for your application and extensions
3. Add the configurations to your application's configuration database

## 2. Your Extensions

Extensions are used to

## 3. Your Containers

Containers are used to

All Configurations settings are merged from a set of default configurations, environment specific configurations and finally override configurations.

NEXT: [ Configuration ](https://github.com/typesettin/periodicjs/blob/master/doc/configuration/01-overview.md) 