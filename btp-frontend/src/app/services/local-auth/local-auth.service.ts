import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from 'src/environments/environment';
import {GoogleLoginProvider, SocialAuthService} from 'angularx-social-login';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {StorageService} from 'src/app/services/helpers/storage.service';
import {HttpResponseAPI} from 'src/app/models/HttpResponseAPI';
import {from} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LocalAuthService {
    private root = environment.apiUrl;
    private userUrl = this.root + 'auth/user_check';

    constructor(
        private http: HttpClient, private authService: SocialAuthService, private router: Router, private snackBar: MatSnackBar,
        private storageService: StorageService
    ) {
    }

    checkUser(user) {
        return this.http.post<any>(this.userUrl, user);
    }

    validate(data: HttpResponseAPI) {
        const {position, registered} = data.result;
        const {id} = data.result.user_details;
        if (registered) {
            if (position === 'student') {
                return {
                    route: '/student/' + id,
                    error: 'none'
                };
            } else if (position === 'faculty' || position === 'admin') {
                return {
                    route: '/faculty/' + id,
                    error: 'none'
                };
            } else if (position === 'super_admin') {
                return {
                    route: '/super_admin/' + id,
                    error: 'none'
                };
            }
        } else if (!registered) {
            if (position === 'faculty') {
                return {
                    route: '/faculty/register/' + id,
                    error: 'none'
                };
            } else if (position === 'super_admin') {
                return {
                    route: '/super_admin/register/' + id,
                    error: 'none'
                };
            }
        }
    }

    signIn() {
        return from(this.authService.signIn(GoogleLoginProvider.PROVIDER_ID));
    }

    async signOut(userClick?: boolean) {
        try {
            await this.authService.signOut();
        } catch (e) {
            console.log(e);
        } finally {
            const theme = localStorage.getItem('current-theme');
            const user = {};
            localStorage.clear();
            this.storageService.setItem('isLoggedIn', 'false');
            localStorage.setItem('role', 'none');
            localStorage.setItem('current-theme', theme);
            localStorage.setItem('user', JSON.stringify(user));
            await this.router.navigate(['']);
            if (userClick) {
                this.snackBar.open('Signed out', 'Ok');
            }
        }
    }
}
