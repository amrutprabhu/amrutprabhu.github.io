---
title: 'What Are Virtual Threads In Java'
author: 'Amrut Prabhu'
categories: ''
tags: [Java, JDK19, Virtual Threads, Multithreading]
photo-credits: https://unsplash.com/photos/NLgqFA9Lg_E
applaud-link: 2021/spring-boot-stream-kafka.json
date: '2022-12-15'
draft: false
summary: 'We will look into the concepts of Virtual threads that are provided as a preview feature in JDK 19'
imageUrl: /static/images/2022/what-are-virtual-threads/cover.jpg
actualUrl: 'auto-generated'
customUrl: 'auto-generated'
---

## Introduction

Traditionally, performing multiple tasks at the same time was carried out by creating threads using `new Thread()` or by using an executor service. These threads are called platform threads.

Platform threads would basically be wrappers around the kernel threads and are usually expensive to create. That is the reason, we create thread pools to avoid this expensive operation of creating threads.

When a piece of code is running in a thread, the kernel thread is captured during the entire execution of the thread. If another thread wants to execute its code, it needs to capture a kernel thread to do its execution.

This means, if you have more platform threads concurrently running than kernel threads, the performance would degrade as the threads will compete for the kernel-level threads and a lot of the time would be spent either waiting or for thread context switching.

Hence for optimal performance, the number of concurrently running threads should be limited to the number of kernel-level threads. These platform-level threads are scheduled by the OS scheduler and scheduling depends on the underlying OS.

Let’s look at what Virtual threads bring into the Java ecosystem.

## What are Virtual Threads?

Virtual threads are lightweight threads that are not the same as platform threads. They are not expensive to create and must not be pooled. You can create as many threads as you want but avoid reusing them.

You can compare Virtual threads as Java’s equivalent to Goroutines in Golang. You can start using them by using the `--enable-preview` flag during compilation and running an application.

Virtual threads help to improve throughput when you have a large number of tasks that are not CPU bound. I/O-intensive tasks are the primary ones that benefit from Virtual Threads. These tasks include things such as reading from Queues, Waiting for incoming web requests, Database queries, etc.

## How Virtual Threads Work

Virtual threads do not work directly on a kernel thread but rather are scheduled by the JVM using a scheduler on platform-level threads. This means Virtual threads share the platform-level threads with each other during the execution of the code.

For scheduling these threads, the JDK provides a work-stealing `ForkJoinPool` scheduler that will schedule the Virtual threads on the platform threads in a FIFO manner.

By default, the number of platform-level threads available to the scheduler is equal to the number of kernel-level threads. This can be changed with the system property `jdk.virtualThreadScheduler.maxPoolSize` .

![](https://cdn-images-1.medium.com/max/800/1*oMYpe3FHsbNSs0IDDFQVlw.png)

Let's look at some of the concepts related to Virtual threads.

## Virtual Threads vs Platform Threads

Virtual threads are daemon threads by default and **cannot** be changed by setting `Thread.setDaemon(false)` . They always have a fixed priority and are set to normal priority. As of now, setting the `Thread.setPriority(int)` has no effect but might change in later versions of JDK.

Virtual threads do not support the `stop()`, `suspend()`, or `resume()` methods and would throw an exception if invoked.

JDK 19 provides a new executor service `Executor.newVirtualThreadPerTaskExecutor()` that creates Virtual threads for every submitted task. Alternatively, you can start a Virtual thread using `Thread.startVirtualThread(Runnable)`. You can use `Thread.isVirtual()` to find out whether a thread is a Virtual thread or not.

Now, there is one important concept when it comes to Virtual threads being attached to a platform thread. A Virtual thread can be pinned to a platform-level thread when it executes code inside a `synchronized` block or method.

In these cases, if the Virtual thread would be doing some blocking operation, then it would block the platform level thread, thus eventually blocking the kernel thread also. Hence it would be better to use locks over synchronized blocks or methods in such cases. To compensate for this, the number of platform-level threads may increase temporarily in the `ForkJoinPool` Scheduler.

Finally, in terms of memory allocation, Virtual threads are stored on the heap as stack chunks. They can grow or shrink as the application progresses.

When it comes to garbage collections, Virtual threads are not [GC roots](https://www.baeldung.com/java-gc-roots). This means if a Virtual thread is doing a blocking operation and no other thread has a reference to it, then the Virtual thread could be garbage collected.

## Conclusion

We just saw some of the concepts of Virtual threads and how they can be useful in increasing the throughput of non-CPU bound tasks. Virtual threads are cheap to create and we don't need to pool them.

We can expect more changes coming up for Virtual threads in the upcoming JDK releases.
I keep exploring and learning new things. If you want to know the latest trends and improve your software development skills, then subscribe to my newsletter below and also follow me on [Twitter](https://twitter.com/amrutprabhu42).

Enjoy!!
