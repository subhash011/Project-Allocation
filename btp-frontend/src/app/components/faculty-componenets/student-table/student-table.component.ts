import { MatSnackBar } from "@angular/material/snack-bar";
import { ProjectsService } from "./../../../services/projects/projects.service";
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Pipe,
  PipeTransform,
} from "@angular/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Router } from "@angular/router";
import { Location } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { LoaderComponent } from "../../shared/loader/loader.component";

@Pipe({
  name: "preference",
})
export class PreferencePipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    let student_list = args[2];
    let student_id = args[1];
    let project_id = args[0];

    for (const student of student_list) {
      if (student._id == student_id) {
        const index = student.projects_preference.indexOf(project_id);
        if (index == -1) {
          return "N/A";
        }
        if (index > 2) {
          return ">3";
        }
        return index + 1;
      }
    }
  }
}

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
      var dialogRef = this.dialog.open(LoaderComponent, {
        data: "Please wait ....",
        disableClose: true,
        hasBackdrop: true,
      });
      this.projectService
        .savePreference(this.student_list, this.project._id, this.project.stream)
        .subscribe((data) => {
          dialogRef.close();
          if (data["status"] == "success") {
            localStorage.removeItem(this.project._id);
            let snackBarRef = this.snackBar.open(data["msg"], "Ok", {
              duration: 3000,
            });
          } else {
            this.snackBar.open(data["msg"], "Ok", {
              duration: 3000,
            });
          }
        });
    } else {
      var dialogRef = this.dialog.open(LoaderComponent, {
        data: "Please wait ....",
        disableClose: true,
        hasBackdrop: true,
      });
      if (this.adminStage < 2) {
        this.student_list.sort((a, b) => {
          return b.gpa - a.gpa;
        });
        dialogRef.close();
        this.snackBar.open(
          "Preferences can be edited only in the next stage.",
          "Ok",
          {
            duration: 3000,
          }
        );
      } else {
        dialogRef.close();
        this.snackBar.open("You cannot edit preferences anymore", "Ok", {
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

  moveToTop(project){

    this.student_list = this.student_list.filter((val) => {
      return val._id != project._id;
    });
    this.student_list.unshift(project);
  }

  moveToBottom(project){

    this.student_list = this.student_list.filter((val) => {
      return val._id != project._id;
    });
    this.student_list.push(project);

  }

  moveOneUp(index){
    if (index == 0) {
      return;
    }
    moveItemInArray(this.student_list, index, index - 1);
  }

  moveOneDown(index){
    if (index == this.student_list.length - 1) {
      return;
    }
    moveItemInArray(this.student_list, index, index + 1);
  }

}
