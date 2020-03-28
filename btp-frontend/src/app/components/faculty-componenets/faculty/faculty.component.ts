import { ProjectsService } from "./../../../services/projects/projects.service";
import { Component, OnInit, Input } from "@angular/core";
import { ActivatedRoute, Router, ParamMap } from "@angular/router";
import { UserService } from "src/app/services/user/user.service";

@Component({
  selector: "app-faculty",
  templateUrl: "./faculty.component.html",
  styleUrls: ["./faculty.component.scss"]
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
    private projectService: ProjectsService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      this.id = params.get("id");
      console.log(this.id);
    });
    this.userDetails.getFacultyDetails(this.id).subscribe(
      data => {
        console.log(data);
        if (data["status"] == "success") {
          const user_info = data["user_details"]; //Gets all Faculty details --> Bind it to the template
          this.name = user_info.name;
          this.stream = user_info.stream;

          this.projectService
            .getFacultyProjects(user_info["project_list"])
            .subscribe(data => {
              console.log(data);
              this.projects = data["project_details"];
            });
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  // displayAdd() {
  //   // this.router.navigate(["project", "add"], {
  //   //   relativeTo: this.activatedRoute,
  //   //   queryParams: {
  //   //     stream: this.stream
  //   //   }
  //   // });
  // }

  displayProject(project) {
    console.log(project);

    this.projectService
      .getStudentsApplied(project.students_id)
      .subscribe(data => {
          this.student_list = data["students"]
      });

    this.project = project;
    this.add = false;
    this.empty = false;
  }
  addProject(state) {
    console.log(state);
    this.add = state;
    this.empty = false;
  }
}
