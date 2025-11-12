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
  }
}

export default customerService
