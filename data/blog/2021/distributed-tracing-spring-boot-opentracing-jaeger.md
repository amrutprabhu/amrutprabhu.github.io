---
title: 'Distributed Tracing With Spring Cloud Jaeger'
author: 'Amrut Prabhu'
categories: ''
tags: [Spring Boot, Java, Jaeger, Distributed Tracing]
image: 2021/distributed-tracing-with-jaeger/cover.jpg
photo-credits:
applaud-link: 2021/distributed-tracing-with-spring-cloud-jaeger.json
date: '2021-09-23'
draft: false
summary: 'We will explore how to implement distributed tracing using Jaeger and visualize the traces using Jaeger UI'
imageUrl: /static/images/2021/distributed-tracing-with-jaeger/cover.jpg
actualUrl: 'auto-generated'
customUrl: 'auto-generated'
---

In this article, we will explore how to implement distributed tracing using Jaeger and visualize the traces using Jaeger UI.

# Introduction

Jaeger is an open-source distributed tracing mechanism that helps to trace requests in distributed systems. It is based on [opentracing](https://opentracing.io/) specification and is a part of the [Cloud Native Computing Foundation (CNCF)](https://www.cncf.io/).

I have explained some key concepts of tracing in my previous article “[Distributed Tracing With Spring Cloud Sleuth](https://refactorfirst.com/distributed-tracing-with-spring-cloud-sleuth.html)”.

With this, let’s look at some code.

### Implementing Jaeger Tracing

Let’s create an application from [https://start.spring.io](https://start.spring.io) with only a single dependency “Spring Web”.

Once you generate and download the code, we will add the following Jaeger dependency to the pom file which will help to generate and propagate the traces between the services.

```xml
<dependency>
   <groupId>io.opentracing.contrib</groupId>
   <artifactId>opentracing-spring-jaeger-cloud-starter</artifactId>
   <version>3.3.1</version>
</dependency>
```

With this, let's add a controller with some paths.

```java
@RestController
@RequestMapping("/service")
public class Controller {

    private static final Logger _logger_ = LoggerFactory._getLogger_(Controller.class);
    private RestTemplate restTemplate;

    @Value("${spring.application.name}")
    private String applicationName;

    public Controller(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping("/path1")
    public ResponseEntity path1() {

        _logger_.info("Incoming request at {} for request /path1 ", applicationName);
        String response = restTemplate.getForObject("http://localhost:8090/service/path2", String.class);
        return ResponseEntity._ok_("response from /path1 + " + response);
    }

    @GetMapping("/path2")
    public ResponseEntity path2() {
        _logger_.info("Incoming request at {} at /path2", applicationName);
        return ResponseEntity._ok_("response from /path2 ");
    }
}
```

Here, we have two endpoints `/path1` and `/path2` . The idea here is to use two instances of the same application such that `/path1` calls `/path2` of another service at a fixed port 8090.

For the spans to get connected to the same trace id, We need to create a RestTemplate bean to allow Jaeger to include an interceptor. This then helps to add traces to the outgoing request which will help to trace the entire request.

```java
@Bean
   public RestTemplate restTemplate(RestTemplateBuilder builder) {
      return builder.build();
   }
```

With this done, Let’s start a Jaeger Server locally using docker. For this, I have created a docker-compose file with the port mappings.

```yaml
version: '3.3'
services:
  jaeger-allinone:
    image: jaegertracing/all-in-one:1.25
    ports:
      - 6831:6831/udp
      - 6832:6832/udp
      - 16686:16686
      - 14268:14268
```

We can communicate with Jaeger using either via UDP or TCP. After starting the docker image using `docker-compose up` , we can access the UI using the URL [http://localhost:16686/](http://localhost:16686/)

Now, let's add some properties to allow the application to send the traces to the Jaeger server. We will communicate via TCP, so make sure that we send the traces to the other TCP port. i.e 14268

```yaml
opentracing:
  jaeger:
    http-sender:
      url: http://localhost:14268/api/traces
```

Let’s start “Server 1” with the below command.

```shell
java -jar \
target/Distributed-Service-0.0.1-SNAPSHOT.jar \
--spring.application.name=Service-1 \
--server.port=8080
```

Then on a different terminal, run a new instance of the same application as “Service 2” as follows

```shell
java -jar \
target/Distributed-Service-0.0.1-SNAPSHOT.jar \
--spring.application.name=Service-2 \
--server.port=8090
```

Once the application starts, call “Service 1” at `/path1` as follows

```shell
curl -i http://localhost:8080/service/path1
```

Let’s look at the logs of “Service 1”.

```shell
INFO 69938 --- [nio-8080-exec-1] i.j.internal.reporters.LoggingReporter   : Span reported: ed70bbaa2bd5b42f:c7c94163fc95fc1e:ed70bbaa2bd5b42f:1 - GET
```

The tracing is of the format [Root Span Id, Current Span Id, Parent Span Id]. In this case, since “Service 1” is the originating service, the parent span Id “ed70bbaa2bd5b42f” is also the root span id.

Now, let’s look at the logs of “Service 2”.

```shell
INFO 69885 --- [nio-8090-exec-1] i.j.internal.reporters.LoggingReporter   : Span reported: ed70bbaa2bd5b42f:e9060cb1d5336c55:c7c94163fc95fc1e:1 - path2
```

Here we see that the middle value is the current span id and the parent span id (ie. the third value “c7c94163fc95fc1e”) is the span id of “Service 1”.

Now, If you open the UI you will see the following.

![](https://cdn-images-1.medium.com/max/788/1*JSGBW85GggHAMNLdjKP8ug.png)

When we dig deeper, we see more details on each of the spans.

![](https://cdn-images-1.medium.com/max/788/1*9FaCYTl_nm605xcjguwWbQ.png)

Here, the root span id “ed70bbaa2bd5b42f” spans across the entire request. The other two span ids refer to the individual services.

### Conclusion

Today we explored how we can integrate Jaeger which is based on OpenTracing with a spring boot application. You can always read more in-depth about the specification of OpenTracing [here](https://github.com/opentracing/specification/blob/master/specification.md). Also, the library documentation for using spring cloud Jaeger is [here](https://github.com/opentracing-contrib/java-spring-jaeger).

I have uploaded the code on [GitHub](https://github.com/amrutprabhu/distributed-tracing-with-spring-boot/tree/main/distributed-tracing-spring-cloud-jaeger).

You can read about Distributed tracing using Zipkin my previous article [here](https://refactorfirst.com/distributed-tracing-with-spring-cloud-sleuth.html).

I keep exploring and learning new things. If you want to know the latest trends and improve your software development skills, then subscribe to my newsletter below and also follow me on [Twitter](https://twitter.com/amrutprabhu42).

Enjoy!!
