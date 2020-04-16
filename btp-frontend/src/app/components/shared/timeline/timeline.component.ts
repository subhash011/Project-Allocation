import { UserService } from "src/app/services/user/user.service";
import {
  Component,
  OnInit,
  Input,
  AfterViewInit,
  TemplateRef,
  ChangeDetectorRef,
} from "@angular/core";

@Component({
  selector: "app-timeline",
  templateUrl: "./timeline.component.html",
  styleUrls: ["./timeline.component.scss"],
})
export class TimelineComponent implements OnInit {
  @Input() program;
  constructor(
    private userService: UserService,
    private cdRef: ChangeDetectorRef
  ) {}
  admins: any;
  stream = "";
  check: boolean = false;
  startCompleted: boolean;
  stageOneCompleted: boolean;
  stageTwoCompleted: boolean;
  stageThreeCompleted: boolean;
  stageFourCompleted: boolean;
  curDeadline: Date;
  startDate: Date;
  dates: Date[] = [];
  stage: number = 0;
  stageOne: number;
  stageTwo: number;
  stageThree: number;
  stageFour: number;
  message: String;
  icon;
  ngOnInit() {
    if (localStorage.getItem("role") == "student") {
      this.icon = {
        float: "left",
        "margin-top.%": "3",
        left: "0",
      };
      this.userService
        .getStudentDetails(localStorage.getItem("id"))
        .toPromise()
        .then((student) => {
          if (student["status"] == "success") {
            this.stream = student["user_details"]["stream"];
            return this.stream;
          }
        })
        .then((stream) => {
          this.userService
            .getAllAdminDetails()
            .toPromise()
            .then((result) => {
              if (result["message"] == "success") {
                this.admins = result["result"][stream];
                if (result["result"] && result["result"][stream]) {
                  if (this.admins.startDate) {
                    this.curDeadline = new Date(
                      this.admins.deadlines[this.admins.deadlines.length - 1]
                    );
                    this.startDate = new Date(this.admins.startDate);
                    this.startCompleted = true;
                    this.stage = this.admins.stage;
                    for (let i = 0; i <= this.stage; i++) {
                      this.dates.push(new Date(this.admins["deadlines"][i]));
                      if (this.stage == 0 && i == 0) {
                        this.message =
                          "Faculties add projects during this period";
                        const now = new Date();
                        this.stageOne =
                          Math.abs(now.getTime() - this.startDate.getTime()) /
                          Math.abs(
                            this.dates[0].getTime() - this.startDate.getTime()
                          );
                        this.stageOne = this.stageOne * 100;
                        if (this.stageOne >= 100) {
                          this.stageOneCompleted = true;
                        }
                      }
                      if (this.stage == 1 && i == 1) {
                        this.message =
                          "You have to fill in your preferences during this period";
                        this.stageOneCompleted = true;
                        this.stageOne = 100;
                        const now = new Date();
                        this.stageTwo =
                          Math.abs(now.getTime() - this.dates[0].getTime()) /
                          Math.abs(
                            this.dates[1].getTime() - this.dates[0].getTime()
                          );
                        this.stageTwo *= 100;
                        if (this.stageTwo >= 100) {
                          this.stageTwoCompleted = true;
                        }
                      }
                      if (this.stage == 2 && i == 2) {
                        this.message =
                          "Faculties start giving their preferences of students for their projects";
                        this.stageOneCompleted = true;
                        this.stageOne = 100;
                        this.stageTwoCompleted = true;
                        this.stageTwo = 100;
                        const now = new Date();
                        this.stageThree =
                          Math.abs(now.getTime() - this.dates[1].getTime()) /
                          Math.abs(
                            this.dates[2].getTime() - this.dates[1].getTime()
                          );
                        this.stageThree *= 100;
                        if (this.stageThree >= 100) {
                          this.stageThreeCompleted = true;
                        }
                      }
                      if (this.stage == 3 && i + 1 == 4) {
                        this.message =
                          "Project allocation will be done within this period";
                        this.stageThreeCompleted = true;
                        this.stageThree = 100;
                        this.stageOneCompleted = true;
                        this.stageOne = 100;
                        this.stageTwoCompleted = true;
                        this.stageTwo = 100;
                        const now = new Date();
                        this.stageFour =
                          Math.abs(now.getTime() - this.dates[2].getTime()) /
                          Math.abs(
                            this.dates[3].getTime() - this.dates[2].getTime()
                          );
                        this.stageFour *= 100;
                        if (this.stageFour >= 100) {
                          this.stageFourCompleted = true;
                        }
                      }
                      if (this.stage == 4 && i == 4) {
                        this.stageThreeCompleted = true;
                        this.stageThree = 100;
                        this.stageOneCompleted = true;
                        this.stageOne = 100;
                        this.stageTwoCompleted = true;
                        this.stageTwo = 100;
                        this.stageFourCompleted = true;
                        this.stageFour = 100;
                      }
                    }
                  }
                }
              }
            });
        });
    } else {
      this.icon = {
        float: "left",
        "margin-top.%": "2.8",
        left: "0",
      };
      this.userService
        .getFacultyDetails(localStorage.getItem("id"))
        .toPromise()
        .then((faculty) => {
          if (faculty["status"] == "success") {
            this.stream = faculty["user_details"]["stream"];
            return this.stream;
          }
        })
        .then((stream) => {
          this.userService
            .getAllAdminDetails()
            .toPromise()
            .then((result) => {
              if (result["message"] == "success") {
                stream = this.program;
                if (result["result"] && result["result"][stream]) {
                  this.admins = result["result"][this.program];
                  if (this.admins.startDate) {
                    this.curDeadline = new Date(
                      this.admins.deadlines[this.admins.deadlines.length - 1]
                    );
                    this.startDate = new Date(this.admins.startDate);
                    this.startCompleted = true;
                    this.stage = this.admins.stage;
                    for (let i = 0; i <= this.stage; i++) {
                      this.dates.push(new Date(this.admins["deadlines"][i]));
                      if (this.stage == 0 && i == 0) {
                        const now = new Date();
                        this.message =
                          "Faculties add projects during this period";
                        this.stageOne =
                          Math.abs(now.getTime() - this.startDate.getTime()) /
                          Math.abs(
                            this.dates[0].getTime() - this.startDate.getTime()
                          );
                        this.stageOne = this.stageOne * 100;
                        if (this.stageOne >= 100) {
                          this.stageOneCompleted = true;
                        }
                      }
                      if (this.stage == 1 && i == 1) {
                        this.stageOneCompleted = true;
                        this.stageOne = 100;
                        const now = new Date();
                        this.stageTwo =
                          Math.abs(now.getTime() - this.dates[0].getTime()) /
                          Math.abs(
                            this.dates[1].getTime() - this.dates[0].getTime()
                          );
                        this.stageTwo *= 100;
                        if (this.stageTwo >= 100) {
                          this.stageTwoCompleted = true;
                        }
                      }
                      if (this.stage == 2 && i == 2) {
                        this.stageOneCompleted = true;
                        this.stageOne = 100;
                        this.stageTwoCompleted = true;
                        this.stageTwo = 100;
                        const now = new Date();
                        this.stageThree =
                          Math.abs(now.getTime() - this.dates[1].getTime()) /
                          Math.abs(
                            this.dates[2].getTime() - this.dates[1].getTime()
                          );
                        this.stageThree *= 100;
                        if (this.stageThree >= 100) {
                          this.stageThreeCompleted = true;
                        }
                      }

                      if (this.stage == 3 && i + 1 == 4) {
                        this.stageThreeCompleted = true;
                        this.stageThree = 100;
                        this.stageOneCompleted = true;
                        this.stageOne = 100;
                        this.stageTwoCompleted = true;
                        this.stageTwo = 100;
                        const now = new Date();
                        this.stageFour =
                          Math.abs(now.getTime() - this.dates[2].getTime()) /
                          Math.abs(
                            this.dates[3].getTime() - this.dates[2].getTime()
                          );
                        this.stageFour *= 100;
                        if (this.stageFour >= 100) {
                          this.stageFourCompleted = true;
                        }
                      }
                      if (this.stage == 4 && i == 4) {
                        this.stageThreeCompleted = true;
                        this.stageThree = 100;
                        this.stageOneCompleted = true;
                        this.stageOne = 100;
                        this.stageTwoCompleted = true;
                        this.stageTwo = 100;
                        this.stageFourCompleted = true;
                        this.stageFour = 100;
                      }
                    }
                  }
                }
              }
            });
        });
    }
  }
  refresh(program) {
    this.program = program.short;
    this.ngOnInit();
  }
}
