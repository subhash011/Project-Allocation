import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";

@Component({
  selector: "app-help",
  templateUrl: "./help.component.html",
  styleUrls: ["./help.component.scss"],
})
export class HelpComponent implements OnInit {
  @ViewChild('helpvid',{static:false}) help : ElementRef
  @ViewChild('helpvidsa',{static:false}) helpsa : ElementRef
  constructor() {}
  background = "primary";
  ngOnInit() {}
  gotost(i){
    const video = this.help.nativeElement;
    if(i == 1){
      video.currentTime = 0;
    } else if(i == 2){
      video.currentTime = 27;
    } else {
      video.currentTime = 58;
    }
  }
  gotosa(i){
    const video = this.helpsa.nativeElement;
    if(i == 1){
      video.currentTime = 0;
    } else if(i == 2){
      video.currentTime = 31;
    } else if(i == 3) {
      video.currentTime = 56;
    } else {
      video.currentTime = 67;
    }
  }

  gotofa(i){
    const video = this.helpsa.nativeElement;
    if(i == 1){
      video.currentTime = 0;
    } else if(i == 2){
      video.currentTime = 26;
    } else if(i == 3) {
      video.currentTime = 51;
    } 
    else if(i==4){
      video.currentTime=101;
    }
    else {
      video.currentTime = 128;
    }
  }

  gotoad(i){
    const video = this.helpsa.nativeElement;
    if(i == 1){
      video.currentTime = 0;
    } else if(i == 2){
      video.currentTime = 91;
    } else if(i == 3) {
      video.currentTime = 104;
    } 
    else {
      video.currentTime = 137;
    }
  }




}