import { MatSnackBar } from "@angular/material/snack-bar";
import { ProjectsService } from "./../../../services/projects/projects.service";
import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Router } from "@angular/router";
import { Location } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "app-student-table",
  templateUrl: "./student-table.component.html",
  styleUrls: ["./student-table.component.scss"],
})
export class StudentTableComponent implements OnInit {
  @Input() public student_list;
  @Input() public project;
  @Input() public adminStage;

  @ViewChild("table", { static: false }) table;

  public fields = ["Name", "CGPA", "Roll"];

  constructor(
    private projectService: ProjectsService,
    private location: Location,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {}

  onSubmit() {
    if (this.adminStage == 2) {
      this.projectService
        .savePreference(this.student_list, this.project._id)
        .subscribe((data) => {
          console.log(this.student_list);
          if (data["status"] == "success") {
            let snackBarRef = this.snackBar.open(data["msg"], "Ok", {
              duration: 3000,
            });
            snackBarRef.afterDismissed().subscribe(() => {
              this.router
                .navigateByUrl("/refresh", { skipLocationChange: true })
                .then(() => {
                  this.router.navigate([decodeURI(this.location.path())]);
                });
            });
          } else {
            this.snackBar.open(data["msg"], "Ok", {
              duration: 3000,
            });
          }
        });
    } else {
      if (this.adminStage < 2) {
        this.snackBar.open("This will be active on stage 3", "Ok", {
          duration: 3000,
        });
      } else {
        this.snackBar.open("Stage deadline has ended", "Ok", {
          duration: 3000,
        });
      }
    }
  }

  onListDrop(event: CdkDragDrop<string[]>) {
    let previousIndex = this.student_list.findIndex(
      (row) => row === event.item.data
    );
    moveItemInArray(this.student_list, previousIndex, event.currentIndex);
    this.table.renderRows();
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.student_list, event.previousIndex, event.currentIndex);
  }
}
