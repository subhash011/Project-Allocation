import { Component, OnDestroy, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { ProjectsService } from 'src/app/services/projects/projects.service';
import { NavbarComponent } from 'src/app/components/shared/navbar/navbar.component';
import { LoginComponent } from 'src/app/components/shared/login/login.component';

@Component({
    selector: 'app-student-projects',
    templateUrl: './student-projects.component.html',
    styleUrls: ['./student-projects.component.scss'],
    providers: [LoginComponent],
})
export class StudentProjectsComponent implements OnInit, OnDestroy {
    projects: any;
    preferences: any = [];
    background: ThemePalette = 'primary';
    private ngUnsubscribe: Subject<any> = new Subject();

    constructor(
        private projectService: ProjectsService,
        private loginObject: LoginComponent,
        private snackBar: MatSnackBar,
        private navbar: NavbarComponent
    ) {
    }

    ngOnInit() {
        this.getStudentPreferences();
    }

    getStudentPreferences() {
        this.projectService.getStudentPreference().subscribe(
            (details) => {
                if (details['message'] == 'token-expired') {
                    this.navbar.role = 'none';
                    this.snackBar.open('Session Expired! Please Sign In Again', 'OK', {
                        duration: 3000,
                    });
                    this.loginObject.signOut();
                } else {
                    this.preferences = details['result'];
                }
            },
            () => {
                this.snackBar.open(
                    'Some Error Occured! Please re-authenticate.',
                    'OK',
                    {
                        duration: 3000,
                    }
                );
                this.navbar.role = 'none';
                this.loginObject.signOut();
            }
        );
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
