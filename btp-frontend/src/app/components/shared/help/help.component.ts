import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Pipe,
  PipeTransform,
} from "@angular/core";

@Pipe({
  name: "isFaculty",
})
export class FacultyCheck implements PipeTransform {
  transform(value) {
    return value == "faculty";
  }
}

@Pipe({
  name: "isAdmin",
})
export class AdminCheck implements PipeTransform {
  transform(value) {
    return value == "admin";
  }
}

@Pipe({
  name: "isStudent",
})
export class StudentCheck implements PipeTransform {
  transform(value) {
    return value == "student";
  }
}

@Pipe({
  name: "isSuper",
})
export class SuperAdminCheck implements PipeTransform {
  transform(value) {
    return value == "super_admin";
  }
}

@Component({
  selector: "app-help",
  templateUrl: "./help.component.html",
  styleUrls: ["./help.component.scss"],
})
export class HelpComponent implements OnInit {
  @ViewChild("helpvid", { static: false }) help: ElementRef;
  @ViewChild("helpvidsa", { static: false }) helpsa: ElementRef;
  @ViewChild("helpvidad", { static: false }) helpad: ElementRef;
  constructor() {}
  background = "primary";
  index;
  role: string = localStorage.getItem("role");
  ngOnInit() {
    this.role = localStorage.getItem("role");
  }
  gotost(i) {
    const video = this.help.nativeElement;
    if (i == 1) {
      video.currentTime = 0;
    } else if (i == 2) {
      video.currentTime = 27;
    } else {
      video.currentTime = 58;
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
      video.currentTime = 26;
    } else if (i == 3) {
      video.currentTime = 51;
    } else if (i == 4) {
      video.currentTime = 101;
    } else {
      video.currentTime = 128;
    }
  }

  gotoad(i) {
    const video = this.helpad.nativeElement;
    if (i == 1) {
      video.currentTime = 0;
    } else if (i == 2) {
      video.currentTime = 112;
    } else if (i == 3) {
      video.currentTime = 162;
    } else {
      video.currentTime = 194;
    }
  }

  isStudent() {
    return localStorage.getItem("role") == "student" ? true : false;
  }

  isFaculty() {
    return localStorage.getItem("role") == "faculty" ||
      localStorage.getItem("role") == "admin"
      ? true
      : false;
  }

  isSuperAdmin() {
    return localStorage.getItem("role") == "super_admin" ? true : false;
  }
}
