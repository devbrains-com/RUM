import uaParser from 'ua-parser-js'

interface IBeacon {
  ua: object
  nav?: PerformanceNavigationTiming
}

interface IRumEntry {
  type?: string
  ua?: string
  dns?: number
  connect?: number
  tls?: number
  backend?: number
  download?: number
  fetchTime?: number
  size?: number
  frontend?: number
  ttfb?: number
  fp?: number
  fcp?: number
  lcp?: number
  pageLoad?: number
}

export const parseBeacon = (beacon: IBeacon) => {
  const data: IRumEntry = {}

  const pageNav = beacon.nav

  data.ua = uaParser(beacon.ua)

  if (pageNav) {
    // Checked Data
    // ----------------------------------

    data.type = pageNav.type

    data.dns = pageNav.domainLookupEnd - pageNav.domainLookupStart

    data.connect = pageNav.connectEnd - pageNav.connectStart

    data.fetchTime = pageNav.responseEnd - pageNav.fetchStart

    // Did any TLS stuff happen?
    if (pageNav.secureConnectionStart > 0) {
      // Awesome! Calculate it!
      data.tls = pageNav.connectEnd - pageNav.secureConnectionStart
    }

    // Backend time
    data.backend = pageNav.responseStart - pageNav.connectEnd

    // Response time only (download)
    data.download = pageNav.responseEnd - pageNav.responseStart

    // Transfer Size (Byte)
    data.size = pageNav.transferSize

    // Time to First Byte (TTFB)
    data.ttfb = pageNav.responseStart - pageNav.fetchStart

    // Frontend time
    data.frontend = pageNav.domInteractive - pageNav.responseEnd

    // Page Load time
    data.pageLoad = pageNav.domInteractive - pageNav.fetchStart

    // Experimental Data
    // ----------------------------------
  }
  return data
}
