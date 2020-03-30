import { Router } from "@angular/router";
import { ProjectsService } from "src/app/services/projects/projects.service";
import { UserService } from "./../../../services/user/user.service";
import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import {
  transferArrayItem,
  CdkDragDrop,
  moveItemInArray
} from "@angular/cdk/drag-drop";

@Component({
  selector: "app-show-preferences",
  templateUrl: "./show-preferences.component.html",
  styleUrls: ["./show-preferences.component.scss"]
})
export class ShowPreferencesComponent implements OnInit {
  preferenceArray: string[];
  helperArray: string[];
  constructor(
    private userService: UserService,
    private projectService: ProjectsService,
    private router: Router,
    public dialogRef: MatDialogRef<ShowPreferencesComponent>,
    @Inject(MAT_DIALOG_DATA) public preferences: any
  ) {}

  ngOnInit() {
    // console.log(this.preferences);
  }
  onNoClick(): void {
    this.dialogRef.close("closed");
  }
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      this.preferences = event.container.data;
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
  getUrl() {
    return "/student" + "/preferences/" + localStorage.getItem("id");
  }
  savePreferences() {
    this.projectService.storeStudentPreferences(this.preferences);
    this.dialogRef.close("saved");
  }
}
