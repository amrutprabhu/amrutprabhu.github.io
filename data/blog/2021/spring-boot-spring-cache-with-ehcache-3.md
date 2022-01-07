---
title: 'Integrate Caching with Spring Cache and Ehcache 3'
author: 'Amrut Prabhu'
categories: ''
tags: [Spring Boot, Java, Spring cache, ehcache 3, Jcache]
image: 2021/spring-cache-ehcache-3/cover.jpg
photo-credits: ''
applaud-link: 2021/spring-cache-ehcache-3.json
date: '2021-11-02'
draft: false
summary: 'fill this'
imageUrl: /static/images/2021/spring-cache-ehcache-3/cover.jpg
actualUrl: 'auto-generated'
customUrl: 'auto-generated'
---

In this article, we will look into some Spring Cache concepts and then integrate Ehcache 3.

## Introduction

In an application, we can reduce the amount of processing or network calls to another service by introducing caching. Caching allows us to improve our application performance by avoiding executing either computationally heavy tasks or by reducing network latency when communicating with other services.

In this article, we will look at some Spring Cache concepts and then extend this further to use a cache provider called [Ehcache](https://www.ehcache.org/).

### Creating an Application

Let's go to [https://start.spring.io](https://start.spring.io) and create an application with the following dependencies.

- Spring Cache Abstraction
- Spring Web (only required to introduce REST calls for this example).

Once you generate and open the project, we will add a simple controller as follows.

```java
@RestController
public class WebService {

    @Autowired
    private Service service;


   @GetMapping("/{name}")
    public Person generatePerson(@PathVariable(value = "name") String name) {
    return service.generatePerson(name);
}
```

Now here for an incoming request, we have called a service to generate a person with a name. Let’s look at the service class.

```java
@org.springframework.stereotype.Service
public class Service {

    Logger logger = LoggerFactory.getLogger(Service.class);

    @Cacheable(cacheNames = "cacheStore", key = "#name")
    public Person generatePerson(String name) {
        Person person = new Person(UUID.randomUUID().toString(), name, "Switzerland");
        logger.info("Generated Person: {}", person);
        return person;
    }
```

As you can see here, the method `generatePerson` has a `cachable` annotation defining a cache called `cacheStore`. This way you can configure a cache that will store key-value pairs. Here, the value is the result of the function and the key is the name from the input parameter. To define your key, you can make use of Spring’s Expression Language ([SpEL](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#expressions)) format. If you don't provide the key, it will use the input as the key itself.

Now with this let's start the service and make a call to the service.

```bash
curl -i http://localhost:8080/jim
```

Once the first call is made, the logger from the function `generatePerson` generates an info log, as the function gets executed. But on a subsequent REST call, the `generatePerson`function is not executed, as it returns the result from the cache that was stored during the previous call.

```bash
2021-10-24 09:29:12.846  INFO 22022 --- [           main] c.a.p.S.SpringCachingServiceApplication  : Started SpringCachingServiceApplication in 1.614 seconds (JVM running for 1.963)

2021-10-24 09:29:18.646  INFO 22022 --- [nio-8080-exec-1] c.a.prabhu.Springcachingservice.Service  : Generated Person: Person{id='d04c8531-1054-4773-9410-8b351f4cd785', name='jim', address='Switzerland'}
```

### CachePut

Now, let's change the annotation from `cacheable` to `cachePut`and run the application.

Now, when I make the same REST call twice, it also calls the function twice. This is because in the case of `cachePut`, The function gets executed and the cache gets updated with the result from the function call. In this way, we can keep the most recent result of the execution.

So now you might wonder, how would this be beneficial? For this let's extend the service to include another method.

```java
@CachePut(cacheNames = "cacheStore", key = "#name")
public Person generatePerson(String name) {
    Person person = new Person(UUID.randomUUID().toString(), name, "Switzerland");
    logger.info("Generated Person: {}", person);
    return person;
}

@Cacheable(cacheNames = "cacheStore", key = "#person.name")
public Person fetchPerson(Person person) {
    logger.info("Person request received = {}", person);
    return person;
}
```

Here I am using the same cache `cacheStore` using the `cachable` annotation.

Now let's add an endpoint to call the `fetchPerson` method.

```java
@GetMapping("/person/{name}")
public String getPerson(@PathVariable(value = "name") String name) {
    Person person = new Person("",
            name,
            "");

    return service.fetchPerson(person)
            .toString();
}
```

Let's make the following series of calls and see the output.

![Checking cacheable annotation](/static/images/2021/spring-cache-ehcache-3/cacheable-call1.png)

As you can see, the person Id for the first two calls changes. This because `cachePut` allows the function to be executed and generates a new person Id.

Now, when we call the person endpoint to fetch the person, it fetches the last value which is stored in the `cacheStore` cache.

With this, let’s look at how we can evict a cache key-value pair. For this, we have another annotation called `cacheEvict` .

### CacheEvict

Let’s add another endpoint that will evict an entry in the cache.

Webservice

```java
@GetMapping("/evict/{name}")
public String evictPerson(@PathVariable(value = "name") String name) {
    Person person = new Person("",
            name,
            "");

    service.evictPerson(person);
    return person.toString();
}
```

Service

```java
@CacheEvict(cacheNames = "cacheStore", key = "#person.name")
public void evictPerson(Person person) {
    logger.info("evicting Person = {}", person);
}
```

Now, let's make a series of the following calls and look at the output.

![cacheable vs cacheput](/static/images/2021/spring-cache-ehcache-3/cacheable-vs-cacheput.png)

As you can see, the evict method removed the cached person and on making a subsequent call to the person endpoint, it returns an empty person.

With this, we just saw some major concepts of Spring Cache i.e Cacheable, CachePut, and CacheEvict.

Now by default, Since there is no additional provider, Spring Cache makes use of the JCache which is the default provider present on the classpath when the `Spring-Cache-Starter` is added as a dependency. It is nothing but a simple ConcurrentHashMap.

Now there are quite a few [supported cache providers](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.caching.provider) that we can integrate with spring cache like Redis, Couchbase, Hazelcast, etc. Today we will check out how we can integrate Ehcache 3.

## Integrating Ehcache 3 with Spring Spring Cache

To integrate Ehcache 3, We need to add the following two dependencies.

```xml
<dependency>
   <groupId>org.ehcache</groupId>
   <artifactId>ehcache</artifactId>
</dependency>

<dependency>
   <groupId>javax.cache</groupId>
   <artifactId>cache-api</artifactId>
</dependency>
```

We will not specify its version here, as the spring starter knows which dependency version is compatible.

By default, Spring Cache only supports Ehcache 2. x version, hence we have to add some configuration to make it work with version 3.

```java
@Configuration
public class AppConfig {

    @Bean
    public CacheManager EhcacheManager() {

        CacheConfiguration<String, Person> cachecConfig = CacheConfigurationBuilder
          .newCacheConfigurationBuilder(String.class,
                        Person.class,
                      ResourcePoolsBuilder.newResourcePoolsBuilder()
                                .offheap(10, MemoryUnit.MB)
                                .build())
.withExpiry(ExpiryPolicyBuilder.timeToIdleExpiration(Duration.ofSeconds(10)))
                .build();

     CachingProvider cachingProvider = Caching.getCachingProvider();
     CacheManager cacheManager = cachingProvider.getCacheManager();

   javax.cache.configuration.Configuration<String, Person> configuration = Eh107Configuration.fromEhcacheCacheConfiguration(cachecConfig);
        cacheManager.createCache("cacheStore", configuration);
        return cacheManager;
    }
}
```

Here we have done some configuration to define a cache `cacheStore` with some properties like cache expiration and cache size. We have set the expiration to 10 seconds if there is no request for a key from the cache and also set an off-heap size of 10 MB to be used for caching.

The rest of the application remains the same and with this, we have just integrated Ehcache 3 with our Spring Boot application.

Now let’s start the application and make calls to the generate endpoint.

![spring cache with ehcache 3](/static/images/2021/spring-cache-ehcache-3/spring-cache-ehcache-3.png)

![ehcache 3 with log ](/static/images/2021/spring-cache-ehcache-3/ehcache-3log.png)

So as you can see in the output, the cache entry for “Jim” expired after 10 secs and the person endpoint returned an empty person.

## Conclusion

In this article, we explored the main concepts of Spring Cache and then integrated Ehcache 3 provider. We then configured the cache size, the cache expiry, and checked its output. You can read more in-depth about the Spring Cache concepts on the official site [here](https://docs.spring.io/spring-framework/docs/current/reference/html/integration.html#cache).

As usual, I have uploaded the code on [GitHub](https://github.com/amrutprabhu/spring-cache-with-ehcache-3).

I keep exploring and learning new things. If you want to know the latest trends and improve your software development skills, then subscribe to my newsletter below and also follow me on [Twitter](https://twitter.com/amrutprabhu42).

Enjoy!!
