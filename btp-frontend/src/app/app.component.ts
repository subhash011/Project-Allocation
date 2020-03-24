import { Component, OnInit } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  title = "btp-frontend";
  login = true;
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {}
  ngOnInit() {
    this.matIconRegistry.addSvgIcon(
      "iit_pkd",
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        "../../../../../../images/IITPKD_Logo.svg"
      )
    );
  }
}
