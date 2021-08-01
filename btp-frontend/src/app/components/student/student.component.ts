import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {forkJoin, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {UserService} from 'src/app/services/user/user.service';
import {LoaderComponent} from 'src/app/components/shared/loader/loader.component';
import {HttpResponseAPI} from 'src/app/models/HttpResponseAPI';

@Component({
    selector: 'app-student',
    templateUrl: './student.component.html',
    styleUrls: ['./student.component.scss'],
    providers: []
})
export class StudentComponent implements OnInit, OnDestroy {
    dialogRefLoad: any;
    details: any;
    loaded = false;
    publishStudents: boolean;
    publishFaculty: boolean;
    reviewCondition: boolean;
    private ngUnsubscribe: Subject<any> = new Subject();

    constructor(
        private userService: UserService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) {
    }

    ngOnInit() {
        this.dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: 'Loading, Please wait! ...',
            disableClose: true,
            panelClass: 'transparent'
        });
        const user = JSON.parse(localStorage.getItem('user'));
        const requests = [
            this.userService.getStudentDetails(user.id).pipe(takeUntil(this.ngUnsubscribe)),
            this.userService.getPublishMode('student').pipe(takeUntil(this.ngUnsubscribe))
        ];
        forkJoin(requests).subscribe((response: Array<HttpResponseAPI>) => {
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
        }, () => {
            this.dialogRefLoad.close();
        });
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}
