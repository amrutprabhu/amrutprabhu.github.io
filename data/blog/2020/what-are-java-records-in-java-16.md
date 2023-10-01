---
title: 'What are Java Records'
author: 'Amrut Prabhu'
categories: ''
tags: [Spring Boot, Java]
image: java-records/java-records-title.jpg
photo-credits: https://unsplash.com/photos/3vXOHr_fMi8
applaud-link: java-16-records.json
date: '2021-05-27'
draft: false
summary: 'Here we look into What are Java Record and its uses'
imageUrl: /static/images/2021/java-records/java-records-title.jpg
actualUrl: 'auto-generated'
customUrl: 'auto-generated'
---

# Java Record

Java record is a type of class whose sole purpose is to drive programming with immutable data. Let’s look at a simple example.

```java
public record Data( int x, int y)
```

So here we have created a record with header x and y. Here x and y are referred to as components of a record.

Now, When we create a record, we get the following:-

- You get final fields based on the record components.
- You get a canonical constructor. (constructor based on the record components)
- You get an accessor method that is the same as the field’s name, an `equals` method, and a `hashcode` method out of the box already implemented for you.
- You get a `toString` method implementation that prints the record components along with the component names.

So an equivalent class would be like this:

<AdsFlows id="adflow1" slot="8168941152" />

```java
public class Data {

    final private int x;
    final private int y;
    public Data( int x, int y){
        this.x = x;
        this.y = y;
    }

    public boolean equals(Object o) {
        ...
    }

    public int hashCode() {
       ...
    }

    public String toString() {
        ...
    }
}
```

Let’s dig in further about records.

# Initialization of records

When we declare a normal class without any constructor the compiler provides a default constructor with no arguments. In the case of records, an implicit canonical constructor based on the record components is provided.

You can explicitly create a canonical constructor by yourself and do things like e.g validations but there is a more concise way to do that. Let’s have a look.

```java
public record Data(int x, int y) {

    public Data {
        if (x >y) {
            throw new IllegalArgumentException();
        }
        x+=100;
        y+=100;
    }
}
```

Here in the above record, I have performed a simple validation, and once it passes I further add 100 to each. This way of defining a compact constructor means I am still working with header variables and the actual assignment to the instance variables happens at the end. The above code would be equivalent to the following :

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

<AdsFlows id="adflow2" slot="2393870295" />

# Record classes cannot be extended nor support extension.

Record classes do not support extensions. You cannot extend it with any other class, not even a record class. The only implicit superclass it has is `java.lang.Record`. Defining this explicitly using extends will lead to compilation errors.

Also, record classes are implicitly final. They cannot be declared abstract to allow further extensions. This means you cannot have any sub-records of a record.

# Implementing Interfaces

Record classes allow you to implement interfaces. You can implement any interface you want whether it’s a single interface or multiple interfaces.

```java
public record Data( int x, int y) implements Runnable, Serializable
```

# Cannot define your own instance variables

When you define the header, it represents the state of your record class. This means you cannot have any other instance variable inside the record. the only instance variable that would be created is the one provided in the header component.

However, you can have static variables inside records that can be accessed the same as classes by using the record class name.

# Defining your own methods

You can define your own methods that you would want to use inside a record. Even your own version of the accessor, equals, or even hashcode methods. But make sure you do not make changes that would result in breaking what immutability means.

You can define static methods and static initializers also. These are the same as how we have them in our class declarations.

# Applying annotations.

Now, Something important about applying annotations. When defining the annotations, We can apply them to the record components. Now depending on the target scope of the annotation, The annotation will apply to those scopes. Let’s look at the different cases.

- If the annotation is targeted to fields, then it’s applied to the private instance variable.
- In the case of the target is a method, It would be applied to the accessor method.
- If the annotation refers to the header arguments, then they would refer to the parameters of the canonical constructor arguments.

E.g if you apply a `@NotNull`annotation which actually applies to the field, method, and constructor then it would get applied to the instance variable, the accessor method, and the constructor also.

Now take the case where you explicitly define an annotation on your custom-defined accessor method or canonical constructor, then the annotations on these would only be applied to the corresponding method or constructor.

<AdsFlows id="adflow3" slot="1404222257" />

## Local records

I see records have a very useful place when we just want to temporarily hold immutable data inside a function.

Let me explain this with an example.

```java
public List<Person> sortPeopleByAge(List<Person> people) {

    record Data(Person person, int age){};

    return people.stream()
            .map(person -> new Data(person, computeAge(person)))
            .sorted((d1, d2) -> Double._compare_(d2.age(), d1.age()))
            .map(Data::person)
            .collect(_toList_());
}
```

Here I created a local record class without any ceremony that you would require while creating a class. I use it to store the intermediate result and then use it for comparing. Such things would help you to have more concise and readable code.

With this, we reached the end of this article about records in Java 16.

Feel free to share the article and join me on [Twitter](https://twitter.com/amrutprabhu42). You can also subscribe to my newsletter on [RefactorFirst.com](https://refactorfirst.com/)
