import { MatSnackBar } from "@angular/material/snack-bar";
import { LoginComponent, LoginModule } from "src/app/components/shared/login/login.component";
import { UserService } from "src/app/services/user/user.service";
import { Router, RouterModule } from "@angular/router";
import { Component, NgModule, OnInit } from "@angular/core";
import { StorageService } from "src/app/services/helpers/storage.service";
import { HttpResponseAPI } from "src/app/models/HttpResponseAPI";
import { CommonModule } from "@angular/common";
import { PipeModule } from "src/app/components/shared/Pipes/pipe.module";
import { MaterialModule } from "src/app/material/material.module";
import { ThemePickerModule } from "src/app/components/shared/theme-picker/theme-picker.component";

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
        private router: Router,
        private userService: UserService,
        private login: LoginComponent,
        private snackBar: MatSnackBar,
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
        this.router.navigate([ "/admin", id ]);
    }

    goToHome() {
        let id = localStorage.getItem("id");
        this.router.navigate([ decodeURI("/faculty/" + id) ]);
        // this.router
        //     .navigateByUrl("/refresh", {
        //         skipLocationChange: true
        //     })
        //     .then(() => {
        //         this.ngOnInit();
        //         this.router.navigate([ decodeURI("/faculty/" + id) ]);
        //     });
    }

    goToProgram(program) {
        let id = localStorage.getItem("id");
        this.router.navigate([ "/faculty", id ], {
            queryParams: {
                abbr: program.short,
                mode: "programMode"
            }
        });
        // this.router
        //     .navigateByUrl("/refresh", {skipLocationChange: true})
        //     .then(() => {
        //         this.router.navigate([
        //             "/faculty",
        //             id
        //         ], {
        //             queryParams: {
        //                 abbr: program.short,
        //                 mode: "programMode"
        //             }
        //         });
        //     });
    }

    changeRole() {
        this.role = localStorage.getItem("role");
    }
}

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        PipeModule,
        MaterialModule,
        LoginModule,
        ThemePickerModule
    ],
    declarations: [
        NavbarComponent
    ],
    exports: [
        NavbarComponent
    ]
})
export class NavbarModule {}
