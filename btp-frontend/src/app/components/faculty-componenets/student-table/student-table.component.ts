import { ProjectsService } from "./../../../services/projects/projects.service";
import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { MatTableDataSource, MatTable } from "@angular/material/table";
import clonedeep from "lodash";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
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
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {}

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.student_list, event.previousIndex, event.currentIndex);
  }

  onSubmit() {
    let dialogRef = this.dialog.open(DeletePopUpComponent, {
      height: "200px",
      width: "400px",
      data: "save preferences"
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res["message"] == "submit") {
        this.checked = false;
        console.log(this.student_list);
        this.projectService
          .savePreference(this.student_list, this.project._id)
          .subscribe(data => {
            this.snackBar.open("Preferences Saved", "Ok", {
              duration: 3000
            });
          });
      }
    });
  }
}
