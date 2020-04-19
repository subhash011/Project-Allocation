import {
  OnInit,
  OnChanges,
  ElementRef,
  EventEmitter,
  SimpleChanges,
  AfterViewInit,
} from "@angular/core";
import { Typed } from "./typed";
import { Observable } from "rxjs";
import { Subscription } from "rxjs";
export declare class TypingAnimationDirective
  implements OnInit, OnChanges, AfterViewInit {
  private elRef;
  typed: Typed;
  typeSpeed: number;
  startDelay: number;
  condition: boolean;
  hideCursorOnComplete: boolean;
  complete: EventEmitter<null>;
  typingLock: boolean;
  contentObservable: Observable<string>;
  contentSubscription: Subscription;
  constructor(elRef: ElementRef);
  ngOnInit(): void;
  ngAfterViewInit(): void;
  ngOnChanges(changes: SimpleChanges): void;
  private checkContent();
  private createTyped();
}
