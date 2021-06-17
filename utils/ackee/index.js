import * as ackeeTracker from './tracker'

import config from 'config'
import store from '../../store'
import { router } from '../../../router'

const graphqlQuery = {
  records: () => {
    const props = 'id organization created updated'
    const query = `query getRecords { records { ${props} } }`
    return { query }
  },

  facts: (opts) => {
    const ranged = !!(opts.minDate || opts.maxDate)

    const activeVisitors = 'activeVisitors(organization: $organization)'
    const averageViews = 'averageViews(organization: $organization, minDate: $minDate, maxDate: $maxDate)'
    const averageDuration = 'averageDuration(organization: $organization, minDate: $minDate, maxDate: $maxDate)'
    const viewsToday = 'viewsToday(organization: $organization)'
    const viewsMonth = 'viewsMonth(organization: $organization)'
    const viewsYear = 'viewsYear(organization: $organization)'
    const views = 'views(organization: $organization, minDate: $minDate, maxDate: $maxDate)'

    const props = `${activeVisitors} ${averageViews} ${averageDuration} ${viewsToday} ${viewsMonth} ${viewsYear}`
    const rangedProps = `${averageViews} ${averageDuration} ${views}`

    const query = `query Domain($id: ID!, $organization: ID, $minDate: DateTime, $maxDate: DateTime) { domain(id: $id) { facts { ${ranged ? rangedProps : props}  } }  }`
    const variables = {
      id: config.ackee.domain_id,
      ...opts.organization && { organization: opts.organization },
      ...opts.minDate && { minDate: opts.minDate },
      ...opts.maxDate && { maxDate: opts.maxDate }
    }
    return { query, variables }
  },

  statistics: (opts) => {
    const views = 'views(organization: $organization,interval: DAILY, type: UNIQUE, minDate: $minDate, maxDate: $maxDate) { id count }'
    const durations = 'durations(organization: $organization,interval: DAILY, minDate: $minDate, maxDate: $maxDate) { id count }'
    const pages = 'pages(organization: $organization,range: LAST_7_DAYS, limit: 30, sorting: TOP, minDate: $minDate, maxDate: $maxDate) { id count created }'
    const referrers = 'referrers(organization: $organization,range: LAST_7_DAYS, limit: 30, sorting: TOP, type: WITH_SOURCE, minDate: $minDate, maxDate: $maxDate) { id count created }'

    const props = `${views} ${durations} ${pages} ${referrers}`

    const query = `query Domain($id: ID!, $organization: ID, $minDate: DateTime, $maxDate: DateTime) { domain(id: $id) { statistics { ${props} }  }}`
    const variables = {
      id: config.ackee.domain_id,
      ...opts.organization && { organization: opts.organization },
      ...opts.minDate && { minDate: opts.minDate },
      ...opts.maxDate && { maxDate: opts.maxDate }
    }
    return { query, variables }
  }
}

const canTrack = () => {
  const enabledTracking = !!config?.ackee?.enabledTracking
  const hasApiUrl = !!config?.ackee?.api_url
  const hasDomainId = !!config?.ackee?.domain_id

  return enabledTracking && hasApiUrl && hasDomainId
}

const canRequest = () => {
  const hasToken = !!config?.ackee?.token
  const hasApiUrl = !!config?.ackee?.api_url
  const hasDomainId = !!config?.ackee?.domain_id

  return hasToken && hasApiUrl && hasDomainId
}

const track = () => {
  if (!config?.ackee?.enabledTracking) return

  const options = { ...config?.ackee?.options, organization: store?.state?.user?.organization?._id }
  ackeeTracker.create(config.ackee.api_url, options).record(config.ackee.domain_id)
}

const request = (type, opts = {}) => {
  const headers = { headers: { Authorization: `Bearer ${config.ackee.token}` } }
  const query = graphqlQuery[type](opts)

  return router.app.$http.post(`${config.ackee.api_url}api`, query, headers)
}

export default {
  canTrack,
  canRequest,
  track,
  request
}
