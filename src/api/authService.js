import client from './client'

const authService = {
  requestOtp: async (phone, isNewUser = false) => {
    const resp = await client.post('/auth/request-otp', { phone, isNewUser })
    return resp.data
  },

  // verifyOtp accepts optional profile object which will be forwarded to the server
  verifyOtp: async (phone, code, profile = null) => {
    const body = { phone, code }
    if (profile) {
      // allow name, address, lat, lng
      const { name, address, lat, lng } = profile
      if (name) body.name = name
      if (address) body.address = address
      if (typeof lat !== 'undefined') body.lat = lat
      if (typeof lng !== 'undefined') body.lng = lng
    }
    const resp = await client.post('/auth/verify-otp', body)
    return resp.data
  },

  me: async () => {
    const resp = await client.get('/auth/me')
    return resp.data
  },

  createCustomer: async (payload) => {
    const resp = await client.post('/customers', payload)
    return resp.data
  }
}

export default authService
