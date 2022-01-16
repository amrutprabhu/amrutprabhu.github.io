---
title: 'Micronaut JPA Application Performance on AWS Lambda'
author: 'Amrut Prabhu'
categories: ''
tags: [Spring Boot, Micronaut, AWS, AWS Lambda, Native Image, Java]
image: micronaut-lambda-application/cover.jpg
photo-credits:
applaud-link: micronaut-aws-lambda-application-for-api-gateway.json
date: '2021-08-12'
draft: false
summary: 'To Be filled'
imageUrl: /static/images/2021/micronaut-lambda-application/cover.jpg
actualUrl: 'auto-generated'
customUrl: 'auto-generated'
---

In this article, we would be looking into how we can deploy a Micronaut application providing GET, PUT and POST which can be called using an API Gateway. Then we would compare its performance when deployed with JVM runtime and as a native image.

# Introduction

In this article, I would be focusing on creating the application that can be deployed on an AWS Lambda and then call the application as if it's being called using an API Gateway.

I have previously written an article [here](https://refactorfirst.com/micronaut-jpa-aws-lambda-function.html) which will help you to create a Micronaut function handler from scratch. I would recommend you to read it if you want to start from the beginning. If you want to skip it, you can use the code directly from my [Github repo](https://github.com/amrutprabhu/micronaut-workout/tree/master/micronaut-lambda-function).

With this let’s get started.

# Code Modifications

Now from the application you just created or got from the GitHub repo above, We would make some modifications to the code to start serving requests.

We can apply a simple MVC pattern, wherein we can create a controller, a service that has some business logic and does the transformation from a DTO to a model, and then a repository to persist it. This pattern is totally optional to implement. You can also apply a Domain-Driven Design(DDD) pattern to structure your code. If you would like to see a simple DDD code structure pattern using Micronaut you can have a look at this [GitHub repo](https://github.com/amrutprabhu/micronaut-workout/tree/master/MicronautApp).

But we will keep things simple and call the repository directly from the controller, similar to our previous example wherein we called the repository from the handler function.

So the first change we will do is delete two classes.

- OrderLambdaRuntime
- OrderRequestHandler

With this, we will be left with only the model and repository.

Now, let's create our controller to handle the incoming request. I will create two methods, PUT to add orders and GET to get all the orders.

```java
@Validated
@Controller
public class WebController {

    final private OrderRepository orderRepository;

    public WebController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Get("/{id}")
    public HttpResponse<Order> getOrder(@PathVariable("id") Long id) {

        Optional<Order> mayBeOrder = this.orderRepository.findById(id);
        if (mayBeOrder.isPresent()) {
            return HttpResponse._created_(mayBeOrder.get());
        }
        return HttpResponse._notFound_();
    }

    @Get
    public HttpResponse<List<Order>> getAllOrders() {
        return HttpResponse._ok_(this.orderRepository.getAllOrders());
    }

    @Put
    public HttpResponse<Order> addOrder(@Body @Valid Order order) {
        Order savedOrder = orderRepository.save(order);
        return HttpResponse._ok_(savedOrder);
    }
```

![AWS Lambda Code](/static/images/2021/micronaut-lambda-application/code.png)

We also would now change the database from MySQL to Postgres. For this, we would add the Postgres driver dependency and the corresponding connection string in the properties file.

```xml
<dependency>
  <groupId>org.postgresql</groupId>
  <artifactId>postgresql</artifactId>
  <version>42.2.18</version>
</dependency>
```

---

```properties
datasources:
  default:
    url: jdbc:postgresql://database.ashdjsirje.eu-central-1.rds.amazonaws.com/orders_db?characterEncoding=UTF-8
    username: postgres
    password: nopass
    driverClassName: org.postgresql.Driver
```

I had to switch to Postgres because the MySQL driver was unstable when using it in a native image. It could not deserialize the object properly when it was being fetched.

With this, we are ready to build the application and deploy it on the Lambda JVM runtime

# Deploying with JVM runtime.

Let’s build the application using `mvn clean package` , and then deploy it to an AWS Lambda using Java 11 runtime. Once created, set the handler function to a class provided by Micronaut i.e. `io.micronaut.function.aws.proxy.MicronautLambdaHandler` . Now, this class comes from the dependency `micronaut-function-aws-api-proxy` which we had already added previously.

![lambda function definition](/static/images/2021/micronaut-lambda-application/lambda-function-application.png)

Once we are ready, We can then trigger the lambda in the test section using the following payload.

```json
{
  "body": "{\"name\":\"Order from Lambda application\"}",
  "resource": "/",
  "path": "/",
  "httpMethod": "PUT"
}
```

We can now also retrieve the persisted orders by making a GET call as follows.

```json
{
  "resource": "/",
  "path": "/",
  "httpMethod": "GET"
}
```

Once you hook the lambda function with an API getaway, the input request is similar to the one we just sent to the function as an input.

Now with this, let's look at the statistics I got for lambda configured with 512MB

![AWS lamda function statistics ](/static/images/2021/micronaut-lambda-application/micronaut-aws-function-statistics.png)

Let’s now look at improving the application performance by creating a Native image.

## Deploying Native Image on AWS Lambda with Custom Runtime

To build the native image, we would use a GraalVM JDK. I have used GraalVM CE 21.1.0 (build 11.0.11) for Java 11.

Before building, we have to set one extra property in the pom.xml file. we need to set the main class.

```xml
<exec.mainClass>io.micronaut.function.aws.runtime.MicronautLambdaRuntime</exec.mainClass>
```

Now we can then run the following command to build the image.

```bash
./mvnw clean package -Dpackaging=docker-native -Dmicronaut.runtime=lambda
```

It may take around 3–5 minutes to build the zip file containing the native image depending on your system.

Next, let's create an AWS lambda function with the custom runtime option “Provide your own bootstrap on Amazon Linux 2”, and then upload the zip file.

![AWS Lambda function native image](/static/images/2021/micronaut-lambda-application/micronaut-aws-function-native.png)

This time you don’t need to set any handler function as the bootstrap file in the zip will start the application.

You can now trigger the application with the same tests from above to persist an order or to get a list of orders.

With native images, we get a significant improvement with the init time being only around **932ms** during cold start and the subsequent PUT requests came close to **16ms**.

Here are the statistics I got.

![AWS Lambda native image statistics](/static/images/2021/micronaut-lambda-application/micronaut-aws-lambda-native-image-statistics.png)

I have uploaded the code on [GitHub](https://github.com/amrutprabhu/micronaut-workout/tree/master/micronaut-lamdba-application)

With this, we are at the end of series of articles exploring Micronaut. But this is not the end. I would be exploring more frameworks and Micronaut will be on my radar for new features.

Stay tuned with new trends in frameworks and software development in general by subscribing to my newsletter to get updates on more such articles.
