/**
 * Helpfull Resouces
 * - https://developers.google.com/web/fundamentals/performance/navigation-and-resource-timing
 * - https://w3c.github.io/navigation-timing/#dom-performancenavigationtiming
 * - https://www.w3.org/TR/navigation-timing/
 */
var rumTracking = {
    endpoint: 'http://wsmichi:3001/beacon',
    beacon: { entries: [] }
};
var interestingEntryTypes = [
    'mark',
    'paint',
    // 'longtask', -> Could be interesting to detect heacy scripts
    'largest-contentful-paint'
];
var initBeacon = function () {
    rumTracking.beacon = { ua: navigator.userAgent, entries: [] };
};
var hasBeaconData = function (beacon) {
    if (!beacon.nav && beacon.entries.length === 0) {
        return false;
    }
    return true;
};
/** Fetch method to send the beacon */
var sendBeaconFetch = function (beacon) {
    if (!hasBeaconData(beacon)) {
        return;
    }
    console.log('send beacon', beacon);
    var request = new XMLHttpRequest();
    request.open('POST', rumTracking.endpoint);
    request.send(JSON.stringify(beacon));
    // fetch(rumTracking.endpoint, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'text/plain'
    //   },
    //   body: JSON.stringify(beacon)
    // }).then(res => console.log('status result', res.status))
};
var sendBeaconNavigator = function () {
    if (!hasBeaconData(rumTracking.beacon)) {
        return;
    }
    // Check for sendBeacon support
    if ('sendBeacon' in navigator) {
        if (navigator.sendBeacon(rumTracking.endpoint, JSON.stringify(rumTracking.beacon))) {
            // sendBeacon worked! We're good!
            console.log('beacon successfully queued');
        }
    }
};
var spaRouteChange = function () {
    var beacon = rumTracking.beacon;
    initBeacon();
    if (supportPerformance) {
        performance.clearMarks();
        performance.clearMeasures();
        performance.clearResourceTimings();
    }
    var sendBeaconFn = function () { return sendBeaconFetch(beacon); };
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(sendBeaconFn);
    }
    else {
        setTimeout(sendBeaconFn);
    }
};
if ('requestIdleCallback' in window) {
    window.requestIdleCallback(function () {
        return console.log('idle callback', rumTracking.beacon.entries);
    });
}
// Init first beacon
initBeacon();
var supportPerformaneObserver = 'performance' in window && 'PerformanceObserver' in window;
var supportPerformance = !!performance;
console.log('support', supportPerformaneObserver, supportPerformance);
// Instantiate Performance Observer if supporter and listen for events
if (supportPerformaneObserver) {
    var perfObserver = new PerformanceObserver(function (list) {
        var entries = list.getEntries();
        // Iterate over entries
        for (var i = 0; i < entries.length; i++) {
            rumTracking.beacon.entries.push(entries[i]);
            console.log(entries[i].name || entries[i].entryType, entries[i].duration || entries[i].startTime);
        }
    });
    var entryTypesToUse = void 0;
    if ('supportedEntryTypes' in PerformanceObserver) {
        entryTypesToUse = PerformanceObserver.supportedEntryTypes.filter(function (n) {
            return interestingEntryTypes.indexOf(n) !== -1;
        });
    }
    else {
        entryTypesToUse = interestingEntryTypes;
    }
    // Run the observer
    perfObserver.observe({
        entryTypes: entryTypesToUse
    });
    // Queue last beacon on unload (only necessary if Performance Observer is supported)
    window.addEventListener('unload', sendBeaconNavigator, false);
}
// Read Navigation Timing onload
window.onload = function () {
    // Make sure to read the data after the onload event, otherwise some information may not be present
    setTimeout(function () {
        if (supportPerformance) {
            var navTimings = performance.getEntriesByType('navigation');
            if (navTimings.length > 0) {
                var pageNav = navTimings[0];
                rumTracking.beacon.nav = pageNav;
                // Send the beacon now if Performance Observer is not supported (no more timings are coming)
                if (!supportPerformaneObserver) {
                    sendBeaconFetch(rumTracking.beacon);
                }
            }
        }
        console.log('beacon', rumTracking.beacon);
    });
};
