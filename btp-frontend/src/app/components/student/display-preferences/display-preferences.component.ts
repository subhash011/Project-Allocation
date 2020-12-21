import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ProjectsService } from "src/app/services/projects/projects.service";
import { LoaderComponent } from "src/app/components/shared/loader/loader.component";
import { HttpResponseAPI } from "src/app/models/HttpResponseAPI";

@Component({
    selector: "app-display-preferences",
    templateUrl: "./display-preferences.component.html",
    styleUrls: [ "./display-preferences.component.scss" ]
})
export class DisplayPreferencesComponent implements OnInit, OnDestroy {
    @Input() preferences: any = [];
    @Output() updateProjects = new EventEmitter<any>();
    @Input() stage: number = 0;
    isActive: boolean = false;
    indexHover: number = -1;
    dialogRefLoad: MatDialogRef<any>;
    private ngUnsubscribe: Subject<any> = new Subject();

    constructor(
        private projectService: ProjectsService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) {}

    ngOnInit() {}

    removeOnePreference(preference) {
        this.dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: "Removing Preference, Please wait ...",
            disableClose: true,
            panelClass: "transparent"
        });
        this.projectService
            .removeOneStudentPreference(preference)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((responseAPI: HttpResponseAPI) => {
                this.dialogRefLoad.close();
                if (responseAPI.result.updated) {
                    this.preferences = this.preferences.filter((val) => {
                        return val._id != preference._id;
                    });
                    this.updateProjects.emit(preference);
                } else {
                    this.snackBar.open(responseAPI.message, "Ok");
                }
            }, () => {
                this.dialogRefLoad.close();
            });
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
