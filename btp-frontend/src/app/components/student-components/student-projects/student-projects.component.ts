import { LoadingBarService } from "@ngx-loading-bar/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { LoginComponent } from "./../../shared/login/login.component";
import { UserService } from "./../../../services/user/user.service";
import { ProjectsService } from "src/app/services/projects/projects.service";
import { Component, OnInit } from "@angular/core";
import { ThemePalette } from "@angular/material/core";

@Component({
  selector: "app-student-projects",
  templateUrl: "./student-projects.component.html",
  styleUrls: ["./student-projects.component.scss"],
  providers: [LoginComponent],
})
export class StudentProjectsComponent implements OnInit {
  constructor(
    private projectService: ProjectsService,
    private loginObject: LoginComponent,
    private snackBar: MatSnackBar,
    private loadingBar: LoadingBarService
  ) {}
  ngOnInit() {
    this.loadingBar.start();
    this.getStudentProjects();
    this.getStudentPreferences();
  }
  projects: any;
  preferences: any = [];
  background: ThemePalette = "primary";
  getStudentProjects() {
    const user = this.projectService
      .getAllStudentProjects()
      .subscribe((details) => {
        if (details["message"] == "token-expired") {
          this.loginObject.signOut();
          this.snackBar.open("Session Expired! Please Sign In Again", "OK", {
            duration: 3000,
          });
        } else {
          this.projects = details["result"];
        }
        this.loadingBar.stop();
      });
  }
  getStudentPreferences() {
    const user = this.projectService
      .getStudentPreference()
      .subscribe((details) => {
        if (details["message"] == "token-expired") {
          this.loginObject.signOut();
          this.snackBar.open("Session Expired! Please Sign In Again", "OK", {
            duration: 3000,
          });
        } else {
          this.preferences = details["result"];
        }
        this.loadingBar.stop();
      });
  }
}
