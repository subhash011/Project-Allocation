import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProjectsService } from 'src/app/services/projects/projects.service';
import { LoaderComponent } from 'src/app/components/shared/loader/loader.component';
import { LoginComponent } from 'src/app/components/shared/login/login.component';
import { NavbarComponent } from 'src/app/components/shared/navbar/navbar.component';

@Component({
    selector: 'app-display-preferences',
    templateUrl: './display-preferences.component.html',
    styleUrls: ['./display-preferences.component.scss'],
})
export class DisplayPreferencesComponent implements OnInit, OnDestroy {
    @Input() preferences: any = [];
    @Output() updateProjects = new EventEmitter<any>();
    @Input() stage: number = 0;
    isActive: boolean = false;
    indexHover: number = -1;
    private ngUnsubscribe: Subject<any> = new Subject();

    constructor(
        private projectService: ProjectsService,
        private loginObject: LoginComponent,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private navbar: NavbarComponent
    ) {
    }

    ngOnInit() {
    }

    removeOnePreference(preference) {
        const dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: 'Removing Preference, Please wait ...',
            disableClose: true,
            hasBackdrop: true,
        });
        this.projectService
            .removeOneStudentPreference(preference)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (result) => {
                    dialogRefLoad.close();
                    if (result['message'] == 'invalid-token') {
                        this.navbar.role = 'none';
                        this.snackBar.open('Session Expired! Please Sign In Again', 'OK', {
                            duration: 3000,
                        });
                        this.loginObject.signOut();
                    } else if (result['message'] == 'success') {
                        this.preferences = this.preferences.filter((val) => {
                            return val._id != preference._id;
                        });
                        this.updateProjects.emit(preference);
                    } else if (result['message'] == 'stage-ended') {
                        this.snackBar.open(
                            'Stage has ended! You cannot edit preferences anymore',
                            'Ok',
                            {duration: 3000}
                        );
                    } else if (result['message'] == 'stage-not-started') {
                        this.snackBar.open(
                            'You cannot edit preferences till the next stage',
                            'Ok',
                            {duration: 3000}
                        );
                    }
                },
                () => {
                    dialogRefLoad.close();
                    this.snackBar.open(
                        'Some Error Occured! Please re-authenticate.',
                        'OK',
                        {
                            duration: 3000,
                        }
                    );
                    this.navbar.role = 'none';
                    this.loginObject.signOut();
                }
            );
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
