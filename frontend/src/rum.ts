/**
 * Helpfull Resouces
 * - https://developers.google.com/web/fundamentals/performance/navigation-and-resource-timing
 * - https://w3c.github.io/navigation-timing/#dom-performancenavigationtiming
 * - https://www.w3.org/TR/navigation-timing/
 */

interface Window {
  requestIdleCallback: (callback: () => void) => void
}

interface IBeacon {
  ua?: string
  nav?: PerformanceNavigationTiming
  entries: PerformanceEntryList
}

interface IRumTracking {
  endpoint: string
  beacon: IBeacon
}

const rumTracking: IRumTracking = {
  endpoint: 'http://wsmichi:3001/beacon',
  beacon: { entries: [] }
}

const interestingEntryTypes = [
  'mark',
  'paint',
  // 'longtask', -> Could be interesting to detect heacy scripts
  'largest-contentful-paint'
]

const initBeacon = () => {
  rumTracking.beacon = { ua: navigator.userAgent, entries: [] }
}

const hasBeaconData = (beacon: IBeacon) => {
  if (!beacon.nav && beacon.entries.length === 0) {
    return false
  }

  return true
}

/** Fetch method to send the beacon */
const sendBeaconFetch = (beacon: IBeacon) => {
  if (!hasBeaconData(beacon)) {
    return
  }

  console.log('send beacon', beacon)

  var request = new XMLHttpRequest()
  request.open('POST', rumTracking.endpoint)
  request.send(JSON.stringify(beacon))

  // fetch(rumTracking.endpoint, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'text/plain'
  //   },
  //   body: JSON.stringify(beacon)
  // }).then(res => console.log('status result', res.status))
}

const sendBeaconNavigator = () => {
  if (!hasBeaconData(rumTracking.beacon)) {
    return
  }

  // Check for sendBeacon support
  if ('sendBeacon' in navigator) {
    if (
      navigator.sendBeacon(
        rumTracking.endpoint,
        JSON.stringify(rumTracking.beacon)
      )
    ) {
      // sendBeacon worked! We're good!
      console.log('beacon successfully queued')
    }
  }
}

const spaRouteChange = () => {
  const beacon = rumTracking.beacon
  initBeacon()
  if (supportPerformance) {
    performance.clearMarks()
    performance.clearMeasures()
    performance.clearResourceTimings()
  }

  const sendBeaconFn = () => sendBeaconFetch(beacon)

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(sendBeaconFn)
  } else {
    setTimeout(sendBeaconFn)
  }
}

if ('requestIdleCallback' in window) {
  window.requestIdleCallback(() =>
    console.log('idle callback', rumTracking.beacon.entries)
  )
}

// Init first beacon
initBeacon()

const supportPerformaneObserver =
  'performance' in window && 'PerformanceObserver' in window
const supportPerformance = !!performance

console.log('support', supportPerformaneObserver, supportPerformance)

// Instantiate Performance Observer if supporter and listen for events
if (supportPerformaneObserver) {
  var perfObserver = new PerformanceObserver(list => {
    var entries = list.getEntries()

    // Iterate over entries
    for (var i = 0; i < entries.length; i++) {
      rumTracking.beacon.entries.push(entries[i])
      console.log(
        entries[i].name || entries[i].entryType,
        entries[i].duration || entries[i].startTime
      )
    }
  })

  let entryTypesToUse: string[]

  if ('supportedEntryTypes' in PerformanceObserver) {
    entryTypesToUse = PerformanceObserver.supportedEntryTypes.filter(n => {
      return interestingEntryTypes.indexOf(n) !== -1
    })
  } else {
    entryTypesToUse = interestingEntryTypes
  }

  // Run the observer
  perfObserver.observe({
    entryTypes: entryTypesToUse
  })

  // Queue last beacon on unload (only necessary if Performance Observer is supported)
  window.addEventListener('unload', sendBeaconNavigator, false)
}

// Read Navigation Timing onload
window.onload = () => {
  // Make sure to read the data after the onload event, otherwise some information may not be present
  setTimeout(() => {
    if (supportPerformance) {
      const navTimings = performance.getEntriesByType('navigation')

      if (navTimings.length > 0) {
        const pageNav = navTimings[0]

        rumTracking.beacon.nav = pageNav as PerformanceNavigationTiming

        // Send the beacon now if Performance Observer is not supported (no more timings are coming)
        if (!supportPerformaneObserver) {
          sendBeaconFetch(rumTracking.beacon)
        }
      }
    }

    console.log('beacon', rumTracking.beacon)
  })
}
