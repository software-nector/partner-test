import api from './api'

export const productService = {
    // Public Endpoints
    getProducts: async () => {
        return api.get('/products')
    },

    getProduct: async (id) => {
        return api.get(`/products/${id}`)
    },

    // QR Resolution
    resolveQR: async (code) => {
        return api.get(`/qr/${code}`)
    },

    // Admin Endpoints
    admin: {
        listCompanies: async () => {
            return api.get('/admin/catalog/companies')
        },
        createCompany: async (data) => {
            return api.post('/admin/catalog/companies', data)
        },
        listProducts: async () => {
            return api.get('/admin/catalog/products')
        },
        createProduct: async (data) => {
            return api.post('/admin/catalog/products', data)
        },
        updateProduct: async (id, data) => {
            return api.put(`/admin/catalog/products/${id}`, data)
        },
        generateQR: async (productId) => {
            return api.post(`/admin/catalog/products/${productId}/generate-qr`)
        },
        generateBulkQR: async (productId, quantity) => {
            return api.post(`/admin/catalog/products/${productId}/generate-bulk?quantity=${quantity}`)
        },
        getProductQRs: async (productId) => {
            return api.get(`/admin/catalog/products/${productId}/qr-codes`)
        }
    }
}
