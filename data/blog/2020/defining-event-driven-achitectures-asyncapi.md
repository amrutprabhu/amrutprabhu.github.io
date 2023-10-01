---
title: 'Defining Event-Driven Architectures - AsyncAPI'
author: 'Amrut Prabhu'
categories: ''
tags: [Spring Boot, Java]
image: asyncapi/cover.jpg
photo-credits: https://unsplash.com/photos/w_vO_U6BUJc
applaud-link: asyncapi-event-driven-architecture.json
date: '2021-06-15'
draft: false
summary: 'In this article, I am going to be talking about how we can define your event-driven architectures using the AsyncAPI definition'
imageUrl: /static/images/2021/asyncapi/cover.jpg
actualUrl: 'auto-generated'
customUrl: 'auto-generated'
---

In this article, I am going to be talking about how we can define your event-driven architectures using the AsyncAPI definition.

## Introduction

A while ago, I published an [article](https://refactorfirst.com/spring-boot-api-first-design) about how you can document REST APIs using Open API 3 specifications. This was for synchronous APIs.

Today we are going to look at how we can describe asynchronous APIs that we create when we design event-driven architectures.

## AsyncAPI definition

Let’s look at the various parts of an AsyncAPI specification that are most useful.

![AsyncAPI definition sections](/static/images/2021/asyncapi/api-defition-sections.png) // TODO FIX this

- <b>API version</b> — This defines the version of AsycnAPI. We will be dealing with version 2.0.0
- <b>Info</b> — In this section, we define some metadata about the API.
- <b>Servers</b> — In this section, we define servers or brokers with which we want to connect.
- <b>Channels</b> — This section contains the messaging channel information. Here we define the type of messages sent on the topic/queue.
- <b>Components</b> — This section defines the message definitions and we then refer to them inside the channel.

There are also tags and an external docs section, But right now it's not that important for a new start. You can always refer to the documentation about these sections in more detail [here](https://www.asyncapi.com/docs/specifications/v2.0.0#schema).

If you are already familiar with the OpenAPI definition, then these sections are more or less the same. Here is a nice page to understand the similarity between [OpenAPI and AsyncAPI](https://www.asyncapi.com/docs/getting-started/coming-from-openapi).

Now that we have looked at the various sections. Let’s look at a minimal definition.

<AdsFlows id="adflow1" slot="8168941152" />

## Example Async API Definition

```
asyncapi: 2.0.0
info:
  title: Banking backend events
  version: 1.0.0
servers:
  development:
    url: localhost:{port}
    protocol: kafka
    variables:
      port:
        default: '9092'
channels:
  banking.transaction.000:
    description: |-
      This contains events related to transactions.
    publish:
      operationId: consumeTransactionEvent
      message:
        $ref: '#/components/messages/transactionEvent'
      bindings:
        kafka:
          groupId: myGroupId
components:
  messages:
    transactionEvent:
      name: trasactionEvent
      contentType: 'application/json'
      payload:
        $ref: '#/components/schemas/TransactionEventPayload'
  schemas:
    TransactionEventPayload:
      type: object
      properties:
        transactionId:
          description: Transaction Id
          type: string
        amount:
          type: integer
```

Now, In this, I am creating an API definition to connect to Kafka, wherein a producer is publishing a transaction event to a Kafka topic named `banking.transaction.000`

## How to Read the AsyncAPI Definition

Usually, when we dealt with OpenAPI 3 specifications for synchronous communication, We always knew who was the server and the client. The server implements the OpenAPI definition and the client uses the definition to know how to interact with the server.

Now, there is a difference in the case of asynchronous communication. We don't have a nation of servers and clients. An application can consume an event and also emit an event.

So let's look a little deeper at the channel section from the above definition to understand this better.

```
channels:
  banking.transaction.000:
    description: |-
      This contains events related to transactions.
    publish:
      operationId: consumeTransactionEvent
      message:
        $ref: '#/components/messages/transactionEvent'
      bindings:
        kafka:
          groupId: myGroupId
```

In the channel section, we have `publish` section, which contains an operation Id, message, and binding.

Now, When we read the definition, we have to read it from the perspective of a viewer, who is looking at the API definition that is already implemented by a provider application. This means, If you want to interact with the provider’s application (who has implemented the API definition), then you have to consume events from the `banking.transaction.000` topic.

This was a little confusing when I was generating the code.

So with this understanding, Let’s generate some code.

<AdsFlows id="adflow2" slot="2393870295" />

## Code generation

AsyncAPI provides templates to create code from the API definition. There are quite a few code generation templates for languages like Java, Nodejs, and Python. You can also generate an HTML page for the API definition using the HTML template. You can find the list of templates [here](https://github.com/asyncapi/generator#list-of-official-generator-templates)

We will be generating our code in Java using the Spring framework.

To generate the code from the template, we would have to use an async generator command, which we can install by command line or use a docker image to run the command. You can find more details about the installation [here](https://www.asyncapi.com/generator).

To install the command line utility, run the following command:

```
npm install -g @asyncapi/generator
```

Now, We would be using the `@asyncapi/java-spring-template` to generate our API providers and viewer’s code. This template makes use of the `spring-kafka` library to generate your consumers and publishers to the topic. You can find various options that are provided for this template [here](https://github.com/asyncapi/java-spring-template)

## Generating API Consumer’s/Viewer’s code

To generate the API consumer’s code, we would have to run the following command

```
ag asyncapi.yml \
@asyncapi/java-spring-template \
-p javaPackage=com.amrut.prabhu.consumer \
-p inverseOperations=false \
--force-write  \
-o async-kafka-consumer
```

You can alternatively run the command using docker in the following way:

```
docker run --rm -it -v ${PWD}:/app asyncapi/generator \
asyncapi.yml \
@asyncapi/java-spring-template \
-p javaPackage=com.amrut.prabhu.consumer \
--force-write  \
-o async-kafka-consumer
```

**Note:** if you use the docker way of creating the code, It might take some time to generate, because it downloads the template every time you run the command.

![Async API Consumer/viewer code](/static/images/2021/asyncapi/api-consumer.png)

Now with this, we have created a project with code to consume the events from the `banking.transaction.000` topic. The class that handles the part of consuming events is `MessageHandlerService` . It makes use of the `@kafkaListener` annotation, to define a handler for the incoming messages.

Now let's look at generating the API provider's code for us.

## Generating API Provider’s Code.

To generate the API definition provider’s code which in our case is the producer to the`banking.transaction.000` topic, we would have to run the following command

```
ag asyncapi.yml \
@asyncapi/java-spring-template \
-p javaPackage=com.amrut.prabhu.producer \
-p inverseOperations=true \
--force-write  \
-o async-kafka-producer
```

Now, here the command is pretty much the same, but a small difference. In this case, we have to set the `inverseOperation` property to true. This tells the generator to generate the code as the provider of the API definition.

![AsyncAPI provider's code](/static/images/2021/asyncapi/api-provider.png)

In this case, We have the `CommandLinePublisher` that publishes a message to Kafka. It internally makes use of `PublisherService` to publish the message using the `KafkaTemplate`.

## Conclusion

In this article, we had a look at what an AsyncAPI definition looks like and also generate code using a code template. Some things can be a bit tricky to understand but they have wonderful documentation which you can refer to [here](https://www.asyncapi.com/docs/specifications/v2.0.0). I feel the code templates need some improvement but I can understand the templates are still in their early stages.

As to how we have OpenAPI as a standard for documenting REST APIs, AsyncAPIs, I guess would become a standard for documenting asynchronous or event-driven architectures.

<AdsFlows id="adflow3" slot="1404222257" />

As always, I have uploaded the generated code [here](https://github.com/amrutprabhu/async-api-workout).
