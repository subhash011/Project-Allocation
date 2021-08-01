import {LoginComponent} from 'src/app/components/shared/login/login.component';
import {Router} from '@angular/router';
import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    providers: [LoginComponent]
})
export class AppComponent implements OnInit {
    constructor(
        private router: Router
    ) {
    }

    ngOnInit() {
        if (localStorage.getItem('role') == 'none') {
            this.router.navigate(['']);
        }
    }
}
