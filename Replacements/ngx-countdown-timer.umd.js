(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common')) :
        typeof define === 'function' && define.amd ? define(['exports', '@angular/core', '@angular/common'], factory) :
        (factory((global['ngx-countdown-timer'] = {}), global.core, global.common));
}(this, (function(exports, core, common) {
    'use strict';

    var CountdownTimer = (function() {
        /**
         * @param {?} el
         */
        function CountdownTimer(el) {
            this.el = el;
            this.zeroTrigger = new core.EventEmitter(true);
        }
        /**
         * @return {?}
         */
        CountdownTimer.prototype.ngOnInit = function() {
            var _this = this;
            this.timer = setInterval(function() {
                if (_this.start) {
                    _this.displayTime = _this.getTimeDiff(_this.start, true);
                } else {
                    _this.displayTime = _this.getTimeDiff(_this.end);
                }
            }, 1000);
        };
        /**
         * @return {?}
         */
        CountdownTimer.prototype.ngOnDestroy = function() {
            this.stopTimer();
        };
        /**
         * @param {?} datetime
         * @param {?=} useAsTimer
         * @return {?}
         */
        CountdownTimer.prototype.getTimeDiff = function(datetime, useAsTimer) {
            if (useAsTimer === void 0) { useAsTimer = false; }
            datetime = new Date(datetime).getTime();
            var /** @type {?} */ now = new Date().getTime();
            if (isNaN(datetime)) {
                return "";
            }
            var /** @type {?} */ milisec_diff = datetime - now;
            if (useAsTimer) {
                milisec_diff = now - datetime;
            }
            // Zero Time Trigger
            if (milisec_diff <= 0) {
                this.zeroTrigger.emit("reached zero");
                return "00 days, 00 hours, 00 minutes, 00 seconds";
            }
            var /** @type {?} */ days = Math.floor(milisec_diff / 1000 / 60 / (60 * 24));
            var /** @type {?} */ date_diff = new Date(milisec_diff);
            var /** @type {?} */ day_string = (days) ? this.twoDigit(days) + (this.twoDigit(days) == 1 ? " day, " : " days, ") : "";
            var /** @type {?} */ day_hours = days * 24;
            if (this.timeOnly) {
                var /** @type {?} */ hours = date_diff.getUTCHours() + day_hours;
                return this.twoDigit(hours) +
                    (this.twoDigit(hours) == 1 ? " hour, " : " hours, ") + this.twoDigit(date_diff.getMinutes()) + (this.twoDigit(date_diff.getMinutes()) == 1 ? " minute " : " minutes "); // +
                // this.twoDigit(date_diff.getSeconds()) + (this.twoDigit(date_diff.getSeconds()) == 1 ? " second, " : " seconds");
            } else {
                // Date() takes a UTC timestamp – getHours() gets hours in local time not in UTC. therefore we have to use getUTCHours()
                return day_string + this.twoDigit(date_diff.getUTCHours()) +
                    (this.twoDigit(date_diff.getUTCHours()) == 1 ? " hour, " : " hours, ") + this.twoDigit(date_diff.getMinutes()) + (this.twoDigit(date_diff.getMinutes()) == 1 ? " minute " : " minutes "); // +
                // this.twoDigit(date_diff.getSeconds()) + (this.twoDigit(date_diff.getSeconds()) == 1 ? " second, " : " seconds");
            }
        };
        /**
         * @param {?} number
         * @return {?}
         */
        CountdownTimer.prototype.twoDigit = function(number) {
            return number > 9 ? "" + number : "0" + number;
        };
        /**
         * @return {?}
         */
        CountdownTimer.prototype.stopTimer = function() {
            clearInterval(this.timer);
            this.timer = undefined;
        };
        return CountdownTimer;
    }());
    CountdownTimer.decorators = [{
        type: core.Component,
        args: [{
            selector: 'countdown-timer',
            template: "{{ displayTime }}"
        }, ]
    }, ];
    /**
     * @nocollapse
     */
    CountdownTimer.ctorParameters = function() {
        return [
            { type: core.ElementRef, },
        ];
    };
    CountdownTimer.propDecorators = {
        'start': [{ type: core.Input }, ],
        'end': [{ type: core.Input }, ],
        'zeroTrigger': [{ type: core.Output }, ],
        'timeOnly': [{ type: core.Input }, ],
    };

    var CountdownTimerModule = (function() {
        function CountdownTimerModule() {}
        /**
         * @return {?}
         */
        CountdownTimerModule.forRoot = function() {
            return {
                ngModule: CountdownTimerModule
            };
        };
        return CountdownTimerModule;
    }());
    CountdownTimerModule.decorators = [{
        type: core.NgModule,
        args: [{
            imports: [
                common.CommonModule
            ],
            declarations: [
                CountdownTimer,
            ],
            exports: [
                CountdownTimer
            ]
        }, ]
    }, ];
    /**
     * @nocollapse
     */
    CountdownTimerModule.ctorParameters = function() { return []; };

    exports.CountdownTimerModule = CountdownTimerModule;
    exports.CountdownTimer = CountdownTimer;

    Object.defineProperty(exports, '__esModule', { value: true });

})));