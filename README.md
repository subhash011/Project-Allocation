# Project-Allocation Portal

Project Allocation Web Application for University using MEAN Stack. Projects can be floated by teachers and the students can give their preferences for these projects. In turn teachers also give their preference of students. The final allocation is done using the Gale-Shapley algorithm of stable marriages.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Pre-requisites

What things you need to install the software and how to install them

- [Angular CLI](https://github.com/angular/angular-cli) version 8.3.25.
- [Node.js](https://github.com/nodejs) version 12.x
- [Angular Material](https://github.com/angular/components)
- [MongoDB](https://github.com/mongodb/mongo) version 4.2
- MongoDB Compass (optional)

### Installation

Install the following step by step in order to get a development environment up and running.

#### 1. Node.js

##### Windows

Visit the nodejs website here ([Install Node](https://nodejs.org/en/download/)) and choose the windows installer option with the appropriate architecture of your computer.

##### Linux

Refresh your local package index by typing :

```
$ sudo apt update
```

Adding the PPA of Node Source Repository :

```
$ curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
```

Installing Node js. This will also install **npm** long with node so there is no need to download npm separately.

```
$ sudo apt-get install nodejs
```

After installation verify and check the installed verison :

```
$ node -v
```

Also check the npm version :

```
$ npm -v
```

For more reference - [installation instructions](https://tecadmin.net/install-latest-nodejs-npm-on-ubuntu/)

#### 2. Angular CLI

##### Windows

Execute the following command on the command line :

```
npm install -g @angular/cli
```

##### Linux

Execute the following command on the command line :

```
$ sudo npm install -g @angular/cli
```

#### 3. MongoDB & MongoDB Compass

##### Windows

Please follow the instructions given in the documentation -
[Mongo Docs Windows](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/)

##### Linux

_MongoDB Community Edition_ :
Please follow the instructions given in the documentation -
[Mongo Docs Ubuntu](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)

_MongoDB Compass_ :
Please follow the instructions given in the documentation -
[MongoDB compass Ubuntu](https://docs.mongodb.com/compass/master/install/)

#### 4. This is not required for now. During the build process if you face any error related to angular material then use this option.

Clone the repository to your local machine

```sh
git clone https://github.com/subhash011/Project-Allocation.git
```

Navigate to the angular app which is the btp-frontend folder.

```
cd Project-Allocation/btp-frontend
```

Execute the following command to add angular material :

```
ng add @angular/material
```

This command will open a prompt asking you questions :

`Choose a prebuilt theme name, or "custom" for a custom theme:` Choose Indigo/Pink and then hit enter.

`Set up global Angular Material typography styles?` Press Y and then hit enter.

`Set up browser animations for Angular Material?` Press Y and then hit enter.

#### 5. Other Dependencies

Go to the main directory of the project that is Project-Allocation
Execute the following commands :

```
cd btp-frontend
npm i

cd ..
cd backend
npm i
```

> All the dependencies will be installed which otherwise have to be installed with `npm i --save packagename`.

## Configuring Angular app

The above commands will install all the required packages but some changes are to made for the application to run as expected:

**Check the instructions given in btp-frontend folder's readme for more information.**

## Running the web app locally

Open two terminal windows and locate to Project-Allocation/btp-frontend and Project-Allocation/backend respectively one in each of the terminal.

In the terminal where you navigated to btp-frontend folder execute the following command :

```
ng serve
```

> Angular will listen to the port 4200 by default and to change the port and run use `ng serve --port PORT_NO`

In the terminal where you navigated to backend folder execute the following command :

```
node server.js
```

or

```
nodemon
```

> If nodemon is not installed then use `npm i --save nodemon` in the same terminal to install it.

Now open a web browser and go to the url <http://localhost:4200> to use the web app.

## Deployment

1. Navigate to the `environments` folder under the `src` folder and open the environment.prod.ts file.

2. `apiUrl` is the base URL to which angular application will be listening, `GOOGLE_CLIENT_ID` is the ID obtained from google developer console on
   registering the application

   To register the app on google's developer console follow the link given:
   `https://medium.com/@pablo127/google-api-authentication-with-oauth-2-on-the-example-of-gmail-a103c897fd98`, when following this link choose the application type as **Web Application** not **Others** as mentioned in the link.

   #### Note : The GOOGLE_CLIENT_ID must be the same for the backend .env file and the btp-frontend environment.prod.ts file

3. Define `apiUrl` and `GOOGLE_CLIENT_ID` in the environment.prod.ts file.

   > ### Optional Steps to follow to maintain the code for various deployment stages like developement, testing, production etc.
   >
   > During the build the environment.ts file is replaced by environment.prod.ts
   > file so we need not worry about the environment.ts file. To change the default behaviour head over to the angular.json
   > file and under configurations, create a new configuration and define the file replacements in the file replacements array.
   > This artice explains very well on how to use the file replacements array:
   > `https://medium.com/@balramchavan/configure-and-build-angular-application-for-different-environments-7e94a3c0af23`

4. To build the application after completing all the configuration steps, run `ng build --prod --build-optimizer`.

   > ### This is required only if the above optional steps are followed
   >
   > if you have made any file replacements run the build command accordingly. Remember to run the ng build command in the root directory of the project i.e btp-frontend.

5. After running the build command the in step 4, the backend folder is ready to be deployed along with the necessary static files. The entire app is present in the backend folder now so it is enough to deploy this folder.

6. For deployment instructions on centos 7 follow this link:
   `https://www.terlici.com/2015/04/20/hosting-deploying-nodejs-centos.html`
   In the given link skip the 'Little customization' part.

## Built With

**MEAN STACK**

- [MongoDB](https://github.com/mongodb/mongo) - DataBase
- [Express.js](https://rometools.github.io/rome/) - Backend web application framework
- [Angular](http://www.dropwizard.io/1.0.2/docs/) - Frontend web application framework
- [Node.js](https://maven.apache.org/) - Backend web framework

## Authors

- **Sai Vamsi Alisetti** - [Vamsi995](https://github.com/Vamsi995)
- **Subhash S** - [subhash011](https://github.com/subhash011)

## Acknowledgments

- Albert Sunny
