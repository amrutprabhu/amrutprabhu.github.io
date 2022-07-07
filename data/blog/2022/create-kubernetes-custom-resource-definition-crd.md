---
title: 'Part 1: How to Create a Kubernetes Custom Resource Definition (CRD)'
author: 'Amrut Prabhu'
categories: ''
tags: [Kubernetes, yaml, Docker]
photo-credits:
applaud-link: 2021/spring-boot-stream-kafka.json
date: '2022-07-07'
draft: false
summary: ' In this article, we understand how Kubernetes handles its resources and create our own Kubernetes Custom Resource Definition (CRD)'
imageUrl: /static/images/2022/create-kubernetes-custom-resource-defintion-crd/cover.jpg
actualUrl: 'auto-generated'
customUrl: 'auto-generated'
---

This is a multi-part article on how you can create a Kubernetes Custom Resource Definition (CRD) and then create a Kubernetes controller to handle CRD instance creation requests. In this article, we would be exploring how we can create your own Kubernetes CRD.

## Understanding How Kubernetes Works with Resources

Before we move on to creating our first CRD and controller, we have to understand some concepts behind how Kubernetes resource management works.

Let’s look at the diagram

![Kubernetes working](/static/images/2022/create-kubernetes-custom-resource-defintion-crd/kubernetes-working.png)

As you see in the diagram, we have an API server, scheduler, controller, and database. When we use the command `kubectl` to create a resource, we are actually talking to the API server and the API server merely stores the resource in the database. Now, we have a scheduler, which keeps on asking the API server if there are some resources created.

Once the scheduler finds that a pod has to be created, it then inserts into the database via the API server the reference of the node where the pod will be created.

Next, Kubelets running on the various worker nodes start calling the API server and check if any pods have to be created on that particular node. Kubelets are nothing but controllers themselves.

So in this article, we will see how you can create your own Kubernetes CRD, and then create an instance of the CRD.

## Pre-requisites

- A working Kubernetes cluster. (local or remote)  
  If you don't have one, you can always run a [K3s](https://k3s.io/) cluster locally or you can use a Kind Kubernetes cluster. You can read about starting a Kind Kubernetes cluster [here](https://refactorfirst.com/kind-kubernetes-cluster).
- Basic knowledge of working with “Kubectl” commands to create, get or delete a resource.

## Creating a Kubernetes Custom Resource Definition (CRD)

Let's create a simple Kubernetes Custom Resource Definition and view its various parts.

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: my-crds.com.amrut.prabhu
spec:
  group: com.amrut.prabhu
  names:
    kind: my-crd
    plural: my-crds
  scope: Namespaced
  versions:
    - name: v1
      served: true
      storage: true
      schema:
        openAPIV3Schema:
          type: object
          properties:
            apiVersion:
              type: string
            kind:
              type: string
            metadata:
              type: object
            spec:
              type: object
              properties:
                my-own-property:
                  type: string
```

This is the most minimalistic definition to create your own Kubernetes CRD.

To understand this, Let’s break it up into two parts.

**Part 1**: Define the metadata and definition of the CRD

**Part 2**: Define the schema of the CRD instances that we will create later.

## Understanding The Kubernetes Custom Resource Definition Format

Let's Look at Part 1.

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: my-crds.com.amrut.prabhu
spec:
  group: com.amrut.prabhu
  names:
    kind: my-crd
    plural: my-crds
  scope: Namespaced
  versions:
    - name: v1
      served: true
      storage: true
```

Here we define the “Kind” of our resource, i.e we want to create a CRD and we provide it a name. The name has to be of the format `<CRD plural Name>.<Group name>` , ie. “`my-crds` `.` `com.amrut.prabhu` ”. Next, in the `spec` section, we define the name and the plural name of the kind we are creating. This is the type we will specify while creating a new instance later.

Next, we define that the CRD will be scoped to a namespace and in the version section, we specify the version of this CRD to `v1`. When we want to create a new version of this definition, we will just bump up this version number.

Lastly, we have `served` property that defines if this CRD is enabled to be used in the cluster and `storage` refers to if this version of the CRD will be stored. At a time you can have only one version of the CRD that can be stored.

This was all about defining our CRD. Let’s look at the schema of the CRD.

### Understanding CRD Schema

```yaml
schema:
  openAPIV3Schema:
    type: object
    properties:
      apiVersion:
        type: string
      kind:
        type: string
      metadata:
        type: object
      spec:
        properties:
          my-own-property:
            type: string
        type: object
```

In this, we define the schema using the Open API version 3 standards. We specify the top level as an object which has some properties.

Now, some of the absolutely required properties are:

- `apiVersion`: To define the version of the CRD we will be using.
- `kind`: The type of the CRD
- `metadata`: The metadata which will be added such as the name, annotations, etc. This will be of the type Object.
- `spec`: This defines the custom specifications properties you want to provide.

Now, in the above schema, I have specified only one property i.e `my-own-property` in the spec section. You can also define a property of type object having its own properties.

Let's look at how the CRD is mapped to our CRD instance.

![CRD to CRD instance Mapping](/static/images/2022/create-kubernetes-custom-resource-defintion-crd/crd-to-instance-map.jpg)

As you can see above, the arrows make it simple to understand which property from the CRD maps to the CRD instance. This is how our custom resource definition is mapped to the actual instance YAML file.

With this, let's first apply our CRD to the Kubernetes cluster.

## Adding Kubernetes CRD to the Kubernetes Cluster

In order to use our CRD, We will have to add it to our Kubernetes Cluster. Let’s install this using the following command

```shell
kubectl apply -f my-crd.yaml
```

![CRD apply](/static/images/2022/create-kubernetes-custom-resource-defintion-crd/crd-apply.png)

Now, after creating the CRD, we are going to create our first CRD instance. We will use the same instance YAML file from above.

```yaml
apiVersion: com.amrut.prabhu/v1
kind: my-crd
metadata:
  name: my-custom-resource-instance
spec:
  my-own-property: 'My first CRD instance'
```

![CRD Instance Apply](/static/images/2022/create-kubernetes-custom-resource-defintion-crd/crd-instance-apply.png)

With this, we just created our first Kubernetes CRD and then created our first CRD instance.

After creating the instance nothing really happened. Only the instance object was created and stored in the Kubernetes database.

But we want it to do something when we create an instance.

For this, we will need to implement a controller that will handle creating instance requests and do something with it. We will explore this in our next article.

You can find CRD yaml files on GitHub [here](https://github.com/amrutprabhu/kubernetes-custom-resource/tree/main/crd).

So, subscribe to my newsletter below and follow me on [Twitter](https://twitter.com/amrutprabhu42) to know when the article is published.

Enjoy!!
