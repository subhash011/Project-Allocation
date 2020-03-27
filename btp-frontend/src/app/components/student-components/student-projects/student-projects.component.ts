import { UserService } from "./../../../services/user/user.service";
import { ProjectsService } from "src/app/services/projects/projects.service";
import { Component, OnInit } from "@angular/core";
import { Validators, FormGroup, FormBuilder } from "@angular/forms";
import { ThemePalette } from "@angular/material/core";

@Component({
  selector: "app-student-projects",
  templateUrl: "./student-projects.component.html",
  styleUrls: ["./student-projects.component.scss"]
})
export class StudentProjectsComponent implements OnInit {
  constructor(
    private projectService: ProjectsService,
    private userService: UserService
  ) {}
  ngOnInit() {
    this.getStudentProjects();
    this.getStudentPreferences();
  }
  projects: any;
  preferences: any;
  bacground: ThemePalette = "primary";
  getStudentProjects() {
    const user = this.projectService
      .getAllStudentProjects()
      .toPromise()
      .then(details => {
        this.projects = details;
      });
  }
  getStudentPreferences() {
    const user = this.projectService
      .getStudentPreference()
      .toPromise()
      .then(details => {
        this.preferences = details;
      });
  }
}
