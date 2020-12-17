import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: [ "./app.component.scss" ]
})
export class AppComponent implements OnInit {
    title = "btp-frontend";
    login = true;
    maps: any = [];
    branches: any = [];

    constructor(private router: Router) {}

    ngOnInit() {
        if (localStorage.getItem("isLoggedIn") == "false") {
            this.router.navigate([ "" ]);
        }
    }
}
