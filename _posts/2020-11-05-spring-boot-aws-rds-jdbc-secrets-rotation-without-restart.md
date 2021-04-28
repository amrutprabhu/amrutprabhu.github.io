---
layout: post
title: "Spring Boot: Handle AWS RDS JDBC password change or rotation without restarting"
author: "Amrut Prabhu"
categories: [spring-boot, java, AWS]
tags: [AWS,RDS,Secrets manager,Spring Boot,Java]
image: 2020-11-05/aws-secrets-rotation.jpg
---

This article is about how you can handle AWS RDS secrets rotation without restarting your Spring Boot application.

# Introduction
I had this problem wherein I had to update my database connection whenever the database password was updated for my AWS RDS instance. This can be because of a monthly password rotation policy or may be the database credentials got compromised and you want all your running applications to keep running even when the database password are changed.

To solve this kind of a problem, AWS provides a library that will handle this updating of the database connection without even restarting your Spring Boot application.

AWS has an open source library called  [AWS Secrets Manager JDBC](https://github.com/aws/aws-secretsmanager-jdbc), that handles database connection while your application is running and talking to the RDS instance.

Let’s see how this works.
<br/>
<br/>
# Solution
Firstly, Add the following dependency in the build file. Considering maven, it would be as follows
```xml
<dependency>
    <groupId>com.amazonaws.secretsmanager</groupId>
    <artifactId>aws-secretsmanager-jdbc</artifactId>
    <version>1.0.5</version>
</dependency>
```
Next, specify the JDBC datasource URL with the scheme  `jdbc-secretsmanager`  instead of  `jdbc`
```properties
spring:
  datasource:
    url: jdbc-secretsmanager:mysql://database-host:3306/rotate_db
```

Next, You need to specify the driver class name. For this article we will stick to MySQL RDS instance. So it’s going to be  `com.amazonaws.secretsmanager.sql.AWSSecretsManagerMySQLDrive`.

This library also requires the database-specific connection library. So you will need to add the MySQL connector library, Which is commonly the artifact  `mysql-connector-java`. This will be used to make the actual connection with the database.

In case you are dealing with other databases, you can find the corresponding drivers from the source code  [here](https://github.com/aws/aws-secretsmanager-jdbc/tree/master/src/main/java/com/amazonaws/secretsmanager/sql).

Next, Create an AWS secret for the RDS instance using the database credentials section in the AWS Secrets Manager.

![AWS secrets manager secret for RDS](/assets/img/2020-11-05/aws-secrets.jpg) 

Next, In the properties file  `application.yaml`, specify the secret name you just created as the username and you don’t have to specify any password as it’s now stored in the secrets manager.

Your property file should look something like this.
```properties
spring:
  datasource:
    url: jdbc-secretsmanager:mysql://database-host:3306/rotate_db
    username: secret/rotation
    driver-class-name: com.amazonaws.secretsmanager.sql.AWSSecretsManagerMySQLDriver
```

Now, For the application to communicate with AWS and fetch the secret value, you would have to have AWS CLI setup and configured.  [Here](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html)  is the link to it.

Once you have this in place, your application can connect to AWS by exporting the environment variable  `AWS_PROFILE`  with the profile you setup while configuring the AWS configuration.

With this, you are done with the changes.

Now start the application and it should be able to communicate with AWS Secrets Manager to fetch the credentials and start communicating with the AWS RDS instance.

You can test this by clicking on the rotate secret option in the secret which will generate a new password for database and check the communication with the database.

Here is a  [GitHub link](https://github.com/amrutprabhu/spring-boot-aws-rds-password-rotation)  to my implementation.
<br/>
<br/>
## Supports Liquibase Integration

This also works if you have liquibase integration in place . You just have to specify the same URL in the liquibase configuration and the database secret as the username and the liquibase setup will work for you.

```properties
spring:
  datasource:
    url: jdbc-secretsmanager:mysql://database-host:3306/rotate_db
    username: secret/rotation
    driver-class-name: com.amazonaws.secretsmanager.sql.AWSSecretsManagerMySQLDriver

  liquibase:
    url: jdbc-secretsmanager:mysql://database-host:3306/rotate_db
    user: secret/rotation
```
Enjoy and have fun!