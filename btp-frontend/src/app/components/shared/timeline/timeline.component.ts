import {UserService} from 'src/app/services/user/user.service';
import {Component, Input, NgModule, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {HttpResponseAPI} from 'src/app/models/HttpResponseAPI';
import {MaterialModule} from 'src/app/material/material.module';
import {PipeModule} from 'src/app/components/shared/Pipes/pipe.module';
import {CommonModule} from '@angular/common';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-timeline',
    templateUrl: './timeline.component.html',
    styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit, OnChanges, OnDestroy {
    @Input() program;
    @Input() clone;
    admins: any;
    check = false;
    curDeadline: Date;
    startDate: Date;
    dates: Date[] = [];
    stage = 0;
    message;
    currentTime: Date = new Date();
    next;
    displayTimeline: boolean;
    loaded = false;
    timer: Subject<any> = new Subject();

    constructor(private userService: UserService) {
    }

    // TODO this is called twice in the student component, check why
    ngOnChanges(changes: SimpleChanges) {
        this.program = changes.program.currentValue;
        this.ngOnInit();
    }

    ngOnInit() {
        interval(60000)
            .pipe(takeUntil(this.timer))
            .subscribe(() => {
            this.currentTime = new Date();
        });
        this.userService.getAllAdminDetails().subscribe((responseAPI: HttpResponseAPI) => {
            this.displayTimeline = true;
            this.admins = responseAPI.result.admins[this.program];
            if (!this.admins) {
                this.loaded = true;
                return;
            }
            if (this.admins.startDate) {
                this.stage = this.admins.stage;
                this.startDate = new Date(this.admins.startDate);
                if (this.admins.deadlines.length - 1 < this.stage) {
                    this.curDeadline = null;
                } else {
                    this.curDeadline = new Date(this.admins.deadlines[this.admins.deadlines.length - 1]);
                }
                this.dates = this.admins.deadlines.map((val) => new Date(val));
                switch (this.stage) {
                    case 0:
                        this.message = 'Faculties add projects during this period';
                        this.next = 'You have to fill in your preferences during this period';
                        break;
                    case 1:
                        this.message = 'Student have to fill in their preferences during this period';
                        this.next = 'Faculties start giving their preferences of students for their projects';
                        break;
                    case 2:
                        this.message = 'Faculties start giving their preferences of students for their projects';
                        this.next = 'Project allocation will be done within this period';
                        break;
                    case 3:
                        this.message = 'Project allocation will be done within this period';
                        this.next = null;
                        break;
                    case 4:
                        this.stage = 3;
                        this.message = null;
                        this.next = null;
                        break;
                }
            }
            this.loaded = true;
        }, () => {
            this.displayTimeline = false;
            this.loaded = true;
        });
    }

    ngOnDestroy() {
        this.timer.next();
        this.timer.complete();
    }
}

@NgModule({
    declarations: [
        TimelineComponent
    ],
    imports: [
        CommonModule,
        MaterialModule,
        PipeModule
    ],
    exports: [
        TimelineComponent
    ]
})
export class TimelineModule {
}
