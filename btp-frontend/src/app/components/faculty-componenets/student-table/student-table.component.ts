import { MatSnackBar } from "@angular/material/snack-bar";
import { ProjectsService } from "./../../../services/projects/projects.service";
import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { MatTableDataSource, MatTable } from "@angular/material/table";
import { Router } from "@angular/router";
import { Location } from "@angular/common";
import clonedeep from "lodash";
import { MatDialog } from "@angular/material/dialog";
import { DeletePopUpComponent } from "../delete-pop-up/delete-pop-up.component";

@Component({
  selector: "app-student-table",
  templateUrl: "./student-table.component.html",
  styleUrls: ["./student-table.component.scss"]
})
export class StudentTableComponent implements OnInit {
  @Input() public student_list;
  public checked: boolean = false;
  @Input() public project;

  constructor(
    private projectService: ProjectsService,
    private location: Location,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {}

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.student_list, event.previousIndex, event.currentIndex);
  }

  onSubmit() {
    this.checked = false;
    console.log(this.student_list);
    this.projectService
      .savePreference(this.student_list, this.project._id)
      .subscribe(data => {
        // console.log(data);
        if (data["status"] == "success") {
          let snackBarRef = this.snackBar.open(data["msg"], "Ok", {
            duration: 3000
          });
          snackBarRef.afterDismissed().subscribe(() => {
            // console.log("The snack-bar was dismissed");

            this.router
              .navigateByUrl("/refresh", { skipLocationChange: true })
              .then(() => {
                this.router.navigate([decodeURI(this.location.path())]);
              });
          });

          snackBarRef.onAction().subscribe(() => {
            // console.log("The snack-bar was dismissed");
            this.router
              .navigateByUrl("/refresh", { skipLocationChange: true })
              .then(() => {
                this.router.navigate([decodeURI(this.location.path())]);
              });
          });
        }
      });
  }
}
