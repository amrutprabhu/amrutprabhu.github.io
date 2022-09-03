---
title: 'How To Inspect Docker Image layers'
author: 'Amrut Prabhu'
categories: ''
tags: [Docker, Tools, Quick Article]
photo-credits:
applaud-link: 2021/spring-boot-stream-kafka.json
date: '2022-09-08'
draft: false
summary: ' Quick article about how you can inspect docker image layers'
imageUrl: /static/images/2022/inspect-docker-image-layers/cover.jpg
actualUrl: 'auto-generated'
customUrl: 'auto-generated'
---

We might be in a situation, wherein we would like to inspect what each layer in a docker image adds to the entire image itself.

For this we an open source tool called [dive](https://github.com/wagoodman/dive).

Using this tool we can inspect the various layers in a docker image.

You don't even need to install the utility but run the docker image provided as follows

```shell
docker run --rm -it \
-v /var/run/docker.sock:/var/run/docker.sock \
wagoodman/dive:latest \
<name of docker image>:<docker image tag>
```

e.g

```shell
docker run --rm -it \
-v /var/run/docker.sock:/var/run/docker.sock \
wagoodman/dive:latest \
ghcr.io/amrutprabhu/remote-application:1.0.0-snapshot
```

This is a sample docker image I have pushed to my GitHub repo that you can try out.

![dive tool demo](/static/images/2022/inspect-docker-image-layers/dive-tool.gif)

I keep exploring and learning new things. If you want to know the latest trends and improve your software development skills, then subscribe to my newsletter below and also follow me on [Twitter](https://twitter.com/amrutprabhu42).

Enjoy!!
