# Deploy node.js app to kubernetes using helm 
>Note: This repo is just for my  Technical Challenge task for orderbird company

## Introduction:

Simple HelloWorld app deployed on a kubernetes cluster using helm

* 'helloworld-nodejs-app' contains the 'server.js' code that prints out Hello World. It also prints the URI details. Can be tested standlone with 'node server.js' assuming node.js is installed. 

* 'helloworld-nodejs-app' contains 'Dockerfile' that dockerizes this little node.js app. 




## Prerequisite
You must install and configure the following tools before moving forward

* Install node.js

* Install docker, kubectl, helm.


### code

The code used here is available on GitHub repo.

`https://github.com/shokoofa/orderbird-ChallengeTask.git`


## Configuration:

### Create Node.js App

* Create server.js file that is using js to create a simple web server listening on port 8080 


````````````````
// importing express framework
    const express = require("express");

    const app = express();

    // Respond with "hello world" for requests that hit our root "/"
    app.get("/", function (req, res) {
     return res.send("Hello World");
    });

    // listen to port 8080 by default
    app.listen(process.env.PORT || 8080, () => {
      console.log("Server is running");
    });
````````````````
* For test it localy just run the below command

`$ node server.js`

Then in another terminal run:

`$ curl http://localhost/hello`

Received request from URL : /hello

`Hello World!`

and if

`$ curl http://localhost/testurl`

Received request from URL : /testurl

`Hello World!`


### Create Docker Image

Here we will create a docker file for our application. 

* First Create Dockerfile as bellow:

````
FROM node:alpine
RUN apt-get update
RUN apt-get -y install curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_11.x  | bash -
RUN apt-get -y install apt-utils
RUN apt-get -y install nodejs
WORKDIR /usr/src/app
COPY server.js ./
EXPOSE 8080
CMD [ "node", "server.js" ]
````

* Then Creat build image from created Docker file:

`docker build -t <your username>/<appname>`

This command will create a docker image that we will push to docker hub and later will use in helm chart to deploy the application to the kubernetes cluster.

I am using docker repository to push my images. If you don’t have an account please create one before proceeding or you can also use same image as it is public.

````
$ docker login \\To login into dockerhub

$ docker push  <your username>/<appname> \\For push image to your repo
````



### Install helm chart

1. helm-chart/helloworld' contains all the template yamls for deploying the Hello World node.js app in kubernetes.
1. Modify values.yaml to suit your needs.
1. helm install --name helloworld . --namespace hello

### First creat helm chart

`helm create helm-chart`

This will create a basic structure for helm, we need to edit a few files to make our app running.


### Second Update image to be used in values.yaml

````
...
image:
   repository: <your username>/<appname>
   tag: latest
replicaCount:3 
````

Again in values.yaml we will update the service port configuration

````
...
service:
type: NodePort
exposePort: 30000 // expose to node 
targetPort: 8080 // App server listening on this port
internalPort: 3000 // Internal exposed within the pod
...
````

>Note: I am using NodePort to test running application on node.

We will use the above port configuration in service.yaml file

````
...
spec:
type: {{ .Values.service.type }}
ports:
- nodePort: {{ .Values.service.exposePort }}
port: {{ .Values.service.internalPort }}
targetPort: {{ .Values.service.targetPort }}
...
````

Now everything is ready. :facepunch:

Deploy app to cluster:

`helm install --name <appname> helm-chart/`

To test via browser, get url of the application using below commands:

* To get service name:

`$ kubectl service list`

* To get access url for your application

`kubectl service <service-name> --url`


## CI/CD Pipeline for a node.js app with Github Actions

First of all, let’s clone the repository and navigate to it:

````
git clone https://github.com/shokoofa/orderbird-ChallengeTask.git
cd orderbird-ChallengeTask
````


Then run below commands to create package.json file and add the required dependencies and other content and then run following command to install the dependencies. Here are some descriptions of the packages that we use.

````
npm init // fill the required things CLI asked
npm i express
npm i mocha supertest --save-dev
````

* **express:** Node framework
* **mocha:** Test framework for NodeJS ( You can choose another testing framework if you wish like Jasmin, Jest, Tape, etc.)
* **supertest:** Provide a high-level abstraction for testing HTTP npm install

Now, we can use the previous server.js file for show **Hello Word** text:

````
// importing express framework
    const express = require("express");

    const app = express();

    // Respond with "hello world" for requests that hit our root "/"
    app.get("/", function (req, res) {
     return res.send("Hello World");
    });

    // listen to port 8080 by default
    app.listen(process.env.PORT || 8080, () => {
      console.log("Server is running");
    });

    module.exports = app;
````

Now you can run the above code using the below command. Then visit http://localhost:8080 to see the “Hello World” output.

`node server.js`

## Write Test Cases

Now we are going to write the test case to test our “/” endpoint response equals to “Hello World”. to do that, let’s create a folder called /test/ and create a file called test.js inside that. Now let’s write the test code as bellow:

````
 const request = require("supertest");
    const app = require("../index");

    describe("GET /", () => {
      it("respond with Hello World by GitHub Actions", (done) => {
        request(app).get("/").expect("Hello World via GitHub Actions", done);
      })
    }); 
````

To run tests add below content to your **package.json** file.

````
"scripts": {
    "test": "mocha ./test/* --exit"
}
````
now just run below command to run test cases you wrote to see whether it gets passed or not.

`npm test`

Now we can push our changes to Github repository we created. 

````
git add .
git commit -m "node app with test cases"
git push origin master
````


## Create CI/CD

Now we can create our Github Actions CI/CD Pipeline. Just go to the repository and click Actions tab.

Click the Node.js setup the workflow button. and it will open up a text editor. paste the following yml file content.


````
name: Node.js CI
on:
  push:
    branches:
      - master

jobs:
  build:

    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [10.x, 12.x, 14.x, 15.x]

    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm run build --if-present
      - run: npm test
  test:

    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [10.x, 12.x, 14.x, 15.x]

    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v1
      with:
        node-version: ${{ matrix.node-version }}
    - name: npm install and test
      run: |
        npm install
        npm test
      env:
        CI: true

  deploy:
    needs: [test]
    runs-on: ubuntu-latest

    steps:
    - name: SSH and deploy node app
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SSH_HOST }}
        username: ${{ secrets.SSH_USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        port: ${{ secrets.SSH_PORT }}
        script: |
          cd ~/node-github-demo
          git pull origin master
          npm install --production
          pm2 restart node-app
````
I will explain the above YAML content.

Line 265: name set the workflow name.
Line 266–269: on will check which git event we need to run the jobs. here we have set when something gets pushed to master branch, run following jobs(in this case those are test and deploy).
Line 271–308: here in the jobs we have created a job called test. by setting runs-on we can set the runner. in this case, we have set it to ubuntu-latest. we can use Windows, Mac as well if we want. by setting astrategy we can set a build matrix. it uses to run the this test job under different node versions at this moment. under setps we can set the different tasks we need to run on specific job(in this case test job).

`uses: actions/checkout@v2`

By setting uses we can run different actions. above case, we check out a copy of the repository. in the next line, we have set a name for this task. in the next line, we have used the following setup-node action with v1 git tag. also, we have passed an input parameter for the actions called node-version. in this case for matrix builds we have to set that version dynamically.

````
uses: actions/setup-node@v1
    with:
      node-version: ${{ matrix.node-version }}
````


Also in the next line, we have set the name for that task as well. after that by setting run we ran multiple commands on the Operating system shell. in this case, it is, Ubuntu. by setting env we have the the CI env variable to true(we can set any other environment variables when we want).
Line 310–326: we have created another job called deploy. in that case, also we have used same syntax as above. only new thing that we used is, needs. it uses to say if only specific job or jobs passed, then only run this job. in our case deploy job only runs when the test job gets passed.
in this case we have used another Github action called appleboy/ssh-action@master. it needs few input parameters, we have set that. (in this case, those are SSH host, key, username, port and the script which needs to run on the server after connecting to it via SSH).

Then click start commit and commit the changes. Now it will run the script. to see the changes. let’s do a change in the source code and push it into the master.




## FAQ

Contact me with any question by: [Email](shokoofa.hosseini@gmail.com) , [GitHub](https://github.com/shokoofa)

