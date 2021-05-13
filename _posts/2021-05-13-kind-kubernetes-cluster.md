---
layout: post
title: "Kind - A New Kubernetes Cluster"
author: "Amrut Prabhu"
categories: ""
tags: [kubernetes, Java]
image: kind/kind-kubernetes.png
photo-credits: 
applaud-link: kind-kubernetes-cluster.json
---
Recently I wanted to experiment with something on a Kubernetes cluster, and I didn't want to spin up a new cluster on AWS and wanted something quick.

Till now, Minikube was the only thing I was using as a local Kubernetes cluster. But I start noticing performance degradation on my system as soon as I started using Minikube.

I came across another local Kubernetes cluster called [Kind](https://kind.sigs.k8s.io/) and I want to share my learnings about it.
<br/>
<br/>
## Introduction

[Kind](https://kind.sigs.k8s.io/) is a command-line tool that helps you to create a local Kubernetes cluster. It creates a cluster using docker images and it mimics a Kubernetes cluster on your local system.
<br/>
<br/>
## Minikube vs Kind.

The latest version of Minikube uses docker images to create the cluster, But it requires at least 1.8 GB of memory to start. With Kind, I could start the cluster with just 1 GB and could deploy a simple pod that hardly consumed 200 MB of memory.

![Kubernetes Single node cluster](/assets/img/kind/single-node.png)
<br/>
<br/>
## Creating a cluster

To create a cluster just run the following command

```commandline
Kind create cluster
```
![Kind create cluster](/assets/img/kind/kind-create-cluster.png)
This will create a single-node Kubernetes cluster on your system by spinning up a docker container. By default, it creates a cluster with the name `Kind`. But you can specify a custom name by specifying --name flag

```
kind create cluster --name kind-cluster-2
```
You can also spin up multiple clusters using kind. You just need to specify a different name while creating the cluster.
<br/>
<br/>
## Creating Pod with Custom Docker Images.

In order to load a custom image you created on your machine, You don’t need to push the image to any repository. Rather just use the following command to load your custom image in the cluster.

```
Kind load docker-image <custom-image>:<tag>
```

Once it’s loaded, You can then reference the image directly in your Kubernetes deployment configuration file or you could also deploy a helm chart containing the custom image without the need to specify any image repository.

![Loading Custom Docker Image](/assets/img/kind/custom-docker-image.png)
<br/>
<br/>
## Multi-Node Cluster

This feature was fascinating to me, If you want to create a multi-node cluster, you can provide config to create it.
```
Kind create cluster --config config.yml
```  

Let’s have a look at the config.

```yml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
    - role: control-plane
    - role: worker
    - role: worker
```
I have asked it to create a cluster with a control plane and two worker nodes in this config.

Now, you can further customize this to map node ports to your host port. This would be helpful in a situation wherein say you have `NodePort` service, and you want to access it directly from your local system.


  ```yml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
  - role: worker
    extraPortMappings:
    - containerPort: 80
      hostPort: 8080
```
<br/>
## Custom Worker Node images.

Since Kind works with docker images, You can specify a custom docker image that you would like to run. Currently, it uses the docker images provided by kind. This means you can provide a specific version of Kubernetes that you would like to run, just by changing the image tag. You can find all the Kind images here ([kindest/node](https://hub.docker.com/r/kindest/node)).
```yml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
  - role: worker
    image: kindest/node:v1.16.4
```
<br/>
## Auto Completion  
Kind also provides functions that will allow your terminal to autocomplete your commands. This depends on the shell you use. Currently, it supports functions for Bash, ZSH (also oh-myzsh), and Fish shell. You can get these functions by using the following command.
```
kind completion zsh
```
![Kind AutoComplete](/assets/img/kind/kind-auto-complete.png)
<br/>
If you want to know more on how to configure auto-completion with ZSH you can refer to the repo documentation [here](https://github.com/zsh-users/zsh-completions) 
<br/>
<br/>
## Conclusion

After exploring Kind, I found it pretty simple and straightforward. The major benefit I found is that I can customize the cluster’s configuration the way I want and I don’t have to worry about performance degrade compared to Minikube.

<br/>