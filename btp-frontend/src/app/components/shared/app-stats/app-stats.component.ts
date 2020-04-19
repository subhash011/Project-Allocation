import { UserService } from "src/app/services/user/user.service";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-app-stats",
  templateUrl: "./app-stats.component.html",
  styleUrls: ["./app-stats.component.scss"],
})
export class AppStatsComponent implements OnInit {
  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService
      .getCompleteDetails()
      .toPromise()
      .then((result) => {
        //do it here
      });
  }
}
