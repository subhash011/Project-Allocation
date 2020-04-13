import { UserService } from "./services/user/user.service";
import { Component, OnInit } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  title = "btp-frontend";
  login = true;
  maps: any = [];
  branches: any = [];
  constructor() {}
  ngOnInit() {}
}
