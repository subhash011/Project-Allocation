import {Component, OnDestroy, OnInit} from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import {Subject} from 'rxjs';
import {ProjectsService} from 'src/app/services/projects/projects.service';
import {HttpResponseAPI} from 'src/app/models/HttpResponseAPI';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-student-projects',
    templateUrl: './student-projects.component.html',
    styleUrls: ['./student-projects.component.scss'],
    providers: []
})
export class StudentProjectsComponent implements OnInit, OnDestroy {
    projects: any;
    preferences: any = [];
    background: ThemePalette = 'primary';
    loaded = false;
    private ngUnsubscribe: Subject<any> = new Subject();

    constructor(private projectService: ProjectsService) {
    }

    ngOnInit() {
        this.getStudentPreferences();
    }

    getStudentPreferences() {
        this.projectService
            .getStudentPreference()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((responseAPI: HttpResponseAPI) => {
                this.loaded = true;
                this.preferences = responseAPI.result.preferences;
            }, () => {
            });
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
