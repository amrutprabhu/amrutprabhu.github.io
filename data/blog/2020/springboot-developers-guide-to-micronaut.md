---
title: "A SpringBoot Developer's Guide To Micronaut"
author: 'Amrut Prabhu'
categories: ''
tags: [Spring Boot, Micronaut, Native Image, Java]
image: spring-boot-micronaut-guide/spring-boot-micronaut.jpg
photo-credits:
applaud-link: springboot-developers-guide-to-micronaut.json
date: '2021-07-21'
draft: false
summary: 'To Be filled'
imageUrl: /static/images/2021/spring-boot-micronaut-guide/spring-boot-micronaut.jpg
actualUrl: 'auto-generated'
customUrl: 'auto-generated'
---

This is a guide for spring application developers, who want to get started with using Micronaut. With this guide, you will get enough information to work with Micronaut framework.

# Introduction

Micronaut is a framework, which has gained its name for faster startup time and is usually preferred for solutions with AWS Lambda. It uses Ahead Of Time (AOT) Compilation to determine what the application needs. The result of this is an application that has a smaller memory footprint, fast start-up time, and is reflection free.

The Framework provides dependency injection, inversion of control (IOC), and Aspect-Oriented Programming (AOP) which is similar to that provided by Spring. Using Micronaut, you can create a command-line application, HTTP server application, and even event-driven application.

With this introduction, let's look into creating an application with Micronaut.

# Creating a project

To create a project you can directly go to [Micronaut’s launch](https://micronaut.io/launch) to create your project. This is similar to how spring provides a way to create a project using [https://start.spring.io.](http://start.spring.io.)

You can alternatively install a command-line utility using SDKMan. The command-line utility does the same as the launch site. More details about this are [here](https://micronaut.io/download/)

While creating a project, add `Hibernate-JPA` feature because we will be creating a project with CRUD capabilities. Once you have generated the project, we will look at the various things you would normally do as a spring developer.

## Creating a bean

Usually, in spring, you would create a bean using `@bean` , `@Restcontroller` , `@service` , `@repository`, etc. In Micronaut, we have some annotation that is similar to those. Let’s look at them.

- `@controller` — To define your controller class for your rest endpoints.
- `@repository` — To define your repository bean.
- `@singleton` — To define a bean with singleton scope.
- `@prototype` — To define a bean with prototype scope
- `@requestscope` — To define a bean with request scopes.

There is no `@service` or `@component` annotation, but rather you can use the above annotations to create a service or a component.

In addition to these, we have `@infrastructure` to define a bean that is critical for the application running which should not be overridden, and `@threadlocal` annotation to scope the bean per thread.

To inject a particular bean, Micronaut supports the same injection mechanism like constructor based, setter based, name based, which is similar to what spring provides. In case of an `@autowire` , you would now use an `@inject` annotation.

You can also have bean life cycle methods, conditional beans, bean qualifiers, etc, which are similar to those provided by spring. You can always read more about it in Micronaut’s documentation [here](https://docs.micronaut.io/latest/guide/#ioc).

## Dependencies

Now, I am creating a CRUD application that communicates with MySQL. The minimum dependencies from Micronaut I needed were

```xml
   <dependency>
      <groupId>io.micronaut</groupId>
      <artifactId>micronaut-inject</artifactId>
      <scope>compile</scope>
    </dependency>
    <dependency>
      <groupId>io.micronaut</groupId>
      <artifactId>micronaut-http-server-netty</artifactId>
      <scope>compile</scope>
    </dependency>
    <dependency>
      <groupId>io.micronaut.data</groupId>
      <artifactId>micronaut-data-hibernate-jpa</artifactId>
      <scope>compile</scope>
    </dependency>
    <dependency>
      <groupId>io.micronaut.sql</groupId>
      <artifactId>micronaut-jdbc-hikari</artifactId>
      <scope>compile</scope>
    </dependency>
```

Apart from these, I had to add `mysql-connector-java` driver to communicate with MySQL.

## JPA configuration

To create your entities, you can use the usual `javax.persistence` annotations to create your entities, define ids, columns, etc.

```java
@Entity
@Table(name = "Orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
```

Your data source and hibernate config also remains pretty much the same

```properties
datasources:
  default:
    url: jdbc:mysql://localhost:3306/ORDER
    username: root
    password: root
jpa:
  default:
    properties:
      hibernate:
        hbm2ddl:
          auto: update
        show_sql: true
        dialect: org.hibernate.dialect.MySQL8Dialect
```

For querying your database, we get implementations from Micronaut for interfaces you create by extending interfaces like CRUDRepository or JPARepository. We also have JPA query support using the `@query` annotation. Here is the code for a JPA repository with an example query method.

```java
@Repository
public interface OrderRepository extends CrudRepository<Order, Long> {

    @Query("select o from Order as o")
    List<Order> getAllOrders();
}
```

## REST Controller

A REST controller can be created using the `@controller` annotation and provide your GET, PUT, POST mappings using the `@get` , `@put` , `@post` annotations respectively. All of these annotations come from the `micronaut-http-client` dependency.

```java
@Controller("/order")
public class WebController {

    private final OrderService orderService;

    public WebController(OrderService orderService) {
        this.orderService = orderService;
    }

    @Get("/{id}")
    public HttpResponse<OrderDTO> getOrder(@PathVariable("id") Long id) {

        Optional<OrderDTO> mayBeOrder = orderService.getOrder(id);
        if (mayBeOrder.isPresent()) {
            return HttpResponse._created_(mayBeOrder.get());
        }
        return HttpResponse._notFound_();
    }
```

# Performance

With the above configuration, the application starts up in nearly **2 secs**.

```bash
__  __ _                                  _
|  \/  (_) ___ _ __ ___  _ __   __ _ _   _| |_
| |\/| | |/ __| '__/ _ \| '_ \ / _` | | | | __|
| |  | | | (__| | | (_) | | | | (_| | |_| | |_
|_|  |_|_|\___|_|  \___/|_| |_|\__,_|\__,_|\__|
  Micronaut (v2.5.8)

12:55:07.769 [main] INFO  com.zaxxer.hikari.HikariDataSource - HikariPool-1 - Starting...
12:55:08.150 [main] INFO  com.zaxxer.hikari.HikariDataSource - HikariPool-1 - Start completed.
12:55:08.157 [main] INFO  org.hibernate.Version - HHH000412: Hibernate ORM core version [WORKING]
12:55:08.248 [main] INFO  o.h.annotations.common.Version - HCANN000001: Hibernate Commons Annotations {5.1.2.Final}
12:55:08.351 [main] INFO  org.hibernate.dialect.Dialect - HHH000400: Using dialect: org.hibernate.dialect.MySQL57Dialect
12:55:09.059 [main] INFO  io.micronaut.runtime.Micronaut - Startup completed in 1928ms. Server Running: [http://localhost:8080](http://localhost:8080)
```

Now, there is a catch here.

When the application starts up, the beans are yet to be wired up and this happens lazily. When the application receives the first request, the bean wiring takes place and hence there is a little delay for the first request that is being served. The subsequent requests are then pretty fast.

Here are the statistics.

![Statistics](/static/images/2021/spring-boot-micronaut-guide/stats.png)

Now to achieve the real boost in startup performance, we can create a Native image. With a native image, you can get a startup time of about 90 ms.

Yes, **90 milliseconds** with JPA CRUD capabilities.

To learn how to achieve this incredible initial startup time. You can read my next article “[Boost Java Application Performance With Micronaut Native Image](/boost-java-application-performance-with-micronaut.html)”.

As usual, I have uploaded the code for this article on [GitHub](https://github.com/amrutprabhu/micronaut-workout/tree/master/MicronautApp).

## YouTube Video

You can have a visual walk-through in the video below.

<iframe width="560" height="315" src="https://www.youtube.com/embed/3k6dkgyGok8" frameborder="0" allowfullscreen></iframe>
