import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { LocalAuthService } from "../local-auth/local-auth.service";
import { Injectable } from "@angular/core";

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
    constructor(
        private snackBar: MatSnackBar,
        private localAuthService: LocalAuthService
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                console.log(error);
                if (error.error instanceof ErrorEvent) {
                    this.snackBar.open("Some unknown error occurred! Try again", "Ok");
                } else {
                    if (error.status == 401) {
                        this.snackBar.open(error.error.message, "Ok");
                    } else {
                        this.snackBar.open(error.error.message, "Ok");
                    }
                    this.localAuthService.signOut();
                }
                return throwError(error);
            }));
    }
}
