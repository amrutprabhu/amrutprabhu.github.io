---
title: 'Micronaut JPA Function Performance on AWS Lambda'
author: 'Amrut Prabhu'
categories: ''
tags: [Micronaut, AWS Lambda, AWS, Native Image, Java]
image: micronaut-jpa-aws-lambda-function/cover.jpg
photo-credits:
applaud-link: micronaut-jpa-aws-lambda-function.json
date: '2021-07-29'
draft: false
summary: 'In this article, we would be looking into some performance statistics when running a Micronaut Application on a JVM runtime versus a Native image on AWS Lambda function'
imageUrl: /static/images/2021/micronaut-jpa-aws-lambda-function/cover.jpg
actualUrl: 'auto-generated'
customUrl: 'auto-generated'
---

In this article, I would be talking about the performance statistics when running a Micronaut Application on a JVM runtime versus running it as a Native image on the Lambda.

### Introduction

Micronaut became quite popular for their quick startup time because of the Ahead Of Time(AOT) compilation. It provides literally all the capabilities that SpringBoot provides like Aspect-Oriented programming, Dependency injection, etc.

Now I have described how to create a Micronaut Application in my previous article “[A SpringBoot Developer’s Guide to Micronaut](https://refactorfirst.com/springboot-developers-guide-to-micronaut)”. I have also described how you can boost your application performance in another article “[Boot Java Application Performance with Micronaut Native Image](https://refactorfirst.com/boost-java-application-performance-with-micronaut)”.

Today we would be looking at how we can create an AWS Lamda function with Micronaut and see its performance statistics when we deploy it on JVM runtime and as a Native Image on Amazon Linux custom runtime image.

So let’s get started.

<AdsFlows id="adflow1" slot="8168941152" />

### Micronaut Function On AWS Lambda

In this, we would be creating a Micronaut function that takes an Order, persists on AWS RDS, and then returns the created ID.

You can generate an application from [Micronaut’s launch](https://micronaut.io/launch). Here you select the application type as “Function Application For Serverless” and in the features, add “Hibernate-JPA” and “AWS-Lambda”.

Once you open the generated project, We will create our function handler by extending Micronaut’s Request handler `MicronautRequestHandler` and override the `execute` method.

```java
@Introspected
public class OrderRequestHandler extends MicronautRequestHandler<Order, Order> {

    @Inject
    private OrderRepository orderRepository;

    @Override
    public Order execute(Order input) {
        Order saved = this.orderRepository.save(input);
        return saved;
    }
}
```

The repository is a simple JPA repository as follows.

```java
@Repository
public interface OrderRepository extends JpaRepository<Order, Long>{ }
```

![Micronaut code](/static/images/2021/micronaut-jpa-aws-lambda-function/code.png)

In the application.yml file, add data source properties to communicate with the AWS RDS instance.

```properties
datasources:
  default:
    url: jdbc:mysql://database.whgnes.eu-central1.rds.amazonaws.com:3306/ORDERS_DB?characterEncoding=UTF-8
    username: admin
    password: nopass
    driverClassName: com.mysql.cj.jdbc.Driver
jpa:
  default:
    properties:
      hibernate:
        hbm2ddl:
          auto: update
        show_sql: true
        dialect: org.hibernate.dialect.MySQL8Dialect
```

<AdsFlows id="adflow2" slot="2393870295" />

With this, we can start creating a jar using `mvn clean package`.

Next, we will create an AWS Lambda function with the runtime as Java 11, upload the jar, and set the handler function to `com.amrut.prabhu.OrderRequestHandler`.

![Micronaut AWS Function](/static/images/2021/micronaut-jpa-aws-lambda-function/micronaut-aws-function.png)

Let’s test this with the following payload.

```json
{
  "body": "{\"name\":\"Order from Lambda\"}"
}
```

Here are the statistics I got with the Lamba configured with 512 MB ram.

![statistics](/static/images/2021/micronaut-jpa-aws-lambda-function/statistics.png)

Now, this was what we got from the Lambda using the JVM runtime. Let’s look at improving this by creating a native image.

### AWS Lambda with Native Image Using GraalVM

To support creating the native image, we would have to do some changes to the code above.

Firstly, you will need to add a dependency to support creating the native image for the AWS lambda function

```xml
 <dependency>
   <groupId>io.micronaut.aws</groupId>
   <artifactId>micronaut-function-aws-custom-runtime</artifactId>
   <scope>compile</scope>
 </dependency>
```

Next, You will need to create a custom initializer by extending `AbstractMicronautLambdaRuntime` .

```java
public class OrderLambdaRuntime extends AbstractMicronautLambdaRuntime<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent, Order, Order> {

public static void main(String[] args) {
        try {
            new OrderLambdaRuntime().run(args);
        } catch (MalformedURLException e) {
            e.printStackTrace();
        }
    }

    @Override
    @Nullable
    protected RequestHandler<Order, Order> createRequestHandler(String... args) {
        return new OrderRequestHandler();
    }
}
```

<AdsFlows id="adflow3" slot="1404222257" />

In addition to this, You will need to set the main class in the properties section of your pom.

```xml
<exec.mainClass>com.amrut.prabhu.OrderLambdaRuntime</exec.mainClass>
```

With this, you are done with your code changes.

Next, To create the naive image, You need to set your default JDK to [GraalVM](https://www.graalvm.org/) JDK. I have used GraalVM CE 21.1.0 (build 11.0.11). You can easily install this using [SDKMan](https://sdkman.io/).

Now let’s build the native image using the following command. Make sure you also have docker installed, as it makes use of the docker to download the AWS runtime image to build the native image.

```bash
./mvnw clean package -Dpackaging=docker-native -Dmicronaut.runtime=lambda
```

Creating the native image might take some time, Maybe around 3–5mins depending on the system. The output is a zip file that contains the required bootstrap files to start the application.

Once created, Let’s upload the zip and set the runtime to the custom runtime option “Provide your own bootstrap on Amazon Linux 2”. In the case of the handler function, It doesn’t matter if you do not set it, as the Lambda would use your native image bootstrap file to start the application.

![Micronaut AWS function native image](/static/images/2021/micronaut-jpa-aws-lambda-function/micronaut-aws-function-native.png)

Now, On invoking the function with the same payload as above, we get a huge change in the performance.

<AdsFlows id="adflow4" slot="2523816518" />

The init duration is now reduced to **761 ms**. The execution time during the cold start remains the same i.e 1215 ms. But for subsequent calls, The response time is less than half of the previous results ie. **14 ms**.

Here are the statistics to compare between using a JVM runtime and the native image.

![Micronaut AWS function Native Image statistics](/static/images/2021/micronaut-jpa-aws-lambda-function/micronaut-aws-function-native-image-statistics.png)

So as you can see, we can achieve really high performance by building and using a native image.

You can have a look at the code on my [GitHub repo](https://github.com/amrutprabhu/micronaut-workout/tree/master/micronaut-lambda-function).

### Next..

Now, In this article, we used a single function to add an object to the RDS database. But what about cases wherein you would want to add as well as retrieve an object. For this, We will be looking into deploying a Micronaut application on AWS Lambda providing PUT and GET capabilities and see its performance. You can read this in my next article "[Micronaut JPA Application Performance on AWS Lambda](https://refactorfirst.com/micronaut-aws-lambda-application-for-api-gateway)"

You can subscribe to my newsletter to get an email when I publish my articles
