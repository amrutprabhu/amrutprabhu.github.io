---
title: 'AWS with LocalStack using Docker Compose'
author: 'Amrut Prabhu'
categories: ''
tags: [AWS, docker, localstack, docker compose]
photo-credits:
applaud-link: 2021/spring-boot-stream-kafka.json
date: '2023-04-27'
draft: false
summary: 'This is a quick article to set up and run LocalStack using docker-compose.'
imageUrl: /static/images/2023/localstack-with-docker-compose/cover.jpg
actualUrl: 'auto-generated'
customUrl: 'auto-generated'
---

## Running LocalStack with Docker Compose

```yaml
version: '3.8'

services:
  localstack:
    image: localstack/localstack:2.0
    ports:
      - '4566:4566' # LocalStack endpoint
      - '4510-4559:4510-4559' # external services port range
    environment:
      - DOCKER_HOST=unix:///var/run/docker.sock
    volumes:
      - ./localstack-script.sh:/etc/localstack/init/ready.d/script.sh
      - '/var/run/docker.sock:/var/run/docker.sock'
```

With this docker-compose file, we can start LocalStack and make queries using the AWS CLI.

As part of starting LocalStack, we will also mount a directory that will contain scripts to create some resources.

LocalStack provide a CLI called `awslocal` which is a wrapper around the AWS CLI.

So we will use this CLI to create an S3 bucket.

## Creating an S3 bucket in LocalStack

Let’s add a command to create an S3 bucket using the LocalStack CLI.

```shell
=> localstack-script.sh

#!/bin/bash

awslocal s3api \
create-bucket --bucket my-bucket \
--create-bucket-configuration LocationConstraint=eu-central-1 \
--region eu-central-1
```

Once you create the script file, you need to give it executable permissions. This is required or else it will fail on startup.

Now with this let's start the docker-compose file using `docker compose up`

```yaml
=> Logs


LocalStack version: 2.0.2
LocalStack Docker container id: b67f7bb6252b
LocalStack build date: 2023-04-17
LocalStack build git hash: 6b436786

2023-04-20T21:57:50.954 WARN --- [-functhread5] hypercorn.error            : ASGI Framework Lifespan error, continuing without Lifespan support
2023-04-20T21:57:50.954 WARN --- [-functhread5] hypercorn.error            : ASGI Framework Lifespan error, continuing without Lifespan support
2023-04-20T21:57:50.955 INFO --- [-functhread5] hypercorn.error            : Running on https://0.0.0.0:4566 (CTRL + C to quit)
2023-04-20T21:57:50.955 INFO --- [-functhread5] hypercorn.error            : Running on https://0.0.0.0:4566 (CTRL + C to quit)
Ready.
2023-04-20T21:57:52.267 INFO --- [   asgi_gw_0] localstack.request.aws     : AWS s3.CreateBucket => 200
{
    "Location": "http://my-bucket.s3.localhost.localstack.cloud:4566/"
}
```

With this, we started LocalStack and created a new S3 bucket.

Now, let's copy a sample file to the S3 bucket using the AWS CLI from our machine.

If you have not set up the AWS CLI, you can set it up using this [link](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html). Once you do that, run `aws configure` and provide any random value for secret-key and access-key.

aws s3 cp samplefile.txt s3://my-bucket \  
--endpoint-url http://localhost:4566

Here while using the AWS CLI, we specify the LocalStack URL so we interact with LocalStack rather than the actual AWS services.

If you’re looking for more articles to expand your knowledge in software development, here are three additional recommendations

- [**Deploy on Kubernetes with Helm, JIB, and Skaffold**](https://refactorfirst.com/deploy-application-on-kubernetes-with-skaffold-helm-jib)
- [**Fetch Secrets From AWS Secrets Manager In A Spring Boot Application**](https://refactorfirst.com/spring-boot-fetch-secrets-from-aws-secrets-manager)
- [**Kind — A New Kubernetes Cluster**](https://refactorfirst.com/kind-kubernetes-cluster)

I keep exploring topics related to Java, Spring, Kubernetes, and all about programming. You can follow me on [Twitter](https://twitter.com/amrutprabhu42) and also subscribe to my newsletter at [https://refactorfirst.com](https://refactorfirst.com/).

I keep exploring and learning new things. If you want to know the latest trends and improve your software development skills, then subscribe to my newsletter below and also follow me on [Twitter](https://twitter.com/amrutprabhu42).

Enjoy!!
