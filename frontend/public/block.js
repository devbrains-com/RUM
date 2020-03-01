var sleep = function (time) {
    var now = new Date().getTime();
    while (new Date().getTime() < now + time) {
        /* do nothing; this will exit once it reached the time limit */
        /* if you want you could do something and exit*/
        /* mostly I prefer to use this */
    }
};
sleep(2000);
