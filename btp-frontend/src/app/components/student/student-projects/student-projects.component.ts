import {Component, OnInit} from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import {ProjectsService} from 'src/app/services/projects/projects.service';
import {HttpResponseAPI} from 'src/app/models/HttpResponseAPI';

@Component({
    selector: 'app-student-projects',
    templateUrl: './student-projects.component.html',
    styleUrls: ['./student-projects.component.scss'],
    providers: []
})
export class StudentProjectsComponent implements OnInit {
    projects: any;
    preferences: any = [];
    background: ThemePalette = 'primary';
    loaded = false;

    constructor(private projectService: ProjectsService) {
    }

    ngOnInit() {
        this.getStudentPreferences();
    }

    getStudentPreferences() {
        this.projectService
            .getStudentPreference()
            .subscribe((responseAPI: HttpResponseAPI) => {
                this.loaded = true;
                this.preferences = responseAPI.result.preferences;
            }, () => {
            });
    }
}
