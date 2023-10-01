---
title: 'KStreams, Kafka Streams — Aggregate, Transform, and Join With Windowing using Spring Cloud Stream'
author: 'Amrut Prabhu'
categories: ''
tags: [Java, Spring Boot, Kakfa, Spring cloud Stream, Kstream, kafka stream]
photo-credits:
applaud-link: 2021/spring-boot-stream-kafka.json
date: '2023-08-24'
draft: false
summary: 'In this article, we will explore Kstreams or Kafka Streams with aggregate, join, and windowing concepts using Spring Cloud Stream Kafka Streams'
imageUrl: /static/images/2023/spring-cloud-kafka-stream-aggregate-join-window/cover.jpg
actualUrl: 'auto-generated'
customUrl: 'auto-generated'
---

### KStreams, Kafka Streams — Aggregate, Transform, and Join using Spring Cloud Stream

In this article, we will explore Kstreams or Kafka Streams with aggregate, join, and windowing concepts using Spring Cloud Stream Kafka Streams

## Creating a project with Spring Cloud Streams

Go to [https://start.spring.io](https://start.spring.io) and add the following dependencies

- Cloud Stream
- Spring For Apache Kafka
- Spring For Apache Kafka Streams

The goal will be to create a pipeline like the one below to explore various concepts like transformation, aggregation, and joining in KStreams or Kafka Streams.

![kafka-streams-pipeline-example](/static/images/2023/spring-cloud-kafka-stream-aggregate-join-window/kafka-streams-pipeline-example.png)

So first let’s create the producer that will send messages to the Kafka Topic `first-topic` every second.

You can refer to the entire code on my GitHub Repo [here](https://github.com/amrutprabhu/kafka-workouts/tree/master/spring-cloud-stream-kafka-streams-with-kstreams).

## Creating a Kafka Publisher with Spring Cloud Stream Kafka

Spring Cloud Stream makes use of functional interfaces from `java.util.function` package to define producers and consumers.

Hence we will create a simple supplier bean that will supply values as a producer.

```java
 @Bean
    public Supplier<org.springframework.messaging.Message<MyEvent>> producer() {
        return () -> {
            // random department
            Department department = Department.values()[new Random().nextInt(Department.values().length)];

            // Event playload
            MyEvent myEvent = new MyEvent("Jack", department);
            return MessageBuilder.withPayload(myEvent)
                    .setHeader(KafkaHeaders.KEY, department.name())
                    .build();
        };

    }

```

  <div>
      <ins class="adsbygoogle"
           style={{display:'block', textAlign:'center'}}
           data-ad-layout="in-article"
           data-ad-format="fluid"
           data-ad-client="ca-pub-7490174059724719"
           data-ad-slot="8168941152"
           id="adflow1">
     </ins>
  </div>

Here I am creating a producer that will send a message called MyEvent which has a name and department that will be chosen randomly.

Here, the message key is the department and we wrap the payload using the MessageBuilder from Spring.

This is how we can create a simple producer that produces a message every second.

Now, let's look at the properties required for this.

```yaml
spring:
  cloud:
    function:
      definition: producer
    stream:
      kafka:
        binder:
          brokers: localhost:9092
        bindings:
          producer-out-0:
            producer:
              configuration:
                key.serializer: org.apache.kafka.common.serialization.StringSerializer
      bindings:
        producer-out-0:
          destination: first-topic
```

Here we set three things:

- **The Binding**: This registers the binding function’s parameter.
- **The producer configuration**: To specify the key serializer.
- **The Spring Cloud Function definition**: This is the bean definition of binding.

You can read this article [here](https://refactorfirst.com/spring-cloud-stream-with-kafka-communication), wherein I explain in detail how these properties are set, what is the meaning of the `-out-` property, and how the bindings work.

I would recommend reading it as it will make it easier to understand the next section in which we will be exploring how we can deal with Kafka Streams or KStreams

  <div>
      <ins class="adsbygoogle"
           style={{display:'block', textAlign:'center'}}
           data-ad-layout="in-article"
           data-ad-format="fluid"
           data-ad-client="ca-pub-7490174059724719"
           data-ad-slot="8168941152"
           id="adflow2">
     </ins>
  </div>

## Creating a KStream or Kafka Stream Transformation

Let’s consider we want to create a handler that will transfer an input stream and send it out to another Kafka Stream

So our producer above is emitting events and now we will transform them and send them to a new topic.

Now the transformation is as simple as defining the following functional bean.

```java
 @Bean
    public Function<KStream<String, MyEvent>, KStream<String, String>> enhancer() {
        return input -> input
                .mapValues(value -> value.name());
    }
```

It just takes the input and transforms it by mapping the value which was originally a JSON object to the name inside the JSON Object.

Next, we need to configure the enhancer in the properties file.

```yaml
spring:
  cloud:
    function:
      definition: producer;enhancer
    stream:
      kafka:
        streams:
          bindings:
            enhancer-in-0: #   only required if you need to provide some configurations.
              consumer:
                keySerde: org.apache.kafka.common.serialization.Serdes$StringSerde
                valueSerde: com.amrut.prabhu.dto.coverters.MyEventSerDes #custom

        binder:
          brokers: localhost:9092
        bindings:
          producer-out-0:
            producer:
              configuration:
                key.serializer: org.apache.kafka.common.serialization.StringSerializer
      bindings:
        producer-out-0:
          destination: first-topic

        enhancer-in-0:
          destination: first-topic
        enhancer-out-0:
          destination: second-topic
```

Here, we do three things.

- We specify the binding for our enhancer. We specify the topics from which we want to read and write messages to
- Our Spring Cloud function definition i.e. enhancer
- And finally the key and value serializer and deserializer in the Kafka Streams bindings.

So here we are creating our custom value serializer which is a simple Json serializer deserializer.

```java
public class MyEventSerDes extends JsonSerde<MyEvent> {

}
```

Make sure you look at the properties carefully, as they can be confused with the properties defined under `spring.cloud.stream.kafka`

The serializer and deserializer properties are defined under the `spring.cloud.stream.kafka.streams` umbrella.

So be careful about it.

With this, the input KStream or Kafka Stream coming from the topic `first-topic`looks like this:

![first-kafka-stream-output](/static/images/2023/spring-cloud-kafka-stream-aggregate-join-window/first-kafka-stream-output.webp)

While the output sent to the topic `second-topic` looks like this:

![second-kafka-stream-output](/static/images/2023/spring-cloud-kafka-stream-aggregate-join-window/second-kafka-stream-output.webp)

The images above is using the following format to show the contents of the Kafka topic.

  <div>
      <ins class="adsbygoogle"
           style={{display:'block', textAlign:'center'}}
           data-ad-layout="in-article"
           data-ad-format="fluid"
           data-ad-client="ca-pub-7490174059724719"
           data-ad-slot="8168941152"
           id="adflow3">
     </ins>
  </div>

```shell
Partition: <Topic partition number> : Offset: <Topic offset> : <Key> : <Value>
```

We will be using the same format to view the messages in the topics as we go ahead.

Now let’s look at how we can aggregate data from one stream and send it to another.

## Aggregate Data From KStream Or Kafka Stream With Windowing

Let’s aggregate data from the `first-topic` for a time window of 10 seconds and send it over to a `third-topic` .

```java
 @Bean
    public Function<KStream<String, MyEvent>, KStream<String, String>> aggregate() {
        return input -> input

                .groupByKey()
                .windowedBy(TimeWindows.ofSizeWithNoGrace(Duration.ofSeconds(10)))
                .aggregate(() -> 0l,
                        (key, value, aggregate) -> aggregate + 1,
                        Materialized.with(Serdes.String(), Serdes.Long()))

                .suppress(Suppressed.untilWindowCloses(Suppressed.BufferConfig.unbounded()))
                .toStream()
                .map((w, v) ->  new KeyValue<>(w.key(), v.toString()));

    }
```

Here we first group the data by the key within a window size of 10 seconds.

In the aggregate function, the first parameter is the initial value of 0 for the aggregate. The second parameter is an aggregate function that increments by 1 for every value with the same key in the 10-second window (simulating a count aggregation)

The final parameter is used to specify the serializer and deserializer to materialize the results of the time window in an intermediate topic.

After the aggregate function, we have to specify the suppression, or else the intermediate values during the aggregation window will be sent out to the output topic.

Now, let's look at the properties.

```yaml
spring:
  cloud:
    function:
      definition: producer;enhancer;aggregate
    stream:
      kafka:
        streams:
          bindings:
            enhancer-in-0: #   only required if you need to provide some configurations.
              consumer:
                keySerde: org.apache.kafka.common.serialization.Serdes$StringSerde
                valueSerde: com.amrut.prabhu.dto.coverters.MyEventSerDes #custom

            aggregate-in-0:
              consumer:
                keySerde: org.apache.kafka.common.serialization.Serdes$StringSerde
                valueSerde: com.amrut.prabhu.dto.coverters.MyEventSerDes #custom

        binder:
          brokers: localhost:9092
        bindings:
          producer-out-0:
            producer:
              configuration:
                key.serializer: org.apache.kafka.common.serialization.StringSerializer
      bindings:
        producer-out-0:
          destination: first-topic

        enhancer-in-0:
          destination: first-topic
        enhancer-out-0:
          destination: second-topic
        #
        aggregate-in-0:
          destination: first-topic
        aggregate-out-0:
          destination: third-topic
```

Here we also provide three things.

- The binding specifies the input and output topic.
- The binding function definition under the property `spring.cloud.function.definiton`
- Finally the consumer properties under `spring.cloud.stream.kafka.streams` specifying the key and value serializer and deserializer.

  <div>
      <ins class="adsbygoogle"
           style={{display:'block', textAlign:'center'}}
           data-ad-layout="in-article"
           data-ad-format="fluid"
           data-ad-client="ca-pub-7490174059724719"
           data-ad-slot="8168941152"
           id="adflow4">
     </ins>
  </div>

With this, the data will be produced every 10 seconds on the `third-topic` as shown below.

![third-kafka-stream-aggregate-output](/static/images/2023/spring-cloud-kafka-stream-aggregate-join-window/third-kafka-stream-aggregate-output.webp)

So this is the aggregated count per key in a time window of 10 seconds.

With this let’s look at how we can join data from the `second-topic` and the `third-topic` and produce the joined value in the `fourth-topic` .

## Using Join On KStreams or Kafka Streams with Windowing

To create a Join of two Kafka Streams we will make use of a Bifunction.

```Java
 @Bean
    public BiFunction<KStream<String, String>, KStream<String, String>, KStream<String, JoinedValue>> join() {
        return (input1, input2) -> input1.join(input2,
                (value1, value2) -> new JoinedValue(value1, value2),
                JoinWindows.ofTimeDifferenceWithNoGrace(Duration.of(10, ChronoUnit.SECONDS)),
                StreamJoined.with(Serdes.String(),Serdes.String(),Serdes.String())
                );

    }
```

In the function above, we take the messages from the `second-topic` and join them directly with the messages from the `third-topic` for a time window of 10 seconds resulting in a cartesian product.

Every message will be combined with a message from the other topic based on the key. This will result in an output just like a full join in SQL.

Let’s look at the properties.

```yaml
spring:
  cloud:
    function:
      definition: producer;enhancer;aggregate;join
    stream:
      kafka:
        streams:
          bindings:
            enhancer-in-0: #   only required if you need to provide some configurations.
              consumer:
                keySerde: org.apache.kafka.common.serialization.Serdes$StringSerde
                valueSerde: com.amrut.prabhu.dto.coverters.MyEventSerDes #custom
            aggregate-in-0:
              consumer:
                keySerde: org.apache.kafka.common.serialization.Serdes$StringSerde
                valueSerde: com.amrut.prabhu.dto.coverters.MyEventSerDes #custom
            join-out-0:
              producer:
                keySerde: org.apache.kafka.common.serialization.Serdes$StringSerde
                valueSerde: com.amrut.prabhu.dto.coverters.JoinedValueSerDes

        binder:
          brokers: localhost:9092
        bindings:
          producer-out-0:
            producer:
              configuration:
                key.serializer: org.apache.kafka.common.serialization.StringSerializer
      bindings:
        producer-out-0:
          destination: first-topic

        enhancer-in-0:
          destination: first-topic
        enhancer-out-0:
          destination: second-topic
        #
        aggregate-in-0:
          destination: first-topic
        aggregate-out-0:
          destination: third-topic
        #
        join-in-0:
          destination: second-topic
        join-in-1:
          destination: third-topic
        join-out-0:
          destination: fourth-topic
```

Here, if you look carefully, in the binding we specify two inputs and one output.

The rest is the same as adding the function definition and the serializer and deserializer properties as we did for the other bindings above.

  <div>
      <ins class="adsbygoogle"
           style={{display:'block', textAlign:'center'}}
           data-ad-layout="in-article"
           data-ad-format="fluid"
           data-ad-client="ca-pub-7490174059724719"
           data-ad-slot="8168941152"
           id="adflow5">
     </ins>
  </div>

When we run this, it produces the following messages on the `fourth-topic`

![fourth-kafka-stream-join-output](/static/images/2023/spring-cloud-kafka-stream-aggregate-join-window/fourth-kafka-stream-join-output.webp)

You can refer to the entire code on my GitHub Repo [here](https://github.com/amrutprabhu/kafka-workouts/tree/master/spring-cloud-stream-kafka-streams-with-kstreams).

If you are interested in learning more about Java and Spring Boot, here are some interesting articles to look at.

- [**Spring Boot 3.1 Docker Compose Support**](https://refactorfirst.com/spring-boot-3-with-docker-compose-support)
- [**Defining Event-Driven Architectures — AsyncAPI**](https://refactorfirst.com/defining-event-driven-achitectures-asyncapi)
- [**FIDO2 Passwordless Authentication With KeyCloak**](https://refactorfirst.com/how-does-fido2-passwordless-authentication-work)

I keep exploring and learning new things. If you want to know the latest trends and improve your software development skills, then subscribe to my newsletter below and also follow me on [Twitter](https://twitter.com/amrutprabhu42).

Enjoy!!
