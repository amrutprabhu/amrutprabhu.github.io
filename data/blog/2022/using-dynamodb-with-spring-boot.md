---
title: 'Using DynamoDB with Spring Boot'
author: 'Amrut Prabhu'
categories: ''
tags: [Spring Boot, Java, AWS, DynamoDB, NoSQL]
photo-credits:
applaud-link: 2021/spring-boot-stream-kafka.json
date: '2022-09-01'
draft: false
summary: ' In this article, we will look into how can communicate with AWS DynamoDB using a Spring Boot application and also understand some of the key concepts of DynamoDB.'
imageUrl: /static/images/2022/spring-boot-dynamodb/cover.jpg
actualUrl: 'auto-generated'
customUrl: 'auto-generated'
---

# Introduction

DynamoDB is a key-value database that organizes data in tables. Each table contains a collection of items that are identified by a primary key. Each Item is a collection of attributes.

![dynamodb Table diagram](/static/images/2022/spring-boot-dynamodb/dynamodb-table-diagram.png)

## DynamoDB Table Items

Items in the table can either contain scaler attributes which means it contains only one value like strings, numbers, or binary or they could have nested attributes.

Nested attributes are like a map of key-value pairs and DynamoDb supports up to 32 levels of nested attributes.

Now, DynamoDB organizes data on the physical storage as partitions and the data on a partition is identified by a partition key. Let’s look at this.

## Understanding DynamoDB Primary Keys

Now to understand the different types of primary keys, let's look at two types of keys that can exist.

- **Partition key** — This key is used to identify the partition on which the data is stored.
- **Sort key** — This key identifies the location of the item in the partition.

The attribute that makes up the partition or sort key needs to be scalar attributes i.e they are single value attributes of either string, number, or binary.

Now, with these two types of keys, we can create a primary key in two ways.

- **Simple Primary Key** — This only contains one attribute to define the primary key. This attribute itself becomes the partition key. When querying data, the primary key value is passed to a hash function to determine the partition on which the item is stored.  
  Since this is a single value, we can only have one item with the same partition key value in the table.
- **Composite Primary key** — This is a combination of two attributes, one defining the partition key and the other one as the sort key. The partition key is used to find the partition and then the sort key is used to find the item in the partition. This means all the items with the same partition key will be stored in the same partition.  
  This provides you with the flexibility that, you can query all the items that are related with the same partition key.

**Note:** The Primary key attributes can contain only a single value attribute of the type string, number, or binary.

## Types of DynamoDB Tables Indexes

The Primary key itself becomes one of the indexes on which you can query data.

But there will be cases in which you would want additional indexes and these are called secondary indexes. For this, DynamoDB provides two types of indexes

- **Global Secondary Index** — This index would have a partition key and sort key different from that of the table’s primary key
- **Local Secondary Index** — This index will be with the same partition key as the primary key and a different sort key attribute.

## Features provided by DynamoDB

Apart from things like high availability and scalability, DynamoDB provides some interesting features.

- **Expiring Items**: DynamoDB provides the ability to delete items after a particular time to live value (TTL). It automatically deletes an item when its TTL is expired at no cost to you.
- **DynamoDB Streams**: DynamoDB provides a stream of an ordered flow of item changes in a table. Whenever you create, update or delete items, DynamoDb sends a stream of records containing changes from “before” and “after” the change.

We looked into some of the key concepts of DynamoDB to get you started. Now let's look at how we can communicate with DynamoDB using a Spring Boot application.

# Spring Boot DynamoDB Communication

Let’s go to [https://start.spring.io](https://start.spring.io) and create an application with only one dependency

- **Spring Web** ( we only need this to create some REST endpoints )

Also, we will use Java 11 and not Java 17.

This is because the Spring Data DynamoDB dependency makes use of AWS SDK version 1 and this version does not support Java 17 and onwards.

To use Java 17, we would use Spring Cloud DynamoDB once it's released. I would be writing an article about it soon, so you can subscribe to my newsletter on [https://refactorfirst.com](https://refactorfirst.com) to know when it is out.

Next, we add the following Spring Data DynamoDB dependency which supports Spring Boot versions greater than 2.2.

```xml
<dependency>
   <groupId>io.github.boostchicken</groupId>
   <artifactId>spring-data-dynamodb</artifactId>
   <version>5.2.5</version>
</dependency>
```

You can refer to the library’s GitHub repo [here](https://github.com/boostchicken/spring-data-dynamodb).

## Defining a DyanamoDB Table

Let’s look at the following information that we wish to store.

```json
{
  "id": "ac517a2f-47fd-4af9-b16a-56bccddb9a7d",
  "creationDate": "2022-08-20"
  "name": "Jerry",
  "address": {
           "country": "Belgium"
       },
}
```

Consider we want to store a record like the one shown above wherein we want the `id` field to be the partition key (also called the hash key) and the `creationDate` to be the sort key. Then we have a simple string attribute `name` and a nested attribute `address` .

With this kind of record, we should be able to cover most of the scenarios.

Let’s look at what the data model looks like for this.

```java
public class PrimaryKey {

    @DynamoDBHashKey
    private String id;

    @DynamoDBRangeKey
    private LocalDate creationDate;

    public String getId() {
        return id;
    }

    public LocalDate getCreationDate() {
        return creationDate;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setCreationDate(LocalDate creationDate) {
        this.creationDate = creationDate;
    }
}
```

Since we will be creating a composite primary key, we need to create this primary key class, containing the two fields that we intend to use for the composite key.

Next, We define a `Person` class.

```java
@DynamoDBTable(tableName = "Person")
public class Person {

    @Id
    private PrimaryKey key;

    @DynamoDBAttribute(attributeName = "name")
    private String name;

    @DynamoDBAttribute(attributeName = "address")
    private Address address;


    @DynamoDBHashKey(attributeName = "id")
    @DynamoDBAutoGeneratedKey
    public String getId() {
        return key.getId();
    }

    @DynamoDBRangeKey(attributeName = "creationDate")
    @DynamoDBTypeConverted(converter = LocalDateConverter.class)
    public LocalDate getCreationDate() {
        return key.getCreationDate();
    }

    public void setCreationDate(LocalDate creationDate) {
        if(key== null){
            key = new PrimaryKey();
        }
        key.setCreationDate(creationDate);
    }

    public void setId(String id) {
        if(key== null){
            key = new PrimaryKey();
        }
        key.setId(id);
    }
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Address getAddress() {
        return address;
    }

    public void setAddress(Address address) {
        this.address = address;
    }
}
```

Here, we use the `PrimaryKey` class as the ID and annotate the getter methods of the individual key components with `DynamoDBHashKey` and `DynamoDBRangeKey` .

> Now, why are we defining this again since we defined it already in the `PrimaryKey` class?

This is because, when we persist the `Person` class in DynamoDB, we need to transform the object to an item that DynamoDB understands. So we tell the `DynamoDBMapper` which is the partition key and which is the sort key.

> So why did we have the `PrimaryKey` class? Couldn't we just use the two keys as attributes in the `Person` class?

This is because we cannot define two identity values in the JPA repository interface for the composite primary key while defining the repository for the `Person` class.

Hence the `PrimaryKey` class also needs to specify `@DynamoDBHashKey` and `@DynamoDBRangeKey` annotations, so that Spring Data JPA can understand which are the two composing keys that form the single primary key of the table.

```java
@EnableScan
public interface PersonRepository extends CrudRepository<Person, PrimaryKey> {

    List<Person> findById(String id);
}
```

We also define here a `findById` method, so that we can query DynamoDB only with the partition key.

Now, since we are using `LocalDate` as our sort key, the `DynamoDBMapper` doesn't understand how to deal with the date. For this, we need to provide a `DynamoDBTypeConverter` that will help in the conversion.

```java
public class LocalDateConverter implements DynamoDBTypeConverter<String, LocalDate> {

    @Override
    public String convert(LocalDate date) {
        return date.toString();
    }

    @Override
    public LocalDate unconvert(final String stringValue) {
        return LocalDate.parse(stringValue);
    }
}
```

We then specify this converter using the `@DynamoDBTypeConverted` annotation on top of the getter method of the sort key in the `Person` class.

Lastly, let's look at defining the nested attribute `address` .

```java
@DynamoDBDocument
public class Address {

    @DynamoDBAttribute
    private String country;

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }
}
```

Here, this class is annotated with `@DynamoDBDocument` so that it can be stored as a nested value with its own set of attributes.

With this, we defined our data model covering the concepts of the composite primary key, single value attributes, nested attributes, and type conversion.

Let’s look at creating the DynamoDB table.

## Creating a DynamoDB Table

To create the table, we need to send the create table request containing the attribute definition.

For this, you can either create the table on the application startup like this

```java
CreateTableRequest createTableRequest = dynamoDBMapper.generateCreateTableRequest(Person.class)
                                                      .withProvisionedThroughput(new ProvisionedThroughput(1l, 1l));
TableUtils.createTableIfNotExists(amazonDynamoDB, createTableRequest);
```

or you can add properties that will handle the table creation as below

```yaml
spring:
  data:
    dynamodb:
      entity2ddl:
        auto: create-only
```

This will automatically create the table for you. There are more options available [here](https://github.com/derjust/spring-data-dynamodb/wiki/Autocreate-Tables).

Next, let’s create a DynmoDB instance to work with.

## Starting Local DynamoDB Instance

We will connect to a local DynamoDB instance that we can run on our own machine rather than connecting to the real one on AWS.

This is provided by AWS itself, so it is pretty similar to connecting with the real one.

```yaml
version: '3.8'
services:
  dynamodb-local:
    command: "-jar DynamoDBLocal.jar -sharedDb -dbPath ./data"
    image: "amazon/dynamodb-local:latest"
    container_name: dynamodb-local
    ports:
      - "8000:8000"
   volumes:
     - "./dynamodb-data:/home/dynamodblocal/data"
   working_dir: /home/dynamodblocal
```

We will use the docker version to run the local DynamoDB, but there are also other ways that you can find [here](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) to start a local instance.

We can now start this instance by running `docker compose up` command.

With this, we have a local DynamoDB instance running. Let’s now look at configuring the connection in our Spring Boot application.

## Spring Boot DynamoDB Client Configuration

To communicate with DynamoDB, we will create a DynamoDB client bean using the AWS credentials provider.

```java
@Bean
public AmazonDynamoDB amazonDynamoDB(AWSCredentials AWSCredentials,
                                     @Value("${aws.dynamoDBUrl}") String dynamoDBURl) {

   AmazonDynamoDBClientBuilder builder = AmazonDynamoDBClientBuilder.standard()
                                            .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(dynamoDBURl, "eu-central-1"))
                                            .withCredentials(new AWSStaticCredentialsProvider(AWSCredentials));
    AmazonDynamoDB client = builder.build();

   return client;
}

@Bean
public AWSCredentials awsCredentials(@Value("${aws.accessKey}")
                                     String accesskey,
                                     @Value("${aws.secretKey}")
                                    String secretkey) {
    return new BasicAWSCredentials(accesskey, secretkey);
}
```

With this, we have defined everything that we need to communicate with DynamoDB.

Let’s now create some endpoints to allow us to store and query data.

## Creating REST endpoints to Query DynamoDB Data.

```java
@RestController
public class WebController {

    @Autowired
    PersonRepository personRepository;

    @GetMapping("/person/{id}")
    public ResponseEntity getPerson(@PathVariable("id") String id,
                                    @RequestParam(value = "creationDate", required = false)
                                    @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate creationDate) {

        if (creationDate == null) {
            List<Person> people = personRepository.findById(id);
            return ResponseEntity.ok(people);
        }

        return getByPrimaryKey(id, creationDate);
    }

    @PostMapping("/person")
    public ResponseEntity addPerson(@RequestBody Person person) {
        return ResponseEntity.ok(personRepository.save(person));
    }

    private ResponseEntity<?> getByPrimaryKey(String id, LocalDate creationDate) {
        PrimaryKey primaryKey = new PrimaryKey();
        primaryKey.setId(id);
        primaryKey.setCreationDate(creationDate);

        Optional<Person> mayBePerson = personRepository.findById(primaryKey);

        if (mayBePerson.isPresent()) {
            return ResponseEntity.ok(mayBePerson.get());
        }
        return ResponseEntity.notFound()
                .build();
    }
}
```

Here, we create two endpoints. One to store data and the other one to retrieve the data.

Now, we can retrieve data either by providing the composite key (i.e. the partition key and the sort key together) or we can get all the items by using only the partition key itself.

With this, let's start the application and insert our first record.

![dynamodb item insert](/static/images/2022/spring-boot-dynamodb/dynamodb-insert.png)

We can then query the records using the composite key ( partition key and sort key) as below

![dynamodb primary key query](/static/images/2022/spring-boot-dynamodb/dynamodb-primary-key-query.png)

We can also query the data using only the partition key as shown below.

![dynamodb partition key query](/static/images/2022/spring-boot-dynamodb/dynamodb-partition-key-query.png)

# Final Notes

We currently communicated with DynamoDB Using a Spring Boot application via the Spring Data DynamoDB library. But there are a few things to keep in mind before using it.

- Currently, this library has been forked 3 times and only the third one currently supports the latest version of Spring boot.
- This library uses AWS SDK version 1, which means we can use it only up to Java 16.

You can find the entire code on my GitHub repo [here](https://github.com/amrutprabhu/spring-boot-with-dynamoDB).

I keep exploring and learning new things. If you want to know the latest trends and improve your software development skills, then subscribe to my newsletter below and also follow me on [Twitter](https://twitter.com/amrutprabhu42).

Enjoy!!
