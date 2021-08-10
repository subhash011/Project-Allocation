import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {forkJoin, Subject} from 'rxjs';
import {finalize, takeUntil} from 'rxjs/operators';
import {UserService} from 'src/app/services/user/user.service';
import {LoaderComponent} from 'src/app/components/shared/loader/loader.component';
import {HttpResponseAPI} from 'src/app/models/HttpResponseAPI';

@Component({
    selector: 'app-student',
    templateUrl: './student.component.html',
    styleUrls: ['./student.component.scss'],
    providers: []
})
export class StudentComponent implements OnInit {
    dialogRefLoad: any;
    details: any;
    loaded = false;
    publishStudents: boolean;
    publishFaculty: boolean;
    reviewCondition: boolean;

    constructor(
        private userService: UserService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) {
    }

    closeDialog = finalize(() => this.dialogRefLoad.close());

    ngOnInit() {
        this.dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: 'Loading, Please wait! ...',
            disableClose: true,
            panelClass: 'transparent'
        });
        const id = localStorage.getItem('id');
        const requests = [
            this.userService.getStudentDetails(id),
            this.userService.getPublishMode('student')
        ];
        forkJoin(requests)
            .pipe(this.closeDialog)
            .subscribe((response: Array<HttpResponseAPI>) => {
                const studentResponse = response[0];
                const publishResponse = response[1];
                this.details = studentResponse.result.student;
                this.publishFaculty = publishResponse.result.publishFaculty;
                this.publishStudents = publishResponse.result.publishStudents;
                if (!this.publishStudents && this.publishFaculty) {
                    this.reviewCondition = true;
                }
                this.loaded = true;
                this.dialogRefLoad.close();
            });
    }
}
