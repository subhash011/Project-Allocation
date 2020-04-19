import { Directive, ElementRef, Input, Output, EventEmitter, } from '@angular/core';
import { Typed } from './typed';
import { Observable } from 'rxjs';
var TypingAnimationDirective = /** @class */ (function() {
    function TypingAnimationDirective(elRef) {
        this.elRef = elRef;
        this.typeSpeed = 0;
        this.startDelay = 0;
        this.condition = true;
        this.hideCursorOnComplete = false;
        this.complete = new EventEmitter();
        this.typingLock = false;
    }
    TypingAnimationDirective.prototype.ngOnInit = function() {
        if (!this.checkContent()) {
            return;
        }
        this.createTyped();
    };
    TypingAnimationDirective.prototype.ngAfterViewInit = function() {
        var _this = this;
        if (this.typed) {
            return;
        }
        if (!this.checkContent()) {
            this.contentObservable = new Observable(function(ob) {
                if (_this.checkContent()) {
                    ob.next(_this.elRef.nativeElement.textContent.trim());
                    ob.complete();
                }
            });
            this.contentSubscription = this.contentObservable.subscribe(function(content) {
                _this.createTyped();
                _this.contentSubscription.unsubscribe();
            });
            return;
        }
        this.createTyped();
    };
    TypingAnimationDirective.prototype.ngOnChanges = function(changes) {
        if (('condition' in changes) && this.typed) {
            if (this.typingLock) {
                return;
            }
            if (this.condition) {
                this.typed.begin();
                this.typingLock = true;
            }
        }
    };
    TypingAnimationDirective.prototype.checkContent = function() {
        return this.elRef.nativeElement.textContent.trim().length > 0;
    };
    TypingAnimationDirective.prototype.createTyped = function() {
        var _this = this;
        this.typed = new Typed(this.elRef.nativeElement, {
            typeSpeed: this.typeSpeed,
            startDelay: this.startDelay,
            condition: this.condition,
            hideCursorOnComplete: this.hideCursorOnComplete,
            onComplete: function() {
                _this.complete.emit(null);
                _this.typingLock = false;
            }
        });
        if (this.condition) {
            this.typed.begin();
            this.typingLock = true;
        }
    };
    TypingAnimationDirective.decorators = [{
        type: Directive,
        args: [{
            selector: '[typingAnimation]'
        }, ]
    }, ];
    /** @nocollapse */
    TypingAnimationDirective.ctorParameters = function() {
        return [
            { type: ElementRef, },
        ];
    };
    TypingAnimationDirective.propDecorators = {
        'typeSpeed': [{ type: Input, args: ['typeSpeed', ] }, ],
        'startDelay': [{ type: Input, args: ['startDelay', ] }, ],
        'condition': [{ type: Input, args: ['condition', ] }, ],
        'hideCursorOnComplete': [{ type: Input, args: ['hideCursorOnComplete', ] }, ],
        'complete': [{ type: Output, args: ['complete', ] }, ],
    };
    return TypingAnimationDirective;
}());
export { TypingAnimationDirective };
//# sourceMappingURL=typing-animation.directive.js.map