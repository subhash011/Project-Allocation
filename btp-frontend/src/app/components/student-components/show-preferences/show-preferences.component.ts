import { UserService } from "./../../../services/user/user.service";
import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-show-preferences",
  templateUrl: "./show-preferences.component.html",
  styleUrls: ["./show-preferences.component.scss"]
})
export class ShowPreferencesComponent implements OnInit {
  constructor(
    private userService: UserService,
    public dialogRef: MatDialogRef<ShowPreferencesComponent>,
    @Inject(MAT_DIALOG_DATA) public preferences: any
  ) {}

  ngOnInit() {}
  onNoClick(): void {
    this.dialogRef.close();
  }
  getUrl() {
    return "/student/" + localStorage.getItem("id") + "/preferences";
  }
  savePreferences() {
    //code to save preferences
  }
}
