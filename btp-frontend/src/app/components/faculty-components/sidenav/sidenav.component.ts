import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ProjectsService } from "src/app/services/projects/projects.service";
import { LoaderComponent } from "src/app/components/shared/loader/loader.component";
import { NavbarComponent } from "src/app/components/shared/navbar/navbar.component";
import { LoginComponent } from "src/app/components/shared/login/login.component";
import { HttpResponseAPI } from "src/app/models/HttpResponseAPI";

@Component({
    selector: "app-sidenav", templateUrl: "./sidenav.component.html", styleUrls: [ "./sidenav.component.scss" ]
})
export class SidenavComponent implements OnInit, OnChanges {
    @Input() public projects;
    @Input() public empty: boolean;
    @Input() public programs;
    @Input() public routeParams;
    @Input() public adminStage;
    @Output() projectClicked = new EventEmitter<Event>();
    @Output() addButton = new EventEmitter<Event>();
    public selectedRow;
    selectedProjects: string[] = [];

    constructor(
        private router: Router,
        private projectService: ProjectsService,
        private snackbar: MatSnackBar,
        private dialog: MatDialog,
        private navbar: NavbarComponent,
        private loginObject: LoginComponent
    ) {}

    ngOnChanges(simpleChanges: SimpleChanges) {
        if (simpleChanges.projects && simpleChanges.projects.currentValue) {
            simpleChanges.projects.currentValue.forEach((val) => {
                if (val.isIncluded) {
                    this.selectedProjects.push(val._id);
                }
            });
        }
    }

    ngOnInit() {}

    displayAdd(event) {
        this.addButton.emit(event);
        this.empty = false;
        this.selectedRow = null;
    }

    addToList(event) {
        if (event.checked) {
            this.selectedProjects.push(event.source.id);
        } else {
            this.selectedProjects = this.selectedProjects.filter((val) => val != event.source.id);
        }
    }

    includeProjects() {
        const dialogRef = this.dialog.open(LoaderComponent, {
            data: "Updating, Please wait ...", disableClose: true, panelClass: "transparent"
        });
        this.projectService.includeProjects(this.selectedProjects).subscribe((responseAPI: HttpResponseAPI) => {
            dialogRef.close();
            if (responseAPI.result.updated) {
                for (const project of this.projects) {
                    project.isIncluded = this.selectedProjects.indexOf(project._id) != -1;
                }
                this.snackbar.open("Updated Project Preferences", "Ok");
            }
        }, () => {
            this.snackbar.open("Some Error Occurred! Please re-authenticate.", "OK");
            this.navbar.role = "none";
            this.loginObject.signOut();
        });
    }

    onClick(project, index) {
        this.projectClicked.emit(project);
        this.empty = false;
        this.selectedRow = index;
    }

    displayHome() {
        let id = localStorage.getItem("id");
        this.router
            .navigateByUrl("/refresh", {skipLocationChange: true})
            .then(() => {
                this.router
                    .navigate([
                        "/faculty", id
                    ], {
                        queryParams: {
                            name: this.routeParams.name, abbr: this.routeParams.abbr, mode: "programMode"
                        }
                    })
                    .then(() => {});
            });
    }
}
