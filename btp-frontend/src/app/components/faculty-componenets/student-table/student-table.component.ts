import { MatSnackBar } from "@angular/material/snack-bar";
import { ProjectsService } from "./../../../services/projects/projects.service";
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Pipe,
  PipeTransform,
  OnChanges,
  SimpleChanges,
  HostListener,
} from "@angular/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Router } from "@angular/router";
import { Location } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { LoaderComponent } from "../../shared/loader/loader.component";
import { MatTableDataSource, MatTab, MatTable } from '@angular/material';
import {
  trigger,
  style,
  state,
  transition,
  animate,
} from "@angular/animations";

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
        student.index = index;
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

@Pipe({
  name:"getDisplayedColumns"
})
export class GetDisplayedColumns implements PipeTransform {
  transform(index) {
    let preferred = ["Name", "CGPA", "Roll","Index", "Actions"];
    let notPreferred = ["Name", "CGPA", "Roll","Index", "Actions"];
    return index == 0 ? preferred : notPreferred;
  }
}

@Component({
  selector: "app-student-table",
  templateUrl: "./student-table.component.html",
  styleUrls: ["./student-table.component.scss"],
  animations: [
    trigger("detailExpand", [
      state(
        "collapsed",
        style({ height: "0px", minHeight: "0", display: "none" })
      ),
      state("expanded", style({ height: "*" })),
      transition(
        "expanded <=> collapsed",
        animate("0ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      ),
    ]),
  ],
})
export class StudentTableComponent implements OnInit, OnChanges {

  @ViewChild("table",{static:false}) table: MatTable<any>;

  @Input() public student_list;
  @Input() public project;
  @Input() public adminStage;
  @Input() public index;
  @Input() public reorder;
  
  public fields = ["Name", "CGPA", "Roll","Index", "Actions"];
  students:MatTableDataSource<any>;
  non_students:MatTableDataSource<any>;
  expandedElement:any;
  studentTableHeight: number = window.innerHeight >= 1400 ? 600:400;
  constructor(
    private projectService: ProjectsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnChanges(simpleChanges:SimpleChanges){
    if(simpleChanges.student_list) {
      this.students = new MatTableDataSource(this.student_list);
    }
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    if (event.target.innerHeight <= 1400) {
      this.studentTableHeight = 400;
    } 
    else{
      this.studentTableHeight = 600;
    }
  }

  ngOnInit() {
    this.students = new MatTableDataSource(this.student_list);
  }

  onSubmit() {

    if (this.adminStage == 2) {
      var dialogRef = this.dialog.open(LoaderComponent, {
        data: "Please wait ....",
        disableClose: true,
        hasBackdrop: true,
      });

        this.projectService
          .savePreference(this.students.data, this.project._id, this.project.stream, this.index, this.reorder)
          .subscribe((data) => {
            dialogRef.close();
            if (data["status"] == "success") {
              this.reorder = data["reorder"];
              localStorage.setItem(this.project._id,"true");
              this.snackBar.open(data["msg"], "Ok", {
                duration: 3000,
              });
            } else {
              this.snackBar.open(data["msg"], "Ok", {
                duration: 3000,
              });
            }
          },() => {
            dialogRef.close();
            this.ngOnInit();
            this.snackBar.open("Some Error Occured! Try again later.", "OK", {
              duration: 3000,
            });
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
          "Preferences can be edited only in the further stages.",
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

  drop(event: CdkDragDrop<string[]>) {
    let previousIndex = this.students.data.findIndex(
      (row) => row === event.item.data
    );
    moveItemInArray(this.students.data, previousIndex, event.currentIndex);
    this.students.data = [...this.students.data];
  }

  moveToTop(student){

    if(this.checkAdminStage()){
      return;
    }

    this.students.data = this.students.data.filter((val) => {
      return val._id != student._id;
    });
    this.students.data.unshift(student);
    this.students.data = [...this.students.data];
  }

  moveToBottom(project){

    if(this.checkAdminStage()){
      return;
    }

    this.students.data = this.students.data.filter((val) => {
      return val._id != project._id;
    });
    this.students.data.push(project);
    this.students.data = [...this.students.data];
  }

  moveOneUp(index){

    if(this.checkAdminStage()){
      return;
    }

    if (index == 0) {
      return;
    }
    moveItemInArray(this.students.data, index, index - 1);
    this.students.data = [...this.students.data];
  }

  moveOneDown(index){

    if(this.checkAdminStage()){
      return;
    }
    if (index == this.students.data.length - 1) {
      return;
    }
    moveItemInArray(this.students.data, index, index + 1);
    this.students.data = [...this.students.data];
  }

  checkAdminStage(){
    if(this.adminStage != 2){
      return true;
    }
    else{
      return false;
    }
  }

  sortStudentTable(event){
    const isAsc = event.direction == "asc";
    this.students.data = this.students.data.sort((a, b) => {
      switch (event.active) {
        case "Name":
          return this.compare(a.name, b.name, isAsc);
        case "CGPA":
          return this.compare(a.gpa, b.gpa, isAsc);
        case "Roll":
          return this.compare(a.roll_no, b.roll_no, isAsc);
        case "Index":
          return this.compare(a.index, b.index, isAsc);
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
