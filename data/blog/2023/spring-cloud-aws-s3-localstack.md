---
title: 'Spring Cloud AWS 3.0 S3 with Spring Boot and Localstack'
author: 'Amrut Prabhu'
categories: ''
tags: [Spring Boot, AWS, AWS S3, Spring Cloud, Spring Clous AWS]
photo-credits:
applaud-link: 2021/spring-boot-stream-kafka.json
date: '2023-05-25'
draft: false
summary: 'In this article, we will look into how we can use Spring Cloud AWS S3 in a Spring Boot Application to communicate with AWS. We will run our setup with LocalStack to mock the actual AWS S3 service'
imageUrl: /static/images/2023/spring-cloud-aws-s3-localstack/cover.jpg
actualUrl: 'auto-generated'
customUrl: 'auto-generated'
---

## Introduction

Since you are here, I assume you know about the AWS S3 bucket.

But to refresh your memory here are some of the key highlights.

- AWS S3 is a highly scalable and secure object storage service provided by AWS.
- It allows you to store and retrieve data of any type and size of files from anywhere in the world using AWS CLI or web interfaces.
- S3 provides various storage classes depending on your need, security features, and integration options with other AWS services.
- It is a popular choice for cloud-based storage and has a wide range of use cases, from simple backup, and archiving complex data analytics, to even having static websites and machine learning applications.

With this quick introduction, let’s see how we can communicate with an AWS S3 bucket using Spring Cloud AWS S3 3.0.

## Creating S3 Bucket in LocalStack with Docker Compose.

We will be using LocalStack to simulate working with the real AWS services.

Now to create a bucket we will add an executable script.

```bash
#!/bin/bash
awslocal s3api create-bucket \
--bucket mybucket \
--create-bucket-configuration LocationConstraint=eu-central-1
```

We will mount it to the LocalStack container using Docker Compose.

```yaml
version: '3.8'

services:
  localstack:
    image: localstack/localstack
    ports:
      - '4566:4566' # LocalStack endpoint

    environment:
      - DOCKER_HOST=unix:///var/run/docker.sock
    volumes:
      - ./localstack-script:/etc/localstack/init/ready.d
      - '/var/run/docker.sock:/var/run/docker.sock'
```

Make sure that the mounted script file has executable permissions.

With this, when we start LocalStack using `docker compose up` an S3 bucket is created.

```bash
spring-boot-with-s3-localstack-1  |
spring-boot-with-s3-localstack-1  | 2023-05-13T13:28:26.377  INFO --- [-functhread5] hypercorn.error            : Running on https://0.0.0.0:4566 (CTRL + C to quit)
spring-boot-with-s3-localstack-1  | 2023-05-13T13:28:26.377  INFO --- [-functhread5] hypercorn.error            : Running on https://0.0.0.0:4566 (CTRL + C to quit)
spring-boot-with-s3-localstack-1  | Ready.
spring-boot-with-s3-localstack-1  | 2023-05-13T13:28:28.106  INFO --- [   asgi_gw_0] localstack.request.aws     : AWS s3.CreateBucket => 200
spring-boot-with-s3-localstack-1  | {
spring-boot-with-s3-localstack-1  |     "Location": "http://mybucket.s3.localhost.localstack.cloud:4566/"
spring-boot-with-s3-localstack-1  | }
```

Notice the URL that is displayed. We will talk about it below.

Now, since our S3 bucket is created, we will now use Spring Cloud AWS S3 to put a file in our S3 bucket.

## Creating an Application With Spring Cloud AWS S3

Go to [https://start.spring.io](https://start.spring.io) and create an application with the following dependencies.

- Spring Boot Starter Web. ( Only to create REST endpoints)

Next, we will add the Spring Cloud AWS dependency management.

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>io.awspring.cloud</groupId>
            <artifactId>spring-cloud-aws-dependencies</artifactId>
            <version>3.0.1</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

Dependency management will help us to get the right dependency version and we will require the following dependency.

```xml
<dependencies>
        <dependency>
            <groupId>io.awspring.cloud</groupId>
            <artifactId>spring-cloud-aws-starter-s3</artifactId>
        </dependency>
</dependencies>
```

## Communicating with AWS S3 Bucket

There are two ways to communicate with the S3 bucket.

- Path style URLs.
- Virtual Hosted style URLs.

The path style URLs were the older mechanism which used the format `https://s3.region-code.amazonaws.com/bucket-name`_._

While the virtual hosted URL uses the format `https://bucket-name.s3.region-code.amazonaws.com`

The path style URLs will soon be deprecated and LocalStack already supports the virtual hosted style URLs by default. This is what we saw in the logs above.

So let’s look at the properties we need to set to communicate with the S3 bucket.

```yaml
spring:
  cloud:
    aws:
      s3:
        endpoint: http://s3.localhost.localstack.cloud:4566
        region: eu-central-1
      credentials:
        access-key: none
        secret-key: none
      region:
        static: eu-central-1
```

Since we will be using Localstack, we have added the Localstack URL.

If you look closely, we have specified the URL without the bucket because we will be specifying our bucket in the spring resource.

```java
 @Value("s3://mybucket/samplefile.txt")
    private Resource s3SampleFile;
```

Here we have specified the S3 bucket and we will use this resource to create and put a file with the name`samplefile.txt`in the S3 bucket.

Let’s create a web controller that will allow us to put the file using a REST endpoint.

```java
@RestController
public class WebController {

    @Value("s3://mybucket/samplefile.txt")
    private Resource s3SampleFile;

    @GetMapping("/data")
    public ResponseEntity<String> getData() {

        try {
            return ResponseEntity.ok(s3SampleFile.getContentAsString(StandardCharsets.UTF_8));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Could not fetch content");
        }
    }

    @PostMapping("/data")
    public ResponseEntity<String> putData(@RequestBody String data) throws IOException {

        try (OutputStream outputStream = ((S3Resource) s3SampleFile).getOutputStream()) {
            outputStream.write(data.getBytes(StandardCharsets.UTF_8));
        }
        return ResponseEntity.ok(data);
    }
```

Now, let's start the application and make a CURL request

```bash
curl -i -X POST \
--location 'http://localhost:8080/data' \
--header 'Content-Type: application/json' \
--data '{
    "name" : "amrut"
}'

Response =>
HTTP/1.1 200
Content-Type: text/plain;charset=UTF-8
Content-Length: 24
Date: Sat, 13 May 2023 14:30:25 GMT

{
    "name" : "amrut"
}
```

With this, we were able to store the file on the S3 bucket with the JSON that we just sent.

We can now also retrieve the same content using the GET request.

```bash
curl -i --location 'http://localhost:8080/data'

Response =>
HTTP/1.1 200
Content-Type: text/plain;charset=UTF-8
Content-Length: 24
Date: Sat, 13 May 2023 14:31:35 GMT

{
    "name" : "amrut"
}
```

With this, we just explored how to put and fetch content from an S3 bucket.

You can still use the S3Client bean to access the S3 bucket in the traditional way.

## Integration test with LocalStack

For any code that we write, we need to write tests that make sure it all works fine.

So let’s look at the integration test.

```java
@Testcontainers
@SpringBootTest
@AutoConfigureMockMvc
class SpringBootWithS3ApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Value("s3://mybucket/samplefile.txt")
    private Resource s3SampleFile;

    @Container
    private static LocalStackContainer localStackContainer = new LocalStackContainer(DockerImageName.parse("localstack/localstack"))
            // to create secrets on startup
            .withCopyFileToContainer(MountableFile.forClasspathResource("script.sh", 0775),
                    "/etc/localstack/init/ready.d/")
            .withServices(LocalStackContainer.Service.S3);

    @BeforeAll
    static void beforeAll() throws IOException, InterruptedException {
        System.setProperty("spring.cloud.aws.s3.endpoint", "http://s3.localhost.localstack.cloud:" + localStackContainer.getMappedPort(4566));
        System.setProperty("spring.cloud.aws.s3.region", "eu-central-1");
        System.setProperty("spring.cloud.aws.credentials.access-key", "none");
        System.setProperty("spring.cloud.aws.credentials.secret-key", "none");
    }

    @Test
    void putAndFetchFileFromS3() throws Exception {

        String data = """
                        {
                        "name" : "amrut"
                        }
                        """;


        Assertions.assertThat(s3SampleFile.exists()).isFalse();

        mockMvc.perform(MockMvcRequestBuilders.post("/data")
                .content(data))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.name", Matchers.is("amrut")));

        mockMvc.perform(MockMvcRequestBuilders.get("/data"))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.name", Matchers.is("amrut")));

    }
```

Here we first start the LocalStack container using Testcontainers and then we set the properties of the container as the system properties.

Then in our test, we first verify that the file does not exist and then make a series of REST calls, to add and fetch data.

You can find the entire code on my GitHub repo [here](https://github.com/amrutprabhu/spring-boot-with-aws-s3).

**Next...**

If you’re looking for more articles to expand your knowledge in software development, here are three additional recommendations:

- [Spring Boot On AWS Lambda with Snap Start](https://refactorfirst.com/kick-start-spring-boot-application-with-aws-lambda-snap-start)
- [Using DynamoDB with Spring Boot](https://refactorfirst.com/using-dynamodb-with-spring-boot)
- [Remote Debug A Java Application In a Kubernetes Pod](https://refactorfirst.com/how-to-remote-debug-java-application-on-kubernetes)

I keep exploring and learning new things. If you want to know the latest trends and improve your software development skills, then subscribe to my newsletter below and also follow me on [Twitter](https://twitter.com/amrutprabhu42).

Enjoy!!
