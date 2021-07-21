---
layout: post
title: "Boost Java Application Performance With Micronaut Native Image"
author: "Amrut Prabhu"
categories: ""
tags: [Spring Boot, Micronaut, Native Image, Java]
image: micronaut-native-image-graalvm/micronaut-native-image-graalvm.jpg
photo-credits: ""
applaud-link: boost-java-application-performance-with-micronaut.json
---
In this article, I would show how you can achieve an incredibly quick start-up time for your java application in the order of around 90 ms.

Yes, **90 milliseconds**.

<br/>
# Introduction

Nowadays, we are all familiar with spring and spring boot to provide the best features of dependency inject, Inversion of control (IOC), Aspect Oriented Programming (AOP). But to provide these features, spring needs to do a bunch of stuff behind the scenes, such as wiring of objects, proxying objects, etc which takes some time when the application starts up.

With applications becoming cloud-native, we want quick start-up time and better memory utilization.

Micronaut is a framework that provides the above features, including the advantage of faster start-up time and lesser memory footprint by making use of Ahead Of Time (AOT) compilation.

You can read my previous article on “Spring Boot developer’s guide to Micronaut”, wherein I explain the basic concepts of Micronaut and also create a Micronaut CRUD application example.

In this article, we would be talking about how we can boost the start-up performance using the Micronaut framework for the same example application from the previous article.

<br/>
# Performance out of the box

Since Micronaut uses AOT compilation, this technique helps to reduce the start-up time. A normal CRUD application, which uses JPA with Hibernate to communicate with MYSQL takes about 2 secs to starts up.

But there is a catch here. The application may start up in 2  secs, but the first REST call to the application takes a bit of time. This is because of the lazy initialization of the controller resource. Once this happens, the subsequent requests are pretty quick.

![Micronaut Statistics](/assets/img/spring-boot-micronaut-guide/stats.png)

Now let's try to tune this to achieve higher performance.

<br/>
# Creating a Native Image

To obtain even better performance, we would be creating a native image of the application, using a special JVM called the [GraalVM](https://www.graalvm.org/).

GraalVM provides this mechanism that helps to create a native image of the application which you can execute as a standalone executable. The build process builds the executable with all the required dependencies such that you don't need even the JVM to run the application.

To build this native image, I have used GraalVM CE 21.1.0 (build 11.0.11) which is for Java 11. We can then run the following command to build the image.
```
./mvnw clean package -Dpackaging=native-image
```
This will start building the native image and the build time would take around 3–5 mins depending on the system you have.

Once the build finishes, there will be an executable created in the target folder. You can execute it as any other executable and you don't need a JVM to run it.

<br/>
## Performance Statistics

After executing the native image, I got the following statistics for a Micronaut JPA application with CRUD capabilities.

![Micronaut Native Image Statistics](/assets/img/micronaut-native-image-graalvm/micronaut-native-image-statistics.png)

This is a huge performance boost in start-up and response time compared to the application running on a JVM.

You can try this out by yourself, I have uploaded the code to [GitHub](https://github.com/amrutprabhu/micronaut-workout/tree/master/MicronautApp).

In my next article, I would be talking about the application's performance with Micronaut on AWS Lambda. So subscribe to my newsletter to know once the article out.