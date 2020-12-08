import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { LoginComponent } from 'src/app/components/shared/login/login.component';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
    message = '';
    toType: boolean = false;

    constructor(private httpClient: HttpClient, private router: Router, private login: LoginComponent) {
    }

    ngOnInit() {
        if (localStorage.getItem('isLoggedIn') == 'true') {
            let position = localStorage.getItem('role');
            if (position == 'admin') {
                position = 'faculty';
            }
            this.router.navigate([position + '/' + localStorage.getItem('id')]);
        }
    }

    onComplete() {
        this.toType = true;
        this.message = 'Project allocation made easy.';
    }
}
