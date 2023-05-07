---
title: 'Spring Boot With MongoDB Using Spring Data'
author: 'Amrut Prabhu'
categories: ''
tags: [MongoDB, Spring Boot, Spring Data, Mongo Express, NoSQL]
photo-credits:
applaud-link: 2021/spring-boot-stream-kafka.json
date: '2023-05-04'
draft: false
summary: 'In this article, we will look at how we can start a local MongoDB instance using Docker and then communicate with it using a Spring Boot Application'
imageUrl: /static/images/2023/connect-mongodb-with-spring-boot/cover.jpg
actualUrl: 'auto-generated'
customUrl: 'auto-generated'
---

## Introduction

MongoDB is one of the popular NoSQL databases that is designed to store, manage and query large amounts of data in a flexible and scalable way. It uses a document-oriented data model, which means that data is stored in JSON-like documents with dynamic schemas that can be easily modified without requiring a predefined structure.

MongoDB is ideal for handling unstructured or semi-structured data that does not fit into the rows and columns format of a traditional relational database. Its also known for its high performance and scalability, making it a popular choice for modern web and mobile applications that require fast and efficient data storage and retrieval.

With this, let’s look at how we can communicate with MongoDB using a Spring Boot Application.

## Creating a Spring Boot Application With MongoDB

Let’s go to [https://start.spring.io](https://start.spring.io) and create a new project with the following dependencies.

- Spring Data MongoDB
- Spring Web (Only required for REST endpoints)

Once you unpack the project we will create a new model to store data in MongoDB.

```java
@Document
public class Product {

    @Id
    private String id;
    private String productName;

    private BigDecimal price;
    private Map<String, String> attributes;

// Getters and Setters
```

Here we annotate the product class with the `@document` annotation to indicate data that we would want to save in MongoDB.

MongoDB allows us to store data without any fixed schema. So for this, we will add a map of attributes, so we can arbitrarily store key-value pairs in the database.

Next, let’s define a repository.

We will create a simple repository that will allow us to use JPA to store data in MongoDB.

```java
public interface ProductRepository extends MongoRepository<Product, String> {
}
```

Next, let's create a controller that will help us to make REST calls to store and retrieve data from the MongoDB database.

```Java
 @PostMapping("/products")
    public ResponseEntity create(@RequestBody Product product) {
        product = productRepository.save(product);
        return ResponseEntity.created(URI.create("/product/" + product.getId()))
                .body(product);
    }

    @GetMapping("/products/{id}")
    public ResponseEntity getProduct(@PathVariable("id") String id) {
        Optional<Product> productById = productRepository.findById(id);
        return productById.map(ResponseEntity::ok)
                .orElseThrow(ProductNotFound::new);
    }
```

As we are ready with storing and retrieving data from the database, let's start an instance of MongoDB to test our application.

## Starting MongoDB Docker Instance.

Let's start an instance of MongoDB using docker-compose.

```yaml
version: '3.1'

services:
  mongo:
    image: mongo
    restart: always
    ports:
      - 27017:27017
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: password

  mongo-express:
    image: mongo-express
    restart: always
    depends_on:
      - mongo
    ports:
      - 8081:8081
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: root
      ME_CONFIG_MONGODB_ADMINPASSWORD: password
      ME_CONFIG_MONGODB_SERVER: mongo
```

We will also be spinning up Mongo Express to provide us with a UI to communicate with MongoDB directly.

Once we start the docker image, we can access the Mongo Express UI at the location [http://localhost:8081.](http://localhost:8081.)

![](/static/images/2023/connect-mongodb-with-spring-boot/mongo-express.png)

Next, let’s configure our application to communicate with MongoDB via the properties file.

```yaml
spring:
  data:
    mongodb:
      host: 'localhost'
      port: 27017
      database: 'product-DB'
      username: 'root'
      password: 'example'
      authentication-database: 'admin'
logging:
  level:
    org:
      springframework:
        data:
          mongodb:
            core:
              MongoTemplate: 'DEBUG'
```

You don't need the logging properties, but this will help you to see what queries are made by the application to MongoDB.

Let’s make some REST requests to the application to store and retrieve data.

```shell
curl --location --request POST 'http://localhost:8080/product' \
--header 'Content-Type: application/json' \
--data-raw '{
    "productName" : "Macbook Pro",
    "price" : "1234.456",
    "attributes" :{
        "CPU" : "M1",
        "Model" : "X51",
        "Hard Disk": "512GB"
    }

}'
```

Let’s look at the stored document using Mongo Express.

![Mongodb Document](/static/images/2023/connect-mongodb-with-spring-boot/mongodb-document.png)

Now, let’s try retrieving this document.

```bash
curl --location 'http://localhost:8080/product/64316b3b4525f4467dc61531'
```

![rest response](/static/images/2023/connect-mongodb-with-spring-boot/rest-response.png)

With this, we were just able to store and retrieve documents from a MongoDB instance using a Spring Boot Application.

You can find the entire project on my GitHub repo [here](https://github.com/amrutprabhu/spring-boot-3-with-mongodb)

**Next...**

If you’re interested in learning more about software development, here are three articles that I would recommend:

- [How to Fetch Database Secrets From AWS Secrets Manager](https://refactorfirst.com/spring-boot-fetch-secrets-from-aws-secrets-manager)
- [Using DynamoDB with Spring Boot](https://refactorfirst.com/using-dynamodb-with-spring-boot)
- [Monitoring Spring Boot Application with Prometheus and Grafana](https://refactorfirst.com/spring-boot-prometheus-grafana)

I keep exploring and learning new things. If you want to know the latest trends and improve your software development skills, then subscribe to my newsletter below and also follow me on [Twitter](https://twitter.com/amrutprabhu42).

Enjoy!!
