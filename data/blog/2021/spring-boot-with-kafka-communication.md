---
title: 'Spring Boot With Kafka Communication'
author: 'Amrut Prabhu'
categories: ''
tags: [Spring Boot, Java, Kafka, producer, consumer, scheduled]
image: 2021/spring-boot-kafka-communication/cover.jpg
photo-credits:
applaud-link: 2021/spring-boot-kafka-communication.json
date: '2021-12-09'
draft: false
summary: 'In this, we will be looking into how we can publish and subscribe to a Kafka topic using Spring Kafka'
imageUrl: /static/images/2021/spring-boot-kafka-communication/cover.jpg
actualUrl: 'auto-generated'
customUrl: 'auto-generated'
---

In this article, we will be looking into how we can publish and subscribe to a Kafka topic.

## Introduction

Kafka over the years has gained a lot in popularity for its high throughput and real-time asynchronous messaging. It's considered a de facto standard for streaming events and provides fault-tolerant storage that is stable, reliable, and scalable.

So today we will be looking into how we can communicate with Kafka from a Spring Boot application to send and receive messages or events.

## Creating a Producer

Let’s go to [https://start.spring.io](https://start.spring.io) and create an application adding the `spring-kafka` dependency as below.

```xml
<dependency>
   <groupId>org.springframework.kafka</groupId>
   <artifactId>spring-kafka</artifactId>
</dependency>
```

Now let’s create a producer that will send messages to a Kafka topic.

```java
@Component
public class KafkaProducer {

    @Value("${topic.name}")
    private String topicName;

    private KafkaTemplate kafkaTemplate;

    public KafkaProducer(KafkaTemplate kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @Scheduled(cron = "*/2 * * * * *")
    public void sendMessage() {
        UUID key = UUID._randomUUID_();
        Message payload = new Message("jack");
        System._out_.println("Sending Data " + payload);

        ProducerRecord<String, Message> record = new ProducerRecord<String, Message>(topicName,
                key.toString(),
                payload);

        kafkaTemplate.send(record);
    }
}
```

Here I have created a producer which is scheduled to send a message every 2 secs. To send the message, we are making use of the KafkaTemplate.

To send the message to the right Kafka broker, we need to provide some configuration. For this, we are going to add some config settings in the properties file as follows.

```yaml
spring:
  kafka:
    bootstrap-servers:
      - localhost:9092
    consumer:
      client-id: my-client-consumer
      group-id: spring-application-group
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: com.amrut.prabhu.kafkacommunicationservice.dto.converters.MessageDeSerializer
    producer:
      client-id: my-client-application
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: com.amrut.prabhu.kafkacommunicationservice.dto.converters.MessageSerializer

topic:
  name: 'first-topic'
```

Here, we have set the broker properties, the value serializer, and the deserializer properties. You can find all supported properties in this class `org.springframework.boot.autoconfigure.kafka.KafkaProperties`.

Now, Since I am using a custom message class, I need to provide a custom serializer and deserializer for sending and receiving the message.

The Serializer and Deserializers are pretty simple. You need to implement the `org.apache.kafka.common.serialization.Serializer` and `org.apache.kafka.common.serialization.Deserializer` as follows.

```java
public class MessageSerializer implements Serializer<Message> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public byte[] serialize(String topic, Message data) {
        try {
            return objectMapper.writeValueAsBytes(data);
        } catch (JsonProcessingException e) {
            throw new SerializationException(e);
        }

    }
}
```

```java
public class MessageDeSerializer implements Deserializer<Message> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Message deserialize(String topic, byte[] data) {
        try {
            return objectMapper.readValue(data, Message.class);
        } catch (IOException e) {
            throw new SerializationException(e);
        }
    }
}
```

## Creating a Consumer

Along with the producer, we have set up some consumer properties. So let's create a consumer for the topic.

```java
@Component
public class KafkaConsumer {

    @KafkaListener(id = "my-client-application", topics = "${topic.name}")
    public void consumer(ConsumerRecord<String, Message> consumerRecord) {
        System.out.println("Consumed Record Details: " + consumerRecord);
        Message message = consumerRecord.value();
        System.out.println("Consumed Message" + message);
    }
}
```

Here we have created a component, with a method annotated with `KafkaListener`. This method will be invoked whenever there is a message on the Kafka topic.

So with this let's start the application.

```shell
java -jar \
target/spring-kafka-communication-service-0.0.1-SNAPSHOT.jar
```

When we run the application, it sends a message every 2 seconds and the consumer reads the message.

![Spring Kafka Integration](/static/images/2021/spring-boot-kafka-communication/spring-kafka-integration.png)

You can find more config options in the documentation [here](https://docs.spring.io/spring-kafka/docs/current/reference/html/#container-props).

## Conclusion

In this article, We saw how we can read and send messages on a Kafka topic using Spring-Kafka.

In my next article, I would be using [Spring Cloud Streams to communicate with Kafka](https://refactorfirst.com/spring-cloud-stream-with-kafka-communication). So make sure you subscribe to my newsletter below to know when I publish it.

As usual, I have uploaded the code on [GitHub](https://github.com/amrutprabhu/kafka-workouts/tree/master/spring-kafka-communication-service).

I keep exploring and learning new things. If you want to know the latest trends and improve your software development skills, then subscribe to my newsletter below and also follow me on [Twitter](https://twitter.com/amrutprabhu42).

Enjoy!!
