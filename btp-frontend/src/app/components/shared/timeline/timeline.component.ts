import {UserService} from 'src/app/services/user/user.service';
import {Component, Input, NgModule, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {HttpResponseAPI} from 'src/app/models/HttpResponseAPI';
import {MaterialModule} from 'src/app/material/material.module';
import {PipeModule} from 'src/app/components/shared/Pipes/pipe.module';
import {CommonModule} from '@angular/common';

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
    startCompleted: boolean;
    stageOneCompleted: boolean;
    stageTwoCompleted: boolean;
    stageThreeCompleted: boolean;
    stageFourCompleted: boolean;
    curDeadline: Date;
    startDate: Date;
    dates: Date[] = [];
    stage = 0;
    stageOne: number;
    stageTwo: number;
    stageThree: number;
    stageFour: number;
    message;
    currentTime: Date = new Date();
    next;
    icon;
    displayTimeline: boolean;
    loaded = false;
    styles;
    timer;

    constructor(private userService: UserService) {
    }

    // TODO this is called twice in the student component, check why
    ngOnChanges(changes: SimpleChanges) {
        this.program = changes.program.currentValue;
        this.ngOnInit();
    }

    initialize() {
        this.stageOne = 0;
        this.stageTwo = 0;
        this.stageThree = 0;
        this.stageFour = 0;
        this.startCompleted = false;
        this.stageOneCompleted = false;
        this.stageTwoCompleted = false;
        this.stageThreeCompleted = false;
        this.stageFourCompleted = false;
    }

    ngOnInit() {
        this.timer = setInterval(() => {
            this.currentTime = new Date();
        }, 60000);
        this.initialize();
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

    refresh(program) {
        this.program = program.short;
        this.ngOnInit();
    }

    ngOnDestroy() {
        clearInterval(this.timer);
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
