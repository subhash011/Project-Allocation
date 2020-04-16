# BtpFrontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.25.

## Development Server

Run `ng serve` for a dev server and the angular app will listen to port `http://localhost:4200/` by default to change the port
use `ng serve --port PORT_NO`.

## Deployment

1. Navigate to the `environments` folder under the `src` folder.

2. `apiUrl` is the base URL to which angular application will be listening, `GOOGLE_CLIENT_ID` is the ID obtained from google developer console on
   registering the application

   #### Note : The GOOGLE_CLIENT_ID must be the same for the backend .env file and the btp-frontend environment.prod.ts file

3. Define `apiUrl` and `GOOGLE_CLIENT_ID` in the environment.prod.ts file. During the build the environment.ts file is replaced by  
   environment.prod.ts file so we need not worry about the environment.ts file. To change the default behaviour head over to the angular.json
   file and under configurations, create a new configuration and define the file replacements in the file replacements array.
   This artice explains very well on how to use the file replacements array:
   `https://medium.com/@balramchavan/configure-and-build-angular-application-for-different-environments-7e94a3c0af23`

4. To build the application after completing all the configuration steps, run `ng build --prod` if you have not made any file replacements else
   run the build command according. Remenber to run the ng build command in the root directory of the project i.e btp-frontend.

5. After running the build command angular writes the output to the dist folder under the root directory. Inside the dist folder ther will be a
   folder with the project name, copy that folder into the root directory of the backend (here "backend"). Once this is done in the backend folder
   go to the server.js file and in line 29 there is a comment saying "uncomment during production", uncomment the line just below that and the app is ready for deployment. Now the backend folder will deploy angular application as static file so it is enough if we deploy the backend folder
   on the server.
