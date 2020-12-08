1. If you want to make it quick and easy just run the filereplace.sh script in the btp-frontend folder and make sure
   that the file is executable before running it.

If you are on windows and cant execute the script, the follow the upcoming instructions.

1. Replacing the ngx-countdown-timer. Go to `btp-frontend\node_modules\ngx-countdown-timer`, Here two files are to be
   changed.

    1. index.js --- Copy the content in the index.js file of Replacements folder and replace the index.js of
       ngx-countdown-timer with the copied content.
    2. ngx-countdown-timer.umd.js --- Copy then content in ngx-countdown-timer.umd.js file of Replacements folder and
       replace the ngx-countdown-timer.umd.js of ngx-countdown-timer with the copied content.

2. Replacing the angular-typing-animation. Go to `btp-frontend\node_modules\angular-typing-animation`, Here two files
   have to be replaced
    1. typing-animation.directive.d.ts --- Copy the content in the typing-animation.directive.d.ts file of Replacements
       folder and replace the typing-animation.directive.d.ts of angular-typing-animation with the copied content.
    2. typing-animation.directive.js --- Copy the content in the typing-animation.directive.js file of Replacements
       folder and replace the typing-animation.directive.js of angular-typing-animation with the copied content.
