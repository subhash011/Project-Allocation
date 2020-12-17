import { MatSnackBar } from "@angular/material/snack-bar";
import { LoginComponent } from "src/app/components/shared/login/login.component";
import { UserService } from "src/app/services/user/user.service";
import { Router } from "@angular/router";
import { Component, OnInit, Pipe, PipeTransform } from "@angular/core";
import { StorageService } from "src/app/services/helpers/storage.service";
import { HttpResponseAPI } from "src/app/models/HttpResponseAPI";

@Pipe({
    name: "checkRegister"
})
export class CheckRegister implements PipeTransform {
    transform(value) {
        const role = localStorage.getItem("role");
        return (role == "faculty" || role == "admin" || role == "student" || role == "super_admin");
    }
}

@Pipe({
    name: "links"
})
export class GetLinksForNavBar implements PipeTransform {
    transform(value, role) {
        role = role == "admin" ? "faculty" : role;
        if (value == "profile") {
            return "profile/" + localStorage.getItem("id");
        } else if (value == "home") {
            if (localStorage.getItem("role") == "admin") {
                return "faculty" + "/" + localStorage.getItem("id");
            } else {
                return role + "/" + localStorage.getItem("id");
            }
        } else if (value == "studentProjects") {
            return role + "/projects/" + localStorage.getItem("id");
        } else if (value == "studentPreferences") {
            return "student" + "/preferences/" + localStorage.getItem("id");
        }
    }
}

@Component({
    selector: "app-navbar",
    templateUrl: "./navbar.component.html",
    styleUrls: [ "./navbar.component.scss" ],
    providers: [ LoginComponent ]
})
export class NavbarComponent implements OnInit {
    programsVisible: boolean = false;
    role: string = localStorage.getItem("role");
    programs;
    adminProgram;
    curRole;
    badge: number = 0;

    constructor(
        private router: Router, private userService: UserService, private login: LoginComponent, private snackBar: MatSnackBar,
        private storageService: StorageService
    ) {}

    ngOnInit() {
        this.storageService.watchStorage().subscribe((data: string) => {
            if (data == "isLoggedIn") {
                this.role = localStorage.getItem("role");
            }
        });
        if (localStorage.getItem("isLoggedIn") == "true") {
            this.role = localStorage.getItem("role");
        }
        if ((this.role == "faculty" || this.role == "admin") && localStorage.getItem("isLoggedIn") == "true") {
            this.userService.getFacultyPrograms().subscribe((responseAPI: HttpResponseAPI) => {
                this.programs = responseAPI.result.programs;
                if (this.programs.length > 0) {
                    this.programsVisible = true;
                }
            });
        }
    }

    getAdmin() {
        let id = localStorage.getItem("id");
        this.router.navigate([
            "/admin",
            id
        ]);
    }

    goToHome() {
        let id = localStorage.getItem("id");
        this.router
            .navigateByUrl("/refresh", {
                skipLocationChange: true
            })
            .then(() => {
                this.ngOnInit();
                this.router.navigate([ decodeURI("/faculty/" + id) ]);
            });
    }

    goToProgram(program) {
        let id = localStorage.getItem("id");
        this.router
            .navigateByUrl("/refresh", {skipLocationChange: true})
            .then(() => {
                this.router.navigate([
                    "/faculty",
                    id
                ], {
                    queryParams: {
                        abbr: program.short,
                        mode: "programMode"
                    }
                });
            });
    }

    changeRole() {
        this.role = localStorage.getItem("role");
    }
}
