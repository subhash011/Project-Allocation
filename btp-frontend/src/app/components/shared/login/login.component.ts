import { MatSnackBar } from '@angular/material/snack-bar';
import { LocalAuthService } from 'src/app/services/local-auth/local-auth.service';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    Pipe,
    PipeTransform,
    ViewChild
} from '@angular/core';
import { GoogleLoginProvider, SocialAuthService } from 'angularx-social-login';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LoaderComponent } from '../loader/loader.component';

@Pipe({
    name: 'checkLogIn',
    pure: false
})
export class CheckLogIn implements PipeTransform {
    transform(value) {
        return localStorage.getItem('isLoggedIn') == 'true';
    }
}

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
    @Output() isSignedIn = new EventEmitter<any>();
    @Input() role: string;
    @ViewChild('sigInDiv') signInDiv: ElementRef;
    dialogRefLoad: any;
    isLoggedIn = localStorage.getItem('isLoggedIn') == 'true';

    constructor(
        private authService: SocialAuthService,
        private router: Router,
        private dialog: MatDialog,
        private localAuth: LocalAuthService,
        private snackBar: MatSnackBar
    ) {
    }

    ngOnInit() {
        if (!localStorage.getItem('isLoggedIn')) {
            localStorage.setItem('isLoggedIn', 'false');
            this.isLoggedIn = false;
        } else {
            this.isLoggedIn = localStorage.getItem('isLoggedIn') == 'true';
        }
    }

    async userActivity() {
        if (localStorage.getItem('isLoggedIn') == 'true') {
            await this.signOut(true);
        } else {
            this.signInWithGoogle();
        }
    }

    signInWithGoogle(): void {
        this.authService
            .signIn(GoogleLoginProvider.PROVIDER_ID)
            .then((user) => {
                this.dialogRefLoad = this.dialog.open(LoaderComponent, {
                    data: 'Loading, Please wait ...',
                    disableClose: true,
                    panelClass: 'transparent'
                });
                const userModified = {
                    id: user.id,
                    idToken: user.idToken,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    photoUrl: user.photoUrl,
                    email: user.email,
                    name: user.name,
                    authToken: user.authToken
                };
                localStorage.setItem('user', JSON.stringify(userModified));
                localStorage.setItem('isLoggedIn', 'true');
                this.isLoggedIn = true;
                this.localAuth.checkUser(user).subscribe(
                    (data) => {
                        this.dialogRefLoad.close();
                        const navObj = this.localAuth.validate(data);
                        localStorage.setItem('id', data['user_details']['id']);
                        localStorage.setItem('role', data['position']);
                        this.isSignedIn.emit(data['position']);
                        const route = navObj.route.split('/');
                        if (route[1] == 'register') {
                            localStorage.setItem('isRegistered', 'false');
                        } else {
                            localStorage.setItem('isRegistered', 'true');
                        }

                        if (navObj.error === 'none') {
                            this.router.navigate([navObj.route]);
                        } else {
                            this.signOut();
                            this.snackBar.open(navObj.error, 'Ok', {
                                duration: 10000
                            });
                            localStorage.setItem('isLoggedIn', 'false');
                            this.isLoggedIn = false;
                            localStorage.setItem('role', 'none');
                            localStorage.removeItem('user');
                            localStorage.removeItem('id');
                            this.router.navigate(['']);
                        }
                        if (data['position'] == 'error') {
                            this.signOut();
                            this.snackBar.open(
                                'Use the institute mail-id to access the portal',
                                'Ok'
                            );
                            localStorage.setItem('isLoggedIn', 'false');
                            this.isLoggedIn = false;
                            localStorage.setItem('role', 'none');
                            localStorage.removeItem('user');
                            localStorage.removeItem('id');
                            this.router.navigate(['']);
                        }
                    },
                    () => {
                        this.dialogRefLoad.close();
                        this.snackBar.open(
                            'Some error occured. Check your network connection and try again!',
                            'Ok'
                        );
                    }
                );
            })
            .catch((err) => {
                if (err.error == 'popup_closed_by_user') {
                    this.snackBar.open('Cancelled Sign-In!', 'Ok');
                } else {
                    this.snackBar.open(
                        'Some error occurred. Check your network connection or enable third party cookies if you are in incognito',
                        'Ok'
                    );
                }
            });
    }

    async signOut(userClick?: boolean) {
        await this.localAuth.signOut(userClick);
    }
}
