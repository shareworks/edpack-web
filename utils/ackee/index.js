import * as ackeeTracker from './tracker'

import config from 'config'
import store from '../../store'
import { router } from '../../../router'

const graphqlQuery = {
  records: () => {
    const props = 'id'
    const query = `query getRecords { records { ${props} } }`
    return { query }
  },

  facts: () => {
    const props = 'activeVisitors '
    const query = `query Domain($id: ID!, $organization: ID) { domain(id: $id) { facts(organization: $organization) { ${props} } }}`
    const variables = { 'id': config.ackee.domain_id, 'organization': store.state?.user?.organization?._id || '' }
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

  const options ={ ...config?.ackee?.options, organization: store?.state?.user?.organization?._id }
  ackeeTracker.create(config.ackee.api_url, options).record(config.ackee.domain_id)
}

const request = (type) => {
  const headers = { headers: { Authorization: `Bearer ${config.ackee.token}` } }
  const query = graphqlQuery[type]();

  return router.app.$http.post(`${config.ackee.api_url}api`, query, headers)
}

export default {
  canTrack,
  canRequest,
  track,
  request
}
