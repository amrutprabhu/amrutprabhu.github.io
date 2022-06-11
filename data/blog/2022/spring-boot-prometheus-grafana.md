---
title: 'Monitoring Spring Boot Application with Prometheus and Grafana'
author: 'Amrut Prabhu'
categories: ''
tags: [Spring Boot, Java, Prometheus, Grafana, APM]
image: 2022/spring-boot-prometheus-grafana/cover.jpg
photo-credits:
applaud-link: 2021/spring-boot-stream-kafka.json
date: '2022-06-10'
draft: false
summary: ' In this article, we will be looking into how we can monitor our Spring Boot application using Grafana. We would be looking into the whole setup and create a simple dashboard to view some metrics.'
imageUrl: /static/images/2022/spring-boot-prometheus-grafana/cover.jpg
actualUrl: 'auto-generated'
customUrl: 'auto-generated'
---

In this article, we will be looking into how we can monitor our Spring Boot application using Grafana. We would be looking into the whole setup and create a simple dashboard to view some metrics.

## Introduction

Every application that is deployed on production needs some kind of monitoring to see how the application is performing. This will give you some insights on whether the application is performing as aspected or if you would need to take some action in order to obtain the desired level of performance. In the modern world, this data is called Application Performance Metrics (APM). Now there are quite many commercial tools like [Newrelic](https://newrelic.com/), [Datadog APM](https://www.datadoghq.com/product/apm/), etc. which are SAAS services providing such capabilities.

Today we will be looking at two open-source tools called [Grafana](https://grafana.com/) and [Prometheus](https://prometheus.io/). Prometheus gathers and stores metrics data in a time series format while Grafana uses Prometheus as a data source to visualize the data on dashboards.

With this, Let’s start by creating an application and monitor it using Grafana.

## Creating a Spring Boot Application

Let’s go to [https://start.spring.io](https://start.spring.io) and create a simple application with the following dependencies.

- Spring Boot Actuator (Ops)
- Prometheus (Observability)
- Spring Web ( Optional: only to create a simple REST controller.)

Next, we need to expose an actuator endpoint through which Prometheus will collect metrics data in the format that Prometheus understands. For this, we need to add the following properties.

```yaml
management:
  endpoints:
    web:
      exposure:
        include:
          - prometheus
```

Next, Let’s add a simple controller that will produce some warning logs. We will use this to monitor the number of warnings we are getting.

```java
@RestController
@SpringBootApplication
public class PrometheusIntegrationApplication {

    final static Logger logger = LoggerFactory.getLogger(PrometheusIntegrationApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(PrometheusIntegrationApplication.class, args);
    }

    @GetMapping("/something")
    public ResponseEntity<String> createLogs() {
        logger.warn("Just checking");
        return ResponseEntity.ok().body("All Ok");
    }
}
```

With this, Let’s start the application and open the following URL.

```shell
http://localhost:8080/actuator/prometheus
```

## Understanding the Metics data

After opening the above endpoint, you will find some metrics data in the following format

```shell
jvm_memory_used_bytes{area="heap",id="G1 Survivor Space",} 1005592.0
```

The first part i.e `jvm_memory_used_bytes` is called the label, while the fields inside the curly braces are called attributes. Each of these labels represents a particular metric and the attribute provides you with a way to query so that you can get the values.

Next, Let's configure Prometheus to read this data.

## Configuring Prometheus

To start Prometheus, we will be using a Prometheus docker image and provide it with some configuration to gather the metrics data from our application. It does so by creating jobs that will scrape data from an endpoint. So let’s define the job in the `prometheus.yaml`configuration file as below.

```yaml
scrape_configs:
  - job_name: 'Spring Boot Application input'
    metrics_path: '/actuator/prometheus'
    scrape_interval: 2s
    static_configs:
      - targets: ['localhost:8000']
        labels:
          application: 'My Spring Boot Application'
```

Here, I have defined a job that will call the actuator endpoint on our application every 2 seconds to get the metrics data.

Next, Let's create a docker-compose file that will bring the Prometheus docker image up and running.

```yaml
services:
  prometheus:
    image: prom/prometheus:v2.35.0
    network_mode: host
    container_name: prometheus
    restart: unless-stopped
    volumes:
      - ./data/prometheus/config:/etc/prometheus/
    command:
      - '--config.file=/etc/prometheus/prometheus.yaml'
    ports:
      - 9090:9090
```

Here, we have the config file mounted at the location `/etc/prometheus` and we use the location of the config file as an argument to the command. For simplicity, we are using the host network mode, so that Prometheus can access our application endpoint directly.

With this, let’s start the docker image with `docker compose up` and open the URL `http://localhost:9090` on our browser.

Now let's search for the label `logback_events_total`

![Prometheus view](/static/images/2022/spring-boot-prometheus-grafana/prometheus-logback.png)

As you can see, we get to see the metric that Prometheus gathered at a particular time.

In case you don't find the label, You can check if the job is running by navigating to “Status > Targets”. You should see the state as “UP” like this.

![Prometheus Targets](/static/images/2022/spring-boot-prometheus-grafana/prometheus-targets.png)

So with this, the data is getting ingested into Prometheus every 2 seconds.

Now let's visualize this using Grafana.

## Visualizing Metrics in Grafana

We are going to be using Grafana’s docker image and let’s add it to the docker-compose file.

```yaml
grafana:
    image: grafana/grafana-oss:8.5.2
    pull_policy: always
    network_mode: host
    container_name: grafana
    restart: unless-stopped
    user: root
    ports:
      - 3000:3000
    links:
      - prometheus:prometheus
    volumes:  - ./data/grafana:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_SERVER_DOMAIN=localhost
```

Here also we are making use of the host network mode, to make it easy for us and Grafana to access the Prometheus endpoint.

Next, let's open the URL [http://localhost:3000](http://localhost:3000,) and access Grafana using the username and password as “admin”

### Configuring Grafana Data Source

Let’s first add the Prometheus data source. To do that, Navigate to “add a data source” and select Prometheus. Then you need to only add a single property i.e the Prometheus URL [http://localhost:9090.](http://localhost:9090.)

![Prometheus Targets](/static/images/2022/spring-boot-prometheus-grafana/prometheus-data-source.png)

Click “Save and test” and now, let's create our first Dashboard

### Creating Grafana Dashboard

Click on the “+” icon on the left and then select “Create Dashboard”. Now let's add our first Panel.

Next, let's query for a label in the metric browser i.e `logback_events_total`

![grafana simple query](/static/images/2022/spring-boot-prometheus-grafana/logbac-simple-query.png)

As you can see here, we get counts of all types of logs. These counts are currently from our application’s startup logs and are shown in a time-series format.

Let’s drill down to only view the warning logs. For this, we would have to add the attribute `level=”warn”` as below.

![Grafana Warning logs](/static/images/2022/spring-boot-prometheus-grafana/logback-warn-logs.png)

That's it. We just created a simple metric visualization panel to view the number of warning logs.

Now usually, we would like to view the rate of errors or warning logs over a certain period of time. This will help us to understand if there is some problem in our system. For this, we can use the `rate` function to calculate the rate of logs over a particular period of time.

So after triggering the controller endpoint on our spring boot application, it generated some warning logs, that led to this graph.

![Grafana warning logs rate](/static/images/2022/spring-boot-prometheus-grafana/logback-warn-rate.png)

Let’s save this panel and there we go. We just created our first Grafana Dashboard with warning logs metric panel.

![Grafana Sample Dashboard Targets](/static/images/2022/spring-boot-prometheus-grafana/saved-panel.png)

Now, We don’t need to create dashboards from scratch. Rather there are quite many community-provided dashboards. This is what I really liked. Hence you can use a full-fledged dashboard for spring boot applications from [here](https://grafana.com/grafana/dashboards/6756). However, I did find some problems while trying to use it as data was not getting visualized properly. So I updated the dashboard and you can find the JSON to the dashboard in my GitHub repo [here](https://github.com/amrutprabhu/grafana-prometheus/blob/main/Spring%20Boot%20Statistics%20Dashboard.json).

![Grafana full fledged dashboard](/static/images/2022/spring-boot-prometheus-grafana/spring-boot-application-metrics-view.png)

## Conclusion

In this article, we saw how we can monitor a Spring Boot application’s performance using Prometheus and Grafana. In My next article, we will be looking into Alerting on a certain event using Grafana.

You can find the complete code and Dashboard Json on my GitHub repo [here](https://github.com/amrutprabhu/grafana-prometheus).

Enjoy!!
