import { UserService } from "src/app/services/user/user.service";
import { Component, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";

@Component({
  selector: "app-faculty-home",
  templateUrl: "./faculty-home.component.html",
  styleUrls: ["./faculty-home.component.scss"],
})
export class FacultyHomeComponent implements OnInit {
  constructor(private userService: UserService) {}

  public stageTableCols = ["Program", "Stage", "Time"];
  public allProjectCols = [
    "Program",
    "Project",
    "StudentsApplied",
    "StudentsAlloted",
  ];
  public projectDetails: any = new MatTableDataSource([]);
  public stageDetails: any = new MatTableDataSource([]);
  currentTime: Date = new Date();
  publishFaculty;
  publishStudents;

  ngOnInit() {
    this.userService.facultyHomeDetails().subscribe((data) => {
      data["stageDetails"].forEach((val) => {
        if (val.deadlines.length > 0)
          val.deadlines = new Date(val.deadlines[val.deadlines.length - 1]);
        else val.deadlines = null;
      });
      this.stageDetails.data = data["stageDetails"];
      this.projectDetails.data = data["projects"];
      console.log(data);
    });
    this.userService.getPublishMode("faculty").subscribe((data) => {
      if (data["status"] == "success") {
        this.publishFaculty = data["facultyPublish"];
        this.publishStudents = data["studentPublish"];
      }
    });
  }

  sortStages(event) {
    const isAsc = event.direction == "asc";
    this.stageDetails.data = this.stageDetails.data.sort((a, b) => {
      switch (event.active) {
        case "Program":
          return this.compare(a.stream, b.stream, isAsc);
        case "Stage":
          return this.compare(a.stage, b.stage, isAsc);
        default:
          return 0;
      }
    });
  }

  sortProjectDetails(event) {
    const isAsc = event.direction == "asc";
    this.projectDetails.data = this.projectDetails.data.sort((a, b) => {
      switch (event.active) {
        case "Program":
          return this.compare(a.stream, b.stream, isAsc);
        case "Project":
          return this.compare(a.stage, b.stage, isAsc);
        case "Project":
          return this.compare(a.title, b.title, isAsc);
        case "StudentsApplied":
          return this.compare(a.noOfPreferences, b.noOfPreferences, isAsc);
        default:
          return 0;
      }
    });
  }

  compare(
    a: number | string | boolean,
    b: number | string | boolean,
    isAsc: boolean
  ) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
