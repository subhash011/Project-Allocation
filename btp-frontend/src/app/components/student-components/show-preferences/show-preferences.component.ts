import { MatSnackBar } from "@angular/material/snack-bar";
import { LoginComponent } from "./../../shared/login/login.component";
import { ProjectsService } from "src/app/services/projects/projects.service";
import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import {
  transferArrayItem,
  CdkDragDrop,
  moveItemInArray,
} from "@angular/cdk/drag-drop";

@Component({
  selector: "app-show-preferences",
  templateUrl: "./show-preferences.component.html",
  styleUrls: ["./show-preferences.component.scss"],
  providers: [LoginComponent],
})
export class ShowPreferencesComponent implements OnInit {
  preferenceArray: string[];
  helperArray: string[];
  constructor(
    private projectService: ProjectsService,
    public dialogRef: MatDialogRef<ShowPreferencesComponent>,
    @Inject(MAT_DIALOG_DATA) public preferences: any,
    private loginObject: LoginComponent,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {}
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
    this.projectService
      .storeStudentPreferences(this.preferences)
      .toPromise()
      .then((res) => {
        return res["message"];
      })
      .catch((err) => {
        this.dialogRef.close("failed");
      })
      .then((message) => {
        if (message == "success") {
          this.dialogRef.close("success");
        } else if (message == "invalid-token") {
          this.dialogRef.close("invalid-token");
          this.loginObject.signOut();
          this.snackBar.open("Please Sign In Again", "OK", {
            duration: 3000,
          });
        } else {
          this.dialogRef.close("error");
        }
      });
  }
}
