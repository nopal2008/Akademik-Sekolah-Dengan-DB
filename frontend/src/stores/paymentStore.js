import { defineStore } from 'pinia';
import api from '../services/api';

export const usePaymentStore = defineStore('payment', {
  state: () => ({
    payments: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchPayments() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get('/payments');
        this.payments = response.data?.data || response.data || [];
        return this.payments;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async createPayment(paymentData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post('/payments', paymentData);
        await this.fetchPayments();
        return response.data;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updatePayment(id, paymentData, config = {}) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.put(`/payments/${id}`, paymentData, config);
        await this.fetchPayments();
        return response.data;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deletePayment(id) {
      this.loading = true;
      this.error = null;
      try {
        await api.delete(`/payments/${id}`);
        await this.fetchPayments();
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
