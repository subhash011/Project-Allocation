import { LoginComponent } from "./../../shared/login/login.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ProjectsService } from "./../../../services/projects/projects.service";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router, ParamMap } from "@angular/router";
import { UserService } from "src/app/services/user/user.service";

@Component({
  selector: "app-faculty",
  templateUrl: "./faculty.component.html",
  styleUrls: ["./faculty.component.scss"],
  providers: [LoginComponent],
})
export class FacultyComponent implements OnInit {
  private id: string;

  public name: string;
  public project;
  public add: boolean;
  public empty = true;
  public stream: string;
  public projects;
  public student_list;

  constructor(
    private activatedRoute: ActivatedRoute,
    private userDetails: UserService,
    private router: Router,
    private snackBar: MatSnackBar,
    private loginService: LoginComponent,
    private projectService: ProjectsService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      this.id = params.get("id");
    });

    

    this.userDetails.getFacultyDetails(this.id).subscribe((data) => {
      if (data["status"] == "success") {
        const user_info = data["user_details"];
        this.name = user_info.name;
        



        this.activatedRoute.queryParams
        .subscribe(params => {

        if(Object.keys(params).length === 0 && params.constructor === Object){


          this.stream = user_info.stream;

        }
        else{
          this.stream = params.abbr;
        }


        this.projectService.getFacultyProjects(this.stream).subscribe((data) => {
          this.projects = data["project_details"];
        });



      });








      
    } else {
     
      let snackBarRef = this.snackBar.open(
        "Session Timed Out! Please Sign in Again!",
        "Ok",
        {
          duration: 3000,
        }
      );
      snackBarRef.afterDismissed().subscribe(() => {
        this.loginService.signOut();
      });
      snackBarRef.onAction().subscribe(() => {
        this.loginService.signOut();
      });

    }





     
    });
  }

  displayProject(project) {
    this.projectService
      .getStudentsApplied(project.students_id)
      .subscribe((data) => {
        if (data["status"] == "success") {
          this.student_list = data["students"];

          this.student_list.sort((a, b) => {
            return b.gpa - a.gpa;
          });
        } else {
          let snackBarRef = this.snackBar.open("Please reload the page", "Ok", {
            duration: 3000,
          });
        }
      });

    this.project = project;
    this.add = false;
    this.empty = false;
  }
  addProject(state) {
    this.add = state;
    this.empty = false;
  }
}
