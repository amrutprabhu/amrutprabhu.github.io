---
layout: post
title: "Apache Airflow 2.0: A Practical Jump Start"
author: "Amrut Prabhu"
categories: ""
tags: [python, airflow, Java]
image: airflow/airflow-cover.jpg
photo-credits : https://unsplash.com/photos/BpEOwR57QEg
---
I have been mostly coding in Java all my life, and I stumbled upon Apache Airflow and I was keen to know more.

So in this article, I would like to give you a jump-start tutorial to understand the basic concepts and create a workflow pipeline from scratch.

So let's get started!

# Introduction

Apache Airflow is an orchestration tool that helps you to programmatically create and handle task execution into a single workflow. It then handles monitoring its progress and takes care of scheduling future workflows depending on the schedule defined.

Workflows are created using python scripts, which define how your tasks are executed. They are usually defined as Directed Acyclic Graphs(DAG).

![AirFlow DAG](/assets/img/airflow/dag.png)

The workflow execution is based on the schedule you provide, which is as per Unix cron schedule format. Once you create python scripts and place them in the dags folder of Airflow, Airflow will automatically create the workflow for you.

How difficult are the python scripts?

Well, not difficult but pretty straightforward. Let me explain this.
<br/>
<br/>
# Key Concepts

A workflow is made up of tasks and each task is an operator. Now, what is an operator? An operator a python class that does some work for you. These classes are provided by airflow itself. Some basic operators are

-   BashOperator - used to run bash commands.
-   PythonOperator - used to run a python function you define.
-   BranchOperator - used to create a branch in the workflow.
-   DummyOperator - used to represent a dummy task.

There are quite a few other operators which will help you to make an HTTP call, connect to a Postgres instance, connect to slack, etc. You can find more operators [here](https://airflow.apache.org/docs/apache-airflow/stable/python-api-ref.html#operators){:target="_blank"}.

Finally, with the theory done, Let’s do something exciting i.e. create our first Airflow DAG.
<br/>
<br/>
# Creating an Airflow DAG.

As an example, Let's create a workflow that does the following

1.  Check if the URL is available
2.  Fetches some data from an URL
3.  Extract certain fields from it.
4.  Print the extracted fields using the bash echo command.

![Example Airflow DAG](/assets/img/airflow/example_workflow.png)

Pretty simple workflow, But there are some useful concepts that I will explain as we go.

So let's start.
<br/>
<br/>
# Running Apache Airflow with Docker

The official Airflow site provides a [docker-compose file](https://airflow.apache.org/docs/apache-airflow/stable/start/docker.html#docker-compose-yaml){:target="_blank"} with all the components needed to run Airflow. Once you download the docker-compose file, You can start it using the docker-compose command.

```
docker-compose up -d
```

Once your containers are up and running, a`dags` folder is created on your local machine where you placed the docker-compose.yml file. We are going to use this `dags` folder to place our python workflows. You can access the Airflow web UI using the URL `localhost:8080`
<br/>
<br/>
# Creating your DAG Definition

First, we will create a skeleton of the workflow, i.e, in this case, is the DAG definition.
```python
from airflow.models import DAG

default_args = {
    'start_date': datetime(2020, 1, 1)
}
with DAG('user_processing',
         schedule_interval='@daily',
         default_args=default_args,
         catchup=False) as dag:
```

With this, you just created a new workflow, But without any tasks to be executed. The first parameter is the name of the DAG, followed by the schedule you want it to be triggered. Then you set some default arguments like `start_date`telling when actually the DAG can start to trigger.

Next, let's create our first task.

Now, to check if our URL is reachable, we are going to use a sensor operator. In this case, it's an `HttpSensor` operator.
```python
...
with DAG('user_content_processing',
         schedule_interval='@daily',
         default_args=default_args) as dag:

    is_api_available = HttpSensor(
        task_id='is_api_available',
        http_conn_id='user_api',
        endpoint='api/'
    )
```
To create the HttpSensor operator, We provide it with a task id, HTTP connection id, and endpoint. The task id identifies the task in the DAG, and the endpoint identifies the API to fetch. Now the third parameter i.e `http_conn_id` will require something to be explained.

Airflow provides a mechanism, with which you can create and store some configurations that you can use across workflows. One such type is configuring “Connections”. Here you can provide various connections like AWS connections, ElasticSearch connection, Kubernetes cluster connections, etc.

In our case, we would be using the HTTP connection option. Here we would provide the URL we want to trigger and setting the connection id to `user_api` .We want to call the URL [https://randomuser.me/api/](https://randomuser.me/api/){:target="_blank"}, which will return a JSON response of some random user information.

![Airflow Connection Creation](/assets/img/airflow/airflow-http-connection.png)

Finally, with this configured, the task is ready to make a call to the URL with the endpoint provided.

So with that, We just created our first task and learned some concepts.

![Airflow DAG task](/assets/img/airflow/airflow-first-dag-task.png)

Now, once the first task execution succeeds, we want to execute the task that will make the actual call to get the details of a user. For this, we are going to make use of an HttpOperator called `SimpleHttpOperator`.

```python
is_api_available = HttpSensor(
    ...
)

extracting_user = SimpleHttpOperator(
    task_id='extracting_user',
    http_conn_id='user_api',
    endpoint='api/',
    method='GET'
)
```
As you can see, we have the `task_id`to identify this task, the `http_conn_id` we spoke about before, the endpoint, and the method you want to execute.

That's it!

Now you must be wondering what happens to the response. For this let's look into another concept called Xcoms
<br/>
<br/>
# Xcoms

Xcoms is a way you can share data between your tasks. It basically stores key-value pairs of the information you want to store that can be accessed by other tasks in a DAG.

The SimpleHttpOperator stores the response inside these Xcoms. Hence we will use another task to retrieve the value and process it. You can read more about Xcoms [here](https://airflow.apache.org/docs/apache-airflow/stable/concepts.html?highlight=xcom#xcoms){:target="_blank"}

Once the data is fetched, We are going to create a processor, which will process the data that was pushed into Xcoms by the previous task. We will do this using a python function and hence the new operator that we are going to use is the `PythonOperator`.

```python
fetch_user = SimpleHttpOperator(
    ...
)

processing_user = PythonOperator(
    task_id='processing_user',
    python_callable=_processing_user
)
```

![DAG Tasks](/assets/img/airflow/airflow-dag-tasks.png)

The `PythonOperator` is a simple operator, that takes the `task_id` and a python callable function. Let’s look at the function.
```python
def _processing_user(ti):
    users_txt = ti.xcom_pull(task_ids=["extracting_user"])[0]              
    users = json.loads(users_txt)
    
    if not len(users) or 'results' not in users:
        raise ValueError("User is empty")
    user = users['results'][0]
    user_map = {
        'firstname': user['name']['first'],
        'lastname': user['name']['last']
    }
    processed_user = json_normalize(user_map)
    Variable.set("user", processed_user)
```
So this function receives a Task Instance (referred as `ti`). We use this task instance to get the information that our task `extracting_user` has pushed to Xcoms, using `xcom_pull` call. We then validate the input and extract some fields as a dictionary. Finally, we normalize the dictionary and add it to something called `Variables`. Let’s look at what are Variables.
<br/>
<br/>
# Variables

Variables are a way to store and extract some values that you would like to use across any DAG. It's basically a key-value store of arbitrary data. You can read more in detail about it [here](https://airflow.apache.org/docs/apache-airflow/stable/concepts.html?highlight=xcom#variables){:target="_blank"}.

Now that we have stored the values inside Variables, Let print them to the logs using the `echo` command. To do this we are going to use the `BashOperator`
```python
{% raw %}
processing_user = PythonOperator(
   ...
)
print_user = BashOperator(
    task_id='log_user',
    bash_command='echo "{{ var.value.user }}"'
)
{% endraw %}
```

In this, I will explain to you another important concept called Templating.
<br/>
<br/>
# Templating

Airflow uses [Jinja Templating](https://jinja.palletsprojects.com/){:target="_blank"}. As you have seen in the code above, I have used curly braces which allow me to materialize some values. In this case, I have extracted the `user` key from Variables (using `var` ) which I had stored using the previous task.

Now how would you know if the particular operator supports templating? For this, you can search for “template_fields” in the API reference of the operator, Which will tell you which fields support templating. e.g You can have a look at the HttpSensor operator reference [here](https://airflow.apache.org/docs/apache-airflow-providers-http/stable/_api/airflow/providers/http/sensors/http/index.html){:target="_blank"}.
<br/>
<br/>
# Ordering Your Tasks

Now, With all of this, we have created all the tasks instances. But we still have to order the tasks. To do this, we make use of the `<<` operator. You define it as
```python
Task 1 << Task 2
```

This means Task 1 will run before Task 2. In our case, we will order this as
```python
is_api_available >> fetch_user >> processing_user >> print_user
```

And there we go. We just created a simple Airflow DAG workflow from scratch covering some of the important concepts of Airflow. Now, enable the DAG and hit run. It will start executing.

![Apache Airflow Successful Execution](/assets/img/airflow/airflow-dag-successful-run.png)


As usual, I have uploaded the code on [GitHub](https://github.com/amrutprabhu/airflow-workouts/blob/master/dags/user_data_processing.py){:target="_blank"}. :)

Enjoy!!