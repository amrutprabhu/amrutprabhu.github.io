---
title: 'Build Native Image For A Spring Boot Application'
author: 'Amrut Prabhu'
categories: ''
tags: [Java, Spring Boot, Native Image, GraalVM]
photo-credits:
applaud-link: 2021/spring-boot-stream-kafka.json
date: '2022-11-03'
draft: false
summary: 'We will look into the various important aspects of what is required to create a native image and how it is created'
imageUrl: /static/images/2022/build-native-image-with-graalvm/cover.jpg
actualUrl: 'auto-generated'
customUrl: 'auto-generated'
---

In this article, we will look into the various important aspects of what is required to create a native image and how it is created.

## Introduction

Spring Boot 3.0 is the next major release providing quite a huge set of features and improvements. It will be using Spring framework 6.0 and the baseline Java version is going to be Java 17.

Now one of the major features provided is the ability to build native images using GraalVM out of the box.

There are two ways you can build the native images

- Using the Cloud Native Buildpacks mechanism which will create a container with a native executable.
- Using GraalVM Native build tools.

We will be exploring creating a native image using GraalVM Native build tools.

Before we create a native image, let's understand what a native image is.

<AdsFlows id="adflow1" slot="8168941152" />

## What is a Native Image

A native image is a standalone executable of a Java application. We no longer need to create an executable jar nor require a JVM to run it.

Since there is no JVM involved, we lose the concept of dynamic class loading, Lazy loading, reflection, proxying classes, etc.

**_So then how does the Spring Boot Application work?_**

To execute the application, all information required to run the application must be known during build time.

During build time, the code is statically analyzed from the “main” method entry point using ahead-of-time processing (AOT). This means any class that is not reachable is not included in the native image. The classpath is fixed and no lazy loading happens at runtime.

Features like reflection, resources, and proxy class information need to be provided to GraalVM during image creation. To do this, special JSON config files called Hint files are created to tell GraalVM how to deal with it.

**_What advantage does it give us?_**

The most important one is the application’s speed of execution.

When we execute the native image, everything included in the native image is loaded in memory. This helps in achieving very high performance at runtime.

It also has its share of drawbacks like e.g you cannot use `@profile` or conditional bean loading using `@ConditionalOnProperty`

With this overview, let’s create an application and explore what gets created.

<AdsFlows id="adflow2" slot="2393870295" />

## Creating an Application

Let’s start by creating a simple application from [https://start.spring.io](https://start.spring.io), which has a REST endpoint and returns a static string.

For this, we will add the Spring Web dependency and we will be using Spring Boot version 3.0.0.

Let’s create a simple controller that returns a static string

```java
@RestController
public class WebController {

    @GetMapping("/")
    public String getValue() {
        return "Yes! it works";
    }
}
```

Now to build the native image, we need GraalVM version 22.3. You can install it using [sdkman](https://sdkman.io/) or download it from [here](https://www.graalvm.org/downloads/).

Next, we are going to build the image using the following command.

```shell
mvn native:compile -Pnative
```

Building the native image may take some time which depends on the system you are using.

```shell
========================================================================================================================
GraalVM Native Image: Generating 'native-image-build' (executable)...
========================================================================================================================
[1/7] Initializing...                                                                                    (6.7s @ 0.18GB)
 Version info: 'GraalVM 22.3.0-dev Java 17 CE'
 Java version info: '17.0.5+8-LTS'
 C compiler: gcc (linux, x86_64, 11.2.0)
 Garbage collector: Serial GC
 1 user-specific feature(s)
...
...
...
[2/7] Performing analysis...  [*********]                                                               (56.0s @ 1.94GB)
  15,703 (92.40%) of 16,995 classes reachable
  25,992 (67.87%) of 38,299 fields reachable
  76,294 (62.25%) of 122,556 methods reachable
     786 classes,   156 fields, and 3,712 methods registered for reflection
      64 classes,    70 fields, and    55 methods registered for JNI access
       4 native libraries: dl, pthread, rt, z
[3/7] Building universe...                                                                               (7.7s @ 5.14GB)
[4/7] Parsing methods...      [***]                                                                      (6.1s @ 2.43GB)
[5/7] Inlining methods...     [****]                                                                     (2.8s @ 5.23GB)
[6/7] Compiling methods...    [*******]                                                                 (51.4s @ 1.15GB)
[7/7] Creating image...                                                                                  (7.1s @ 3.66GB)
  34.01MB (46.06%) for code area:    50,037 compilation units
  37.08MB (50.22%) for image heap:  375,456 objects and 395 resources
   2.75MB ( 3.73%) for other data
  73.84MB in total
------------------------------------------------------------------------------------------------------------------------
Top 10 packages in code area:                               Top 10 object types in image heap:
   1.63MB sun.security.ssl                                     7.48MB byte[] for code metadata
   1.06MB java.util                                            5.83MB byte[] for embedded resources
 826.38KB java.lang.invoke                                     3.75MB java.lang.Class
 717.97KB com.sun.crypto.provider                              3.53MB java.lang.String
 641.59KB org.apache.tomcat.util.net                           3.08MB byte[] for general heap data
 534.06KB org.apache.catalina.core                             2.91MB byte[] for java.lang.String
 493.46KB org.apache.coyote.http2                              1.32MB com.oracle.svm.core.hub.DynamicHubCompanion
 473.01KB java.lang                                          850.48KB byte[] for reflection metadata
 470.23KB com.sun.org.apache.xerces.internal.impl            685.03KB java.util.HashMap$Node
 461.63KB sun.security.x509                                  684.50KB java.lang.String[]
  26.44MB for 658 more packages                                6.20MB for 3105 more object types
------------------------------------------------------------------------------------------------------------------------
                        6.7s (4.6% of total time) in 42 GCs | Peak RSS: 6.54GB | CPU load: 6.24
------------------------------------------------------------------------------------------------------------------------
```

<AdsFlows id="adflow3" slot="1404222257" />

That's pretty simple, right?

Let's look at what is done behind the scenes to create this build.

In the target folder, we would usually find compiled classes of our application in the classes directory. But now we have some more classes.

![proxy classes](/static/images/2022/build-native-image-with-graalvm/proxy-classes.png)

These are some of the proxy classes that are created at build time before the native image is created to provide the proxy class support.

To generate the sources for these proxy classes, Spring AOT processing starts the application up to the point the bean definitions are available and then generates the sources. These are available under the `spring-aot` folder as shown below.

![proxy classes source files](/static/images/2022/build-native-image-with-graalvm/proxy-classes-source-files.png)

In the META-INF folder, under the application’s package, you would find the `reflect-config.json` hint files which will provide information to GraalVM to handle cases where refection is used. This is also the same way how resources are handled using the `resource-config.json` file.

Finally, after creating all these files and classes, the native image is built using GraalVM.

Let’s now look at its speed of execution.

<AdsFlows id="adflow4" slot="2523816518" />

## Performance metrics

Let’s start the application by building a normal executable jar with maven build and then find its performance numbers to compare it with the native image.

On running the application as an executable jar, we get this output.

![spring-boot-jar-startup](/static/images/2022/build-native-image-with-graalvm/spring-boot-jar-startup.png)

While running the native image we get this output

![native-image-startup](/static/images/2022/build-native-image-with-graalvm/native-image-startup.png)

The native image starts nearly **31** times faster as compared to the normal jar running on a JVM.

Let’s look at the time it takes to serve a GET request.

Here is the time it takes for the jar to serve requests on a JVM.

![spring-boot-get-performance](/static/images/2022/build-native-image-with-graalvm/spring-boot-get-performance.png)

Here is the time it takes for the native image to serve requests.

![native-image-get-performance](/static/images/2022/build-native-image-with-graalvm/native-image-get-performance.png)

Here is a full comparison between the two.

![statistics](/static/images/2022/build-native-image-with-graalvm/statistics.png)

That's a huge improvement in performance in terms of startup time.

Now obviously the number may vary a bit based on different machines and also depends on how complex the application is. But still, there would be a significant amount of performance improvement.

<AdsFlows id="adflow5" slot="9474283966" />

### Conclusion

GraalVM is bringing in high performant Java applications to the table but it also loses some of the flexibility we get from running a Spring Boot application on a JVM.

Finally, you have to decide, what is important to you.

I see it as a new possibility that Java is providing to the programmers and we will see over the years how this pans out.

I keep exploring and learning new things. If you want to know the latest trends and improve your software development skills, then subscribe to my newsletter below and also follow me on [Twitter](https://twitter.com/amrutprabhu42).

Enjoy!!
