import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {finalize} from 'rxjs/operators';
import {ProjectsService} from 'src/app/services/projects/projects.service';
import {LoaderComponent} from 'src/app/components/shared/loader/loader.component';
import {HttpResponseAPI} from 'src/app/models/HttpResponseAPI';

@Component({
    selector: 'app-display-preferences',
    templateUrl: './display-preferences.component.html',
    styleUrls: ['./display-preferences.component.scss']
})
export class DisplayPreferencesComponent implements OnInit {
    @Input() preferences: any = [];
    @Output() updateProjects = new EventEmitter<any>();
    @Input() stage = 0;
    isActive = false;
    indexHover = -1;
    dialogRefLoad: MatDialogRef<any>;

    constructor(
        private projectService: ProjectsService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) {
    }

    closeDialog = finalize(() => this.dialogRefLoad.close());

    ngOnInit() {
    }

    removeOnePreference(preference) {
        this.dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: 'Removing Preference, Please wait ...',
            disableClose: true,
            panelClass: 'transparent'
        });
        this.projectService
            .removeOneStudentPreference(preference)
            .pipe(this.closeDialog)
            .subscribe((responseAPI: HttpResponseAPI) => {
                if (responseAPI.result.updated) {
                    this.preferences = this.preferences.filter((val) => {
                        return val._id !== preference._id;
                    });
                    this.updateProjects.emit(preference);
                } else {
                    this.snackBar.open(responseAPI.message, 'Ok');
                }
            });
    }
}
