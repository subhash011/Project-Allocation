import { ProjectsService } from "./../../../services/projects/projects.service";
import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { MatTableDataSource, MatTable } from "@angular/material/table";
import clonedeep from "lodash";

@Component({
  selector: "app-student-table",
  templateUrl: "./student-table.component.html",
  styleUrls: ["./student-table.component.scss"]
})
export class StudentTableComponent implements OnInit {
  @Input() public student_list;
  public checked: boolean = false;
  @Input() public project;

  constructor(private projectService: ProjectsService) {}

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
        console.log(data);
      });
  }
}
