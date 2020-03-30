import { MatSnackBar } from "@angular/material/snack-bar";
import { ProjectsService } from "./../../../services/projects/projects.service";
import { Component, OnInit, Input } from "@angular/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Router } from "@angular/router";
import { Location } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";

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
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {}

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.student_list, event.previousIndex, event.currentIndex);
  }

  onSubmit() {
    this.checked = false;
    this.projectService
      .savePreference(this.student_list, this.project._id)
      .subscribe(data => {
        if (data["status"] == "success") {
          let snackBarRef = this.snackBar.open(data["msg"], "Ok", {
            duration: 3000
          });
          snackBarRef.afterDismissed().subscribe(() => {
            this.router
              .navigateByUrl("/refresh", { skipLocationChange: true })
              .then(() => {
                this.router.navigate([decodeURI(this.location.path())]);
              });
          });

          snackBarRef.onAction().subscribe(() => {
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
