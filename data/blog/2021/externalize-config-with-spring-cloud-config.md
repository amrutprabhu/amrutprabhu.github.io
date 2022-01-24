---
title: 'Externalizing Application Configuration With Spring Cloud Config'
author: 'Amrut Prabhu'
categories: ''
tags: [Spring Boot, Java, Configuration, Spring cloud config server, Spring cloud]
image: 2021/spring-cloud-config-server-git-backend/cover.jpg
photo-credits:
applaud-link: 2021/externalizing-config-with-spring-cloud-config.json
date: '2021-10-14'
draft: false
summary: 'In this article, we would be looking at how we can externalize application configuration using Spring Cloud Config.'
imageUrl: /static/images/2021/spring-cloud-config-server-git-backend/cover.jpg
actualUrl: 'auto-generated'
customUrl: 'auto-generated'
---

In this article, we would be looking at how we can externalize configs using Spring Cloud Config.

# Introduction

One of the principles from the [12 Factor App](https://12factor.net/config), states that we have to separate our application configuration from the code. The configuration varies based on the environment and it's better to organize them based on the environment your application is running.

So in this article, we will be looking at how we can externalize configurations with Spring Cloud Config.

# Spring Cloud Config

Spring cloud config consists of two parts.

- A server to provide the configuration
- A client to fetch the configuration.

Let’s look at how we can set up the spring cloud config server to provide configuration to any application.

## Spring Cloud Config Server

Let’s go to [https://start.spring.io](https://start.spring.io) and create a project with the following dependencies.

- Spring Cloud Config Server

Once you open the project, we need to configure the application to allow it to serve configuration. Now, the server can be configured with quite a few backends with which you can organize any client’s configuration. Here is a list of some of the supported backend.

- Git URL
- AWS S3 bucket.
- Redis
- File System location.
- HashiCorp Vault.
- Cloudfoundary’s CredHub.

These are some of the popular ones I have listed, but a few more backends can be integrated. You can find the list [here](https://cloud.spring.io/spring-cloud-config/reference/html/#_environment_repository)

Today we will explore how to configure Spring Cloud Config server with Git URL as the backend.

## Configuring Spring Cloud Config with Git

To configure this, we will jump to the properties file.

Let’s start with the most basic config.

```yaml
server:
  port: 8888

spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/amrutprabhu/spring-boot-external-configuration-options
```

This is the most minimalistic configuration required to use a git repo as a store for our client configurations.

Now, Let's create some configuration files, in the git repo.

Here we have to organize the application property file names in the format `{client.application.name}-{profile}.yaml (or .properties)` .

For this example, we will only be setting the `server.port` property in the property files, so that the server starts on a different port depending on the profile.

Throughout this example, we would be considering a client whose application name is “config-client”.

![config files](/static/images/2021/spring-cloud-config-server-git-backend/root.png)

With this Let’s start the application.

We can test the server to check the config it fetches for different profiles. To check this, we can hit the server with the following URL format.

```
http://localhost:8888/{client.application.name}/{profile}
e.g
http://localhost:8888/config-client/dev
```

On hitting the above URL, we get the following.

![dev profile call](/static/images/2021/spring-cloud-config-server-git-backend/root-test-call.png)

As you can see, it is fetching the default config as well as the dev config here. This means that when the client starts up with the profile `dev` , it will use the properties from the dev YAML file, overriding the properties from the default file just as if the files had to be locally available to the client. Hence we get both the default as well as the dev-specific properties file.

## Customizing Config Location with Different Repositories

Now, What if you want to organize the properties files in different repository locations?

For example, we want to have a different repo for each environment. To do this we will extend the properties further as follows.

```yaml
server:
  port: 8888

spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/amrutprabhu/spring-boot-external-configuration-options
          repos:
            staging-properties-repo:
              pattern: config-client/staging
              uri: https://github.com/amrutprabhu/spring-boot-external-configuration-options
              search-paths:
                - spring-cloud-config-server-setup/configs-location
```

Now, here I have specified a repo name `staging-properties-repo` with a repo URI, a search path, and a pattern. For this example, I am using the same git repo, but you can use a completely different git repo that you want.

Now, here we can specify a pattern which is of the following format : `{client's application name}/{client's application profile}` . As it's a pattern you can use wild card patterns. e.g

```
config-client*/*
config-client/dev-*
config-*/dev*
```

Next, the `search-paths` property helps you to define locations, under which the config can be searched.

Since I have moved the properties under two subfolders I have mentioned the subfolder location in the `search-paths`.

![config in sub folder](/static/images/2021/spring-cloud-config-server-git-backend/moved-to-sub-folder.png)

On restarting the application and hitting the URL, we get the following output for the staging profile.

![staging profile call](/static/images/2021/spring-cloud-config-server-git-backend/staging-test-call.png)

#### Customizing Search patterns

We can customize the configuration using some reserved placeholders.

- `{application}` - to refer to the client’s application name.
- `{profile}` - to refer to the client’s application profile.

Let use these placeholders to add some more repos.

```yaml
prod-properies-repo:
  uri: https://github.com/amrutprabhu/spring-boot-external-configuration-options
  pattern: config-client/prod
  search-paths:
    - spring-cloud-config-server-setup/configs-location/{profile}

any-request-repo:
  uri: https://github.com/amrutprabhu/spring-boot-external-configuration-options
  pattern: config-client*/*
  search-paths:
    - spring-cloud-config-server-setup/configs-location/{application}/{profile}
```

Now here, the first repo has the profile name as the subdirectory to search for when the request comes in for the`prod` profile.

In the second one, if any other request comes in, then it would use the client application name and the profile subdirectory tree. Here is how the folders are organized.

![git folder structure](/static/images/2021/spring-cloud-config-server-git-backend/git-folder-structure.png)

Now with the new repos added, let’s restart the application and test the output.

![prod profile call](/static/images/2021/spring-cloud-config-server-git-backend/prod-profile.png)

![dev profile call](/static/images/2021/spring-cloud-config-server-git-backend/dev-profile.png)

These are just some ways you can organize your configuration.

Now you must be wondering…

> What happens if the configuration is changed on git when the config server is running?

In this case, the config server will automatically pull the new configuration and give it to the requesting client on subsequent requests. No need to restart the config server.

> What happens if there is a matching pattern but no properties for that particular profile are found?

In this case, it would try to find the properties from the default repo i.e. from the property `spring.cloud.config.server.git.uri` . If there are no properties available from the default repo, it will return empty Property Sources JSON.

With this, we are ready with our spring cloud config server.

Let’s create a client for this.

## Creating Spring Cloud Config Client.

For this, We will create an application using [https://start.spring.io](https://start.spring.io) with the following dependencies.

- Spring Cloud Starter Config
- Spring Boot Web Starter (required only for tomcat server)

Now, let's add some properties to the `application.yaml` file.

```yaml
spring:
  application:
    name: config-client
  config:
    import: 'configserver:'
```

Now since the [Spring Cloud 2020.0 version](https://github.com/spring-cloud/spring-cloud-release/wiki/Spring-Cloud-2020.0-Release-Notes#breaking-changes), we need to specify from where we want the configs to be loaded. Since we are using a config server, We have to specify the property `spring.config.import="configserver:"`

The location from where the configs will be fetched is added to the`bootstrap.yaml` file.

```yaml
spring:
  cloud:
    config:
      uri: http://localhost:8888
```

With this let’s build the application and run it using the following command with a profile argument

```shell
java -jar target/config-client-service-0.0.1-SNAPSHOT.jar \
--spring.profiles.active=prod
```

The client starts with port 9090, which is what was defined in the prod profile properties file.

![prod profile console](/static/images/2021/spring-cloud-config-server-git-backend/clinet-prod-console.png)

On starting the client service with the staging profile, It starts at port 6060

![staging profile console](/static/images/2021/spring-cloud-config-server-git-backend/staging-profile-console.png)

## Useful Tip.

Now to test your configuration from the config server, It can become tedious to change the config, push the changes to git and then test the output.

You can make this easy by replacing the git URL with a local directory location where the configs repo is checked out. e.g

```yaml
prod-properies-repo:
  uri: file:///home/user/spring-boot-external-configuration-options
  pattern: config-client/prod
  search-paths:
    - spring-cloud-config-server-setup/configs-location/{profile}
```

You can then change the files locally and test your config server.

# Conclusion

We just saw how to configure a spring cloud config server with a git repository backend and use it to start a client application. There have been some changes since spring cloud version 2020.0 and this example demonstrates the integration.

As usual, I have uploaded the code on [GitHub](https://github.com/amrutprabhu/spring-boot-external-configuration-options/tree/master/spring-cloud-config-server-setup).

I keep exploring and learning new things. If you want to know the latest trends and improve your software development skills, then subscribe to my newsletter below and also follow me on [Twitter](https://twitter.com/amrutprabhu42).

Enjoy!!
