---
layout: post
title: "What are Java Records"
author: "Amrut Prabhu"
categories: ""
tags: [Spring Boot,Java]
image: java-records/java-records-title.jpg
photo-credits: https://unsplash.com/photos/3vXOHr_fMi8
applaud-link: java-16-records.json
---

```

```


```java
public class Data {

    final private int x;
    final private int y;
    public Data( int x, int y){
        if (x >y) {
            throw new IllegalArgumentException();
        }
        x+=100;
        y+=100;
        this.x = x;
        this.y = y;
    }
}
```