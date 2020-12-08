import { UserService } from 'src/app/services/user/user.service';
import { Component, Input, OnChanges, OnDestroy, OnInit, Pipe, PipeTransform, SimpleChanges, } from '@angular/core';

@Pipe({
    name: 'countdown',
})
export class CountDown implements PipeTransform {
    transform(value, now) {
        let str = '';
        const currentTime = now.getTime();
        const endTime = value.getTime();
        const distance = endTime - currentTime; // ms of difference
        let days, hrs, mins, seconds;
        if (distance > 0) {
            days = Math.floor(distance / (1000 * 60 * 60 * 24));
            hrs = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            str +=
                days == 0
                    ? ''
                    : days > 9
                    ? days + ' days '
                    : '0' + days + (days == 1 ? ' day ' : ' days ');
            str +=
                hrs == 0
                    ? ''
                    : hrs > 9
                    ? hrs + ' hours '
                    : '0' + hrs + (hrs == 1 ? ' hour ' : ' hours ');
            str +=
                mins == 0
                    ? ''
                    : mins > 9
                    ? mins + ' minutes '
                    : '0' + mins + (mins == 1 ? ' minute ' : ' minutes ');
        } else {
            days = 0;
            hrs = 0;
            mins = 0;
        }
        if (days == 0 && hrs == 0 && mins == 0) {
            return 'This stage has ended.';
        }
        return str;
    }
}

@Component({
    selector: 'app-timeline',
    templateUrl: './timeline.component.html',
    styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements OnInit, OnChanges, OnDestroy {
    @Input() program;
    admins: any;
    check: boolean = false;
    startCompleted: boolean;
    stageOneCompleted: boolean;
    stageTwoCompleted: boolean;
    stageThreeCompleted: boolean;
    stageFourCompleted: boolean;
    curDeadline: Date;
    startDate: Date;
    dates: Date[] = [];
    stage: number = 0;
    stageOne: number;
    stageTwo: number;
    stageThree: number;
    stageFour: number;
    message: String;
    currentTime: Date = new Date();
    next: String;
    icon;
    displayTimeline: boolean;
    loaded: boolean = false;
    styles;
    timer;
    @Input() clone;

    constructor(
        private userService: UserService
    ) {
    }

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
        this.userService.getAllAdminDetails().subscribe(result => {
            if (result['message'] == 'success' && result['result'] && result['result'][this.program]) {
                this.displayTimeline = true;
                this.admins = result['result'][this.program];
                if (this.admins.startDate) {
                    this.stage = this.admins.stage;
                    this.startDate = new Date(this.admins.startDate);
                    if (this.admins.deadlines.length - 1 < this.stage) {
                        this.curDeadline = null;
                    } else {
                        this.curDeadline = new Date(this.admins.deadlines[this.admins.deadlines.length - 1]);
                    }
                    this.dates = this.admins.deadlines.map(val => new Date(val));
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
                        default:
                            this.message = null;
                            this.next = null;
                            break;

                    }
                }
                this.loaded = true;
            } else {
                this.displayTimeline = false;
            }
        });
        // if (localStorage.getItem('role') == 'student') {
        //     this.icon = {
        //         float: 'left',
        //         'margin-top.%': '3',
        //         left: '0',
        //     };
        //     this.styles = {
        //         'margin-left.%': '0',
        //     };
        //     this.userService.getAllAdminDetails().subscribe((result) => {
        //         if (result['message'] == 'success') {
        //             this.admins = result['result'][this.program];
        //             if (result['result'] && result['result'][this.program]) {
        //                 this.displayTimeline = true;
        //                 if (this.admins.startDate) {
        //                     this.curDeadline = new Date(
        //                         this.admins.deadlines[this.admins.deadlines.length - 1]
        //                     );
        //                     this.startDate = new Date(this.admins.startDate);
        //                     this.startCompleted = true;
        //                     this.dates = [];
        //                     this.stage = this.admins.stage;
        //                     for (let i = 0; i <= this.stage; i++) {
        //                         this.dates.push(new Date(this.admins['deadlines'][i]));
        //                         if (this.stage == 0 && i == 0) {
        //                             this.message = 'Faculties add projects during this period';
        //                             this.next =
        //                                 'You have to fill in your preferences during this period';
        //                             const now = new Date();
        //                             this.stageOne =
        //                                 Math.abs(now.getTime() - this.startDate.getTime()) /
        //                                 Math.abs(
        //                                     this.dates[0].getTime() - this.startDate.getTime()
        //                                 );
        //                             this.stageOne = this.stageOne * 100;
        //                             if (this.stageOne >= 100) {
        //                                 this.stageOneCompleted = true;
        //                             }
        //                         }
        //                         if (this.stage == 1 && i == 1) {
        //                             this.message =
        //                                 'Student have to fill in their preferences during this period';
        //                             this.next =
        //                                 'Faculties start giving their preferences of students for their projects';
        //                             this.stageOneCompleted = true;
        //                             this.stageOne = 100;
        //                             const now = new Date();
        //                             this.stageTwo =
        //                                 Math.abs(now.getTime() - this.dates[0].getTime()) /
        //                                 Math.abs(this.dates[1].getTime() - this.dates[0].getTime());
        //                             this.stageTwo *= 100;
        //                             if (this.stageTwo >= 100) {
        //                                 this.stageTwo = 100;
        //                                 this.stageTwoCompleted = true;
        //                             }
        //                             if (now.getTime() < this.dates[0].getTime()) {
        //                                 this.stageTwo = 0;
        //                                 this.stageTwoCompleted = false;
        //                             }
        //                         }
        //                         if (this.stage == 2 && i == 2) {
        //                             this.message =
        //                                 'Faculties start giving their preferences of students for their projects';
        //                             this.next =
        //                                 'Project allocation will be done within this period';
        //                             this.stageOneCompleted = true;
        //                             this.stageOne = 100;
        //                             this.stageTwoCompleted = true;
        //                             this.stageTwo = 100;
        //                             const now = new Date();
        //                             this.stageThree =
        //                                 Math.abs(now.getTime() - this.dates[1].getTime()) /
        //                                 Math.abs(this.dates[2].getTime() - this.dates[1].getTime());
        //                             this.stageThree *= 100;
        //                             if (this.stageThree >= 100) {
        //                                 this.stageThree = 100;
        //                                 this.stageThreeCompleted = true;
        //                             }
        //                             if (now.getTime() < this.dates[1].getTime()) {
        //                                 this.stageThree = 0;
        //                                 this.stageThreeCompleted = false;
        //                             }
        //                         }
        //                         if (this.stage == 3 && i + 1 == 4) {
        //                             this.message =
        //                                 'Project allocation will be done within this period';
        //                             this.next = null;
        //                             this.stageThreeCompleted = true;
        //                             this.stageThree = 100;
        //                             this.stageOneCompleted = true;
        //                             this.stageOne = 100;
        //                             this.stageTwoCompleted = true;
        //                             this.stageTwo = 100;
        //                             const now = new Date();
        //                             this.stageFour =
        //                                 Math.abs(now.getTime() - this.dates[2].getTime()) /
        //                                 Math.abs(this.dates[3].getTime() - this.dates[2].getTime());
        //                             this.stageFour *= 100;
        //                             if (this.stageFour >= 100) {
        //                                 this.stageFour = 100;
        //                                 this.stageFourCompleted = true;
        //                             }
        //                             if (now.getTime() < this.dates[2].getTime()) {
        //                                 this.stageFour = 0;
        //                                 this.stageFourCompleted = false;
        //                             }
        //                         }
        //                         if (this.stage == 4 && i == 4) {
        //                             this.message = null;
        //                             this.next = null;
        //                             this.stageThreeCompleted = true;
        //                             this.stageThree = 100;
        //                             this.stageOneCompleted = true;
        //                             this.stageOne = 100;
        //                             this.stageTwoCompleted = true;
        //                             this.stageTwo = 100;
        //                             this.stageFourCompleted = true;
        //                             this.stageFour = 100;
        //                             this.displayTimeline = false;
        //                         }
        //                     }
        //                 } else {
        //                     this.displayTimeline = false;
        //                 }
        //             } else {
        //                 this.displayTimeline = false;
        //             }
        //         }
        //         this.loadingBar.stop();
        //         this.loaded = true;
        //     });
        // } else {
        //     this.icon = {
        //         float: 'left',
        //         'margin-top.%': '2.8',
        //         left: '0',
        //     };
        //     this.styles = {
        //         'margin-top.%': '8',
        //         'margin-left.%': '30',
        //     };
        //     this.userService.getAllAdminDetails().subscribe((result) => {
        //         if (result['message'] == 'success') {
        //             if (result['result'] && result['result'][this.program]) {
        //                 this.displayTimeline = true;
        //                 this.admins = result['result'][this.program];
        //                 if (this.admins.startDate) {
        //                     this.curDeadline = new Date(
        //                         this.admins.deadlines[this.admins.deadlines.length - 1]
        //                     );
        //                     this.startDate = new Date(this.admins.startDate);
        //                     this.startCompleted = true;
        //                     this.stage = this.admins.stage;
        //                     this.dates = [];
        //                     for (let i = 0; i <= this.stage; i++) {
        //                         this.dates.push(new Date(this.admins['deadlines'][i]));
        //                         if (this.stage == 0 && i == 0) {
        //                             const now = new Date();
        //                             this.message = 'Faculties add projects during this period';
        //                             this.next =
        //                                 'Student have to fill in their preferences during this period';
        //                             this.stageOne =
        //                                 Math.abs(now.getTime() - this.startDate.getTime()) /
        //                                 Math.abs(
        //                                     this.dates[0].getTime() - this.startDate.getTime()
        //                                 );
        //                             this.curDeadline = moment(this.curDeadline).toDate();
        //                             this.stageOne = this.stageOne * 100;
        //                             if (this.stageOne >= 100) {
        //                                 this.stageOne = 100;
        //                                 this.stageOneCompleted = true;
        //                             }
        //                         }
        //                         if (this.stage == 1 && i == 1) {
        //                             this.stageOneCompleted = true;
        //                             this.stageOne = 100;
        //                             this.message =
        //                                 'Student have to fill in their preferences during this period';
        //                             this.next =
        //                                 'Faculties start giving their preferences of students for their projects';
        //                             this.stageOneCompleted = true;
        //                             const now = new Date();
        //                             this.stageTwo =
        //                                 Math.abs(now.getTime() - this.dates[0].getTime()) /
        //                                 Math.abs(this.dates[1].getTime() - this.dates[0].getTime());
        //                             this.stageTwo *= 100;
        //                             if (this.stageTwo >= 100) {
        //                                 this.stageTwo = 100;
        //                                 this.stageTwoCompleted = true;
        //                             }
        //                             if (now.getTime() < this.dates[0].getTime()) {
        //                                 this.stageTwo = 0;
        //                                 this.stageTwoCompleted = false;
        //                             }
        //                         }
        //                         if (this.stage == 2 && i == 2) {
        //                             this.stageOneCompleted = true;
        //                             this.stageOne = 100;
        //                             this.message =
        //                                 'Faculties start giving their preferences of students for their projects';
        //                             this.next =
        //                                 'Project allocation will be done within this period';
        //                             this.stageTwoCompleted = true;
        //                             this.stageTwo = 100;
        //                             const now = new Date();
        //                             this.stageThree =
        //                                 Math.abs(now.getTime() - this.dates[1].getTime()) /
        //                                 Math.abs(this.dates[2].getTime() - this.dates[1].getTime());
        //                             this.stageThree *= 100;
        //                             if (this.stageThree >= 100) {
        //                                 this.stageThree = 100;
        //                                 this.stageThreeCompleted = true;
        //                             }
        //                             if (now.getTime() < this.dates[1].getTime()) {
        //                                 this.stageThree = 0;
        //                                 this.stageThreeCompleted = false;
        //                             }
        //                         }
        //
        //                         if (this.stage == 3 && i + 1 == 4) {
        //                             this.stageThreeCompleted = true;
        //                             this.stageThree = 100;
        //                             this.message =
        //                                 'Project allocation will be done within this period';
        //                             this.next = null;
        //                             this.stageOneCompleted = true;
        //                             this.stageOne = 100;
        //                             this.stageTwoCompleted = true;
        //                             this.stageTwo = 100;
        //                             const now = new Date();
        //                             this.stageFour =
        //                                 Math.abs(now.getTime() - this.dates[2].getTime()) /
        //                                 Math.abs(this.dates[3].getTime() - this.dates[2].getTime());
        //                             this.stageFour *= 100;
        //                             if (this.stageFour >= 100) {
        //                                 this.stageFour = 100;
        //                                 this.stageFourCompleted = true;
        //                             }
        //                             if (now.getTime() < this.dates[1].getTime()) {
        //                                 this.stageFour = 0;
        //                                 this.stageFourCompleted = false;
        //                             }
        //                         }
        //                         if (this.stage == 4 && i == 4) {
        //                             this.stageThreeCompleted = true;
        //                             this.stageThree = 100;
        //                             this.stageOneCompleted = true;
        //                             this.stageOne = 100;
        //                             this.stageTwoCompleted = true;
        //                             this.stageTwo = 100;
        //                             this.stageFourCompleted = true;
        //                             this.stageFour = 100;
        //                             this.displayTimeline = false;
        //                         }
        //                     }
        //                 }
        //             } else {
        //                 this.displayTimeline = false;
        //             }
        //         }
        //         this.loadingBar.stop();
        //         this.loaded = true;
        //     });
        // }
    }

    refresh(program) {
        this.program = program.short;
        this.ngOnInit();
    }

    ngOnDestroy() {
        clearInterval(this.timer);
    }
}
