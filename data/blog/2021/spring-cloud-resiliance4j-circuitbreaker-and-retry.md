---
title: 'Circuit Breaker And Retry with Spring Cloud Resiliance4j'
author: 'Amrut Prabhu'
categories: ''
tags: [Spring Boot, Java, Spring cloud, circuit breaker, retry]
image: 2021/spring-resiliance4j-circuitbreaker-retry/cover.jpg
photo-credits: https://unsplash.com/photos/kK7uPfb2YWU
applaud-link: 2021/spring-retry-circuit-breaker.json
date: '2021-12-02'
draft: false
summary: 'In this article, we will be looking into how we can integrate a circuit breaker and a retry mechanism, to handle failures while making synchronous calls to another service.'
imageUrl: /static/images/2021/spring-resiliance4j-circuitbreaker-retry/cover.jpg
actualUrl: 'auto-generated'
customUrl: 'auto-generated'
---

In this article, we will be looking into how we can integrate a circuit breaker and a retry mechanism, to handle failures while making synchronous calls to another service.

## Introduction

With the growing number of services, services might need to communicate with other servers synchronously and hence become dependent on the upstream service. Any problems while communicating with the upstream services, will propagate to the downstream services.

To protect the services from such problems, we can use some of the patterns to protect the service. So, today we are going to look into two of these, i.e the Circuit Breaker and the Retry mechanism.

Let's first look at the Retry mechanism.

## Integrating Retry

Let’s go to [https://start.spring.io](https://start.spring.io) and create a simple spring boot application with the following dependencies.

```xml
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-circuitbreaker-resilience4j</artifactId>
</dependency>
<dependency>
   <groupId>org.springframework</groupId>
   <artifactId>spring-aspects</artifactId>
</dependency>
```

Along with the circuit-breaker starter dependency, we need the spring aspects dependencies, as the retry and circuit breaker mechanism works using the Spring AOP concept.

Next, we are going to add a service class that will make a REST call to an endpoint using a RestTemplate.

```java
@org.springframework.stereotype.Service
public class Service {

    @Value("${service2.url:http://localhost:6060/service2}")
    String serviceUrl;

    @Retry(name = "myRetry", fallbackMethod = "fallback")
    public String fetchData() {
        System.out.println(" Making a request to " + serviceUrl + " at :" + LocalDateTime.now());

        RestTemplate restTemplate = new RestTemplate();
        return restTemplate.getForObject(serviceUrl, String.class);
    }

    public String fallback(Exception e) {
        return "fallback value";
    }
}
```

As you can see, we have the retry annotation on this method and the name of the fallback method if the retry count runs out. We will call the `fetchData` method from a controller which just has a simple get mapping.

```java
@RestController
public class Controller {

    @Autowired
    private Service service;

    @GetMapping("/")
    public String getValues() {
        return service.fetchData();
    }
}
```

Now, let's look at the retry configuration.

```yaml
resilience4j:
  retry:
    instances:
      myRetry:
        max-attempts: 3
        wait-duration: 5s
```

In this, we are creating the most straightforward configuration of retrying only 3 times and the interval between retries is 5 secs.

With this let’s start the application and make a call to the get endpoint.

![curl request fall back](/static/images/2021/spring-resiliance4j-circuitbreaker-retry/curl-request-fallback.png)

![retry fixed rate](/static/images/2021/spring-resiliance4j-circuitbreaker-retry/first-retry-5-secs-diff.png)

This was retrying after a fixed rate of 5 secs.

### Exponential Retries

Now, It may happen that retrying after a fixed time could cause the upstream service to further not respond ( probably it’s already overwhelmed with many requests). In this case, we can provide an exponential back-off mechanism.

Let's add this config.

```yaml
resilience4j:
  retry:
    instances:
      myRetry:
        max-attempts: 3
        wait-duration: 5s
        enable-exponential-backoff: true
        exponential-backoff-multiplier: 2
```

The exponent backoff works in the following way:

```shell
wait-duration * (exponential-backoff-multiplier ^ (retry iteration count))
```

So with the above configuration, The reties will occur at the following times.

```groovy
1st Retry  - 5s * 2^0 = after 5 seconds
2nd Retry  - 5s * 2^1 = after 10 seconds
3rd Retry  - 5s * 2^2 = after 20 seconds
..
..
nTh Retry - 5s * 2^n
```

![exponential retry](/static/images/2021/spring-resiliance4j-circuitbreaker-retry/retry-with-exponential.png)

### Conditional Retry on Exceptions

Let's consider there may be certain exceptions you want to retry and some exceptions you don't want to retry.

For example, when we send a bad request, no matter the number of retries, we will always get the same error. In this case, we would not want to retry. But for say 404 errors, we would want to retry ( probably the service is temporarily unavailable).

In such cases, we can configure for which exception type we should retry or not. To do this we need to add the following config properties.

```yaml
resilience4j:
  retry:
  instances:
    myRetry:
      max-attempts: 5
      wait-duration: 5s
      enable-exponential-backoff: true
      exponential-backoff-multiplier: 2
      retry-exceptions:
        - org.springframework.web.client.RestClientException
      ignore-exceptions:
        - com.amrut.prabhu.IgnoreException
```

Just as an example I have declared that I do not want to retry when an exception of type `IgnoreException` is thrown.

Now, these were some of the configuration properties for the Resilience4J Retry mechanism.

Let’s look at yet another concept called the Circuit Breaker.

## Integrating a Circuit Breaker

A circuit breaker is a mechanism that allows the application to protect itself from unreliable downstream services. This prevents cascading failures to be propagated throughout the system and helps to build fault-tolerant and reliable services.

The support for the circuit breaker is already present in the dependency we added so let’s make use of it.

```java
@CircuitBreaker(name = "myCircuitBreaker", fallbackMethod = "fallback")

@Retry(name = "myRetry")
public String fetchData() {
    System.out.println(" Making a request to " + serviceUrl + " at :" + LocalDateTime.now());

    RestTemplate restTemplate = new RestTemplate();
    return restTemplate.getForObject(serviceUrl, String.class);
}
```

**Note:** Carefully notice I have removed the fallback method from the retry annotation. Because I want the circuit breaker to take over when the retries have exhausted.

Let’s configure the circuit breaker.

```yaml
resilience4j:
  retry:
  instances:
      myRetry:
        max-attempts: 3
        wait-duration: 5s
        enable-exponential-backoff: true
        exponential-backoff-multiplier: 2
        retry-exceptions:
         - org.springframework.web.client.RestClientException
        ignore-exceptions:
         - com.amrut.prabhu.IgnoreException
  circuitbreaker:  instances:
      myCircuitBreaker:
       wait-duration-in-open-state: 1m
       permitted-number-of-calls-in-half-open-state: 3
       sliding-window-type: count-based
       sliding-window-size: 5
       minimum-number-of-calls: 5
       slow-call-duration-threshold: 10s
       slow-call-rate-threshold: 60
       failure-rate-threshold: 60
```

### Understanding the Circuit Breaker Config

Here, I am using a count-based sliding window, wherein the window size is of 5 events, and the failure and slowness threshold rate is 60%.

> Now, what does this sliding window mean?

It means that we would consider a set of 5 consecutive events ( success or failures), to determine if the circuit breaker should transition to an OPEN or CLOSED state.

The term OPEN state means the circuit breaker is activated thereby not allowing calls to be made to the upstream service.

Now, in the above config, if in 5 calls, 60% of the calls fail or are slow ( i.e at least 3 calls), then the circuit breaker would move to the OPEN state. Once the circuit breaker moves to the OPEN state, it would wait in this state for 1 minute before moving to a HALF-OPEN state.

> Now, what is this HALF-OPEN state?

This state is like an evaluation state, where we check based on a limited number of permitted calls if the circuit breaker moves to either OPEN or CLOSED state. Based on the permitted number of calls, if the number of slow or failures exceeds the slowness or failure threshold then the circuit breaker moves back to the OPEN state or else moves it to the CLOSED state.

For example, In the above config, since we have set the number of permitted calls in HALF_OPEN state as 3, at least 2 calls need to succeed in order for the circuit breaker to move back to the CLOSED state and allow the calls to the upstream server.

![](/static/images/2021/spring-resiliance4j-circuitbreaker-retry/circuit-breaker-state-transition.png)

## Circuit Breaker and Retry Config Together

Now with the above config, let’s start the application and make a request to the endpoint.

![fallback curl request](/static/images/2021/spring-resiliance4j-circuitbreaker-retry/curl-request-fallback.png)

![no retry with circuit breaker](/static/images/2021/spring-resiliance4j-circuitbreaker-retry/no-retry-with-circuit-breaker.png)

On making a request we see that it only tried once and directly returned us the fallback value. This is because the circuit breaker fallback method was called directly and the retry was not triggered. The reason for this is the order in which the spring aspects handling the two mechanisms are arranged.

### Circuit Breaker and Retry Aspects Order

As the implementation of the circuit breaker and retry mechanism work by making use of spring’s method-based AOP mechanism, the aspects handling the two different mechanisms have a certain order.

By default, the retry mechanism has lower priority and hence it warps around the circuit breaker aspect.

```
 Retry  ( Circuit Breaker ( function ) )
```

Now to change this, we can add an “aspect order” property to define the order as shown below.

```yaml
resilience4j:
  retry:
    retry-aspect-order: 2
    instances:
      myRetry:
        max-attempts: 3
        wait-duration: 5s
        enable-exponential-backoff: true
        exponential-backoff-multiplier: 2
        retry-exceptions:
          - org.springframework.web.client.RestClientException
        ignore-exceptions:
          - com.amrut.prabhu.IgnoreException
  circuitbreaker:
    circuit-breaker-aspect-order: 1
    instances:
      myCircuitBreaker:
        wait-duration-in-open-state: 1m
        permitted-number-of-calls-in-half-open-state: 3
        sliding-window-type: count-based
        sliding-window-size: 5
        minimum-number-of-calls: 5
        slow-call-duration-threshold: 10s
        slow-call-rate-threshold: 60
        failure-rate-threshold: 60
```

The higher the order value, the higher is the priority. You can read about the default priority order in the documentation [here](https://resilience4j.readme.io/docs/getting-started-3#aspect-order).

With this when we run the application, we get the following output.

![retry with circuit breaker](/static/images/2021/spring-resiliance4j-circuitbreaker-retry/retry-with-circuit-breaker.png)

With this, the 3 retries happen and then the circuit breaker aspect would take over.

If you carefully want to understand the working of the circuit breaker and retry mechanism, I have written an integration test which you can refer to [here](https://github.com/amrutprabhu/spring-resilience4j-circuit-breaker-and-retry/blob/main/spring-boot-with-circuit-breaker-and-retry/src/test/java/com/amrut/prabhu/CircuitBreakerAndRetryTest.java)

### Conclusion

With this, we just saw how we can integrate a Circuit Breaker and a Retry mechanism in a spring boot application. Similarly, we can integrate rate limiter, bulkhead, etc. You can read more about this in their documentation [here](https://resilience4j.readme.io/docs/getting-started)

As usual, I have uploaded the code on [GitHub](https://github.com/amrutprabhu/spring-resilience4j-circuit-breaker-and-retry).

I keep exploring and learning new things. If you want to know the latest trends and improve your software development skills, then subscribe to my newsletter below and also follow me on [Twitter](https://twitter.com/amrutprabhu42).

Enjoy!!
