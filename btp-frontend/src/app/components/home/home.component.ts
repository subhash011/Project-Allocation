import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import Typewriter from "t-writer.js";

@Component({
    selector: "app-home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit, AfterViewInit {
    message = "";
    toType: boolean = false;

    @ViewChild("head", { static: false }) head;
    @ViewChild("subhead", { static: false }) subhead;

    constructor(private httpClient: HttpClient, private router: Router) {}

    ngAfterViewInit() {
        const headTarget = this.head.nativeElement;
        const subheadTarget = this.subhead.nativeElement;

        const headWriter = new Typewriter(headTarget, {
            loop: false,
            typeSpeed: 80,
            typeColor: "white",
            cursorColor: "white",
            animateCursor: false,
        });

        const subheadWriter = new Typewriter(subheadTarget, {
            loop: false,
            typeSpeed: 80,
            typeColor: "white",
            cursorColor: "white",
            animateCursor: false,
        });

        headWriter
            .type("Project Allocation Portal")
            .removeCursor()
            .then(subheadWriter.start.bind(subheadWriter))
            .start();
        subheadWriter.type("Project allocation made easy.").removeCursor();
    }

    ngOnInit() {
        if (localStorage.getItem("isLoggedIn") == "true") {
            let position = localStorage.getItem("role");
            if (position == "admin") {
                position = "faculty";
            }
            this.router.navigate([position + "/" + localStorage.getItem("id")]);
        }
    }

    onComplete() {
        this.toType = true;
        this.message = "Project allocation made easy.";
    }
}
