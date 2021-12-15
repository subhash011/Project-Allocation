import {MatSnackBar} from '@angular/material/snack-bar';
import {LocalAuthService} from 'src/app/services/local-auth/local-auth.service';
import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, NgModule, OnInit, Output, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {LoaderComponent} from 'src/app/components/shared/loader/loader.component';
import {HttpResponseAPI} from 'src/app/models/HttpResponseAPI';
import {CommonModule} from '@angular/common';
import {MaterialModule} from 'src/app/material/material.module';
import {PipeModule} from 'src/app/components/shared/Pipes/pipe.module';
import {finalize} from 'rxjs/operators';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {

    constructor(
        private router: Router,
        private dialog: MatDialog,
        private localAuth: LocalAuthService,
        private snackBar: MatSnackBar
    ) {
    }
    @Output() isSignedIn = new EventEmitter<any>();
    @Input() role: string;
    @ViewChild('sigInDiv') signInDiv: ElementRef;
    dialogRefLoad: any;
    isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    closeDialog = finalize(() => this.dialogRefLoad.close());

    ngOnInit() {
        if (!localStorage.getItem('isLoggedIn')) {
            localStorage.setItem('isLoggedIn', 'false');
            this.isLoggedIn = false;
        } else {
            this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        }
    }

    async userActivity() {
        if (localStorage.getItem('isLoggedIn') === 'true') {
            await this.signOut(true);
        } else {
            this.signInWithGoogle();
        }
    }

    signInWithGoogle(): void {
        this.localAuth
            .signIn()
            .subscribe((user) => {
                this.dialogRefLoad = this.dialog.open(LoaderComponent, {
                    data: 'Loading, Please wait ...',
                    disableClose: true,
                    panelClass: 'transparent'
                });
                this.isLoggedIn = true;
                this.localAuth.checkUser(user)
                    .pipe(this.closeDialog)
                    .subscribe((responseAPI: HttpResponseAPI) => {
                        const {position} = responseAPI.result;
                        const {error, route} = this.localAuth.validate(responseAPI);
                        localStorage.setItem('name', user.name);
                        localStorage.setItem('id', user.id);
                        localStorage.setItem('idToken', user.idToken);
                        localStorage.setItem('photoUrl', user.photoUrl);
                        localStorage.setItem('isLoggedIn', 'true');
                        localStorage.setItem('role', position);
                        this.isSignedIn.emit(position);
                        if (route.includes('register')) {
                            localStorage.setItem('isRegistered', 'false');
                            const userModified = {
                                firstName: user.firstName,
                                lastName: user.lastName,
                                email: user.email
                            };
                            localStorage.setItem('user', JSON.stringify(userModified));
                        } else {
                            localStorage.setItem('isRegistered', 'true');
                        }
                        if (error === 'none') {
                            this.router.navigate([route]);
                        } else {
                            this.signOut();
                            this.snackBar.open(error, 'Ok', {duration: 10000});
                        }
                    });
            }, (err) => {
                if (err.error === 'popup_closed_by_user') {
                    this.snackBar.open('Cancelled Sign-In!', 'Ok');
                } else {
                    if (err.includes('Login providers not ready yet')) {
                        this.snackBar.open('Please wait for the page to load before you sign-in', 'Ok');
                    } else {
                        this.snackBar.open('Check your network connection or Provide access to third party cookies if your are in incognito.', 'Ok');
                    }
                }
            });
    }

    async signOut(userClick?: boolean) {
        await this.localAuth.signOut(userClick);
    }
}

@NgModule({
    imports: [
        CommonModule,
        MaterialModule,
        PipeModule
    ],
    declarations: [
        LoginComponent
    ],
    exports: [
        LoginComponent
    ]
})
export class LoginModule {
}
