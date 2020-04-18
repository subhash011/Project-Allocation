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
  public programs;
  public programs_mode: boolean = true;
  public program_details;
  public routeParams;
  public adminStage;

  constructor(
    private activatedRoute: ActivatedRoute,
    private userDetails: UserService,
    private router: Router,
    private snackBar: MatSnackBar,
    private loginService: LoginComponent,
    private projectService: ProjectsService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      this.id = params.get("id");
    });

    this.userDetails.getFacultyDetails(this.id).subscribe((data) => {
      if (data["status"] == "success") {
        const user_info = data["user_details"];
        this.name = user_info.name;

        this.activatedRoute.queryParams.subscribe((params) => {
          this.routeParams = params;
          if (params.mode == "programMode") {
            this.programs_mode = false;
          }
          if (
            Object.keys(params).length === 0 &&
            params.constructor === Object
          ) {
            this.stream = user_info.stream;
          } else {
            this.stream = params.abbr;
            this.empty = true;
          }

          this.projectService
            .getFacultyProjects(this.stream)
            .subscribe((data) => {
              this.projects = data["project_details"];

              this.userService.getFacultyPrograms().subscribe((data) => {
                if (data["status"] == "success") {
                  this.programs = data["programs"];

                  this.userService
                    .getAdminInfo_program(this.stream)
                    .subscribe((data) => {
                      if (data["status"] == "success") {
                        this.adminStage = data["admin"].stage;
                      }
                    });
                }
              });
            });
        });
      } else {
        this.loginService.signOut();
        this.snackBar.open("Session Timed Out! Please Sign-In again", "Ok", {
          duration: 3000,
        });
      }
    });
  }

  displayProject(project) {
    // this.projectClicked = true;
    this.projectService
      .getStudentsApplied(project.students_id)
      .subscribe((data) => {
        console.log(data);
        if (data["status"] == "success") {
          this.student_list = data["students"];

          this.student_list.sort((a, b) => {
            return b.gpa - a.gpa;
          });
        } else {
          this.loginService.signOut();
          this.snackBar.open("Session Timed Out! Please Sign-In again", "Ok", {
            duration: 3000,
          });
        }
      });

    this.project = project;
    this.add = false;
    this.empty = false;
  }
  addProject(state) {
    // this.projectClicked = true;
    if (this.adminStage == 0) {
      this.add = state;
      this.empty = false;
    } else {
      this.add = !state;
      this.snackBar.open(
        "Stage Deadline reached!! You can't add more projects!!",
        "Ok",
        {
          duration: 3000,
        }
      );
    }
  }

  displayProgram(program) {
    this.userService.getFacultyProgramDetails(program).subscribe((data) => {
      console.log(data);
      if (data["status"] == "success") {
        this.program_details = data["program_details"];
      } else {
        this.program_details = data["result"];
        this.snackBar.open("No Admin assigned to this program!!", "Ok", {
          duration: 3000,
        });
      }
    });
  }
}
