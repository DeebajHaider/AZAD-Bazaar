import client from './client'

const customerService = {
  getCustomer: async (id) => {
    const resp = await client.get(`/customers/${id}`)
    return resp.data
  },

  updateCustomer: async (id, payload) => {
    // payload can include name and address or addresses
    const resp = await client.put(`/customers/${id}`, payload)
    return resp.data
  },

  // Address management
  getAddresses: async () => {
    const resp = await client.get('/addresses')
    return resp.data.addresses || []
  },

  addAddress: async (payload) => {
    const resp = await client.post('/addresses', payload)
    return resp.data.addresses || []
  },

  updateAddress: async (payload) => {
    const resp = await client.put('/addresses', payload)
    return resp.data.addresses || []
  },

  deleteAddress: async (payload) => {
    const resp = await client.delete('/addresses', { data: payload })
    return resp.data.addresses || []
  }
}

export default customerService
