import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
    selector: 'app-help',
    templateUrl: './help.component.html',
    styleUrls: ['./help.component.scss'],
})
export class HelpComponent implements OnInit {
    @ViewChild('helpvid') help: ElementRef;
    @ViewChild('helpvidsa') helpsa: ElementRef;
    @ViewChild('helpvidad') helpad: ElementRef;
    background = 'primary';
    index;
    role: string = localStorage.getItem('role');

    constructor() {
    }

    ngOnInit() {
        this.role = localStorage.getItem('role');
    }

    gotost(i) {
        const video = this.help.nativeElement;
        if (i == 1) {
            video.currentTime = 0;
        } else if (i == 2) {
            video.currentTime = 25;
        } else {
            video.currentTime = 53;
        }
    }

    gotosa(i) {
        const video = this.helpsa.nativeElement;
        if (i == 1) {
            video.currentTime = 0;
        } else if (i == 2) {
            video.currentTime = 31;
        } else if (i == 3) {
            video.currentTime = 56;
        } else {
            video.currentTime = 67;
        }
    }

    gotofa(i) {
        const video = this.helpsa.nativeElement;
        if (i == 1) {
            video.currentTime = 0;
        } else if (i == 2) {
            video.currentTime = 31;
        } else if (i == 3) {
            video.currentTime = 55;
        } else if (i == 4) {
            video.currentTime = 109;
        } else {
            video.currentTime = 147;
        }
    }

    gotoad(i) {
        const video = this.helpad.nativeElement;
        if (i == 1) {
            video.currentTime = 0;
        } else if (i == 2) {
            video.currentTime = 113;
        } else if (i == 3) {
            video.currentTime = 211;
        } else {
            video.currentTime = 194;
        }
    }

    isStudent() {
        return localStorage.getItem('role') == 'student' ? true : false;
    }

    isFaculty() {
        return localStorage.getItem('role') == 'faculty' ||
        localStorage.getItem('role') == 'admin'
            ? true
            : false;
    }

    isSuperAdmin() {
        return localStorage.getItem('role') == 'super_admin' ? true : false;
    }
}
