<template>
  <div class="payments-view">
    <PageHeader title="Administrasi & Pembayaran" subtitle="Lihat tagihan sekolah, uang SPP, dan riwayat transaksi keuangan.">
      <template #actions v-if="authStore.isAdmin">
        <BaseButton variant="primary" @click="openCreateModal">
          <span style="font-size: 16px;">💳</span> Tagih Invoice SPP
        </BaseButton>
      </template>
    </PageHeader>

    <!-- Financial Aggregates -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div class="card p-6 flex justify-between items-center bg-danger-light" style="border-left: 4px solid var(--color-danger)">
        <div>
          <h4 class="text-xs font-semibold uppercase text-danger-dark">Tagihan Belum Dibayar</h4>
          <h2 class="mt-1 text-danger-dark font-bold text-2xl">{{ formatRupiah(unpaidTotal) }}</h2>
        </div>
        <div style="font-size: 32px;">💸</div>
      </div>
      <div class="card p-6 flex justify-between items-center bg-success-light" style="border-left: 4px solid var(--color-success)">
        <div>
          <h4 class="text-xs font-semibold uppercase text-success-dark">Total Pembayaran Lunas</h4>
          <h2 class="mt-1 text-success-dark font-bold text-2xl">{{ formatRupiah(paidTotal) }}</h2>
        </div>
        <div style="font-size: 32px;">💳</div>
      </div>
    </div>

    <!-- Payments DataTable -->
    <div class="card p-6">
      <DataTable
        :columns="columns"
        :items="paymentStore.payments"
        :loading="paymentStore.loading"
      >
        <template #cell-student="{ item }">
          {{ item.Student?.name || item.student?.name || '-' }}
        </template>
        <template #cell-amount="{ item }">
          <span class="font-semibold">{{ formatRupiah(item.amount) }}</span>
        </template>
        <template #cell-due_date="{ item }">
          {{ formatDate(item.due_date) }}
        </template>
        <template #cell-status="{ item }">
          <BadgeStatus :type="getStatusType(item.status)">
            {{ item.status }}
          </BadgeStatus>
        </template>
        <template #cell-receipt_url="{ item }">
          <a
            v-if="item.receipt_url"
            :href="item.receipt_url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-600 hover:underline"
          >
            Lihat
          </a>
          <span v-else>-</span>
        </template>
        <template #cell-actions="{ item }">
          <div class="action-buttons flex gap-2">
            <button
              v-if="authStore.isAdmin && item.status !== 'Lunas'"
              class="btn btn-primary btn-sm"
              @click="markAsPaid(item)"
              :disabled="updatingStatusId === item.id"
            >
              Set Lunas
            </button>
            <button
              v-if="!authStore.isAdmin && item.status !== 'Lunas'"
              class="btn btn-primary btn-sm"
              @click="openPaymentModal(item)"
            >
              Bayar Sekarang
            </button>
            <button
              v-if="authStore.isAdmin"
              class="btn btn-danger btn-sm"
              @click="confirmDelete(item)"
            >
              Hapus
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Create Invoice Modal (Admin) -->
    <ModalDialog :show="showFormModal" title="Buat Tagihan Pembayaran Baru" @close="closeFormModal">
      <form @submit.prevent="saveInvoice" class="invoice-form">
        <!-- Student Selector -->
        <div class="form-group">
          <label for="student_id" class="form-label">Siswa Penerima Tagihan</label>
          <select id="student_id" v-model="form.student_id" class="form-control" required>
            <option value="" disabled>Pilih Siswa</option>
            <option v-for="s in students" :key="s.id" :value="s.id">{{ s.nis }} - {{ s.name }}</option>
          </select>
        </div>

        <!-- Amount -->
        <FormInput
          id="amount"
          label="Jumlah Nominal (Rupiah)"
          type="number"
          placeholder="Masukkan jumlah nominal pembayaran (cth: 250000)"
          v-model.number="form.amount"
          required
        />

        <!-- Description -->
        <FormInput
          id="description"
          label="Deskripsi Tagihan"
          placeholder="Masukkan keperluan pembayaran (cth: SPP Juli 2024)"
          v-model="form.description"
          required
        />

        <!-- Due Date -->
        <FormInput
          id="due_date"
          label="Tanggal Jatuh Tempo"
          type="date"
          v-model="form.due_date"
          required
        />
      </form>
      <template #footer>
        <BaseButton variant="secondary" @click="closeFormModal" :disabled="submitting">
          Batal
        </BaseButton>
        <BaseButton variant="primary" @click="saveInvoice" :loading="submitting">
          Kirim Tagihan
        </BaseButton>
      </template>
    </ModalDialog>

    <!-- Payment Proof Upload Modal -->
    <ModalDialog :show="showPaymentModal" title="Kirim Bukti Pembayaran" @close="closePaymentModal">
      <form @submit.prevent="submitPaymentProof" class="payment-proof-form">
        <div class="form-group">
          <label for="receipt" class="form-label">Unggah Bukti Pembayaran</label>
          <input
            id="receipt"
            type="file"
            accept="image/*"
            @change="handleReceiptUpload"
            class="form-control"
            required
          />
        </div>

        <div v-if="receiptPreview" class="mt-4">
          <img
            :src="receiptPreview"
            alt="Preview bukti pembayaran"
            class="max-h-40 w-full object-contain rounded border"
          />
        </div>
      </form>
      <template #footer>
        <BaseButton variant="secondary" @click="closePaymentModal" :disabled="submitting">
          Batal
        </BaseButton>
        <BaseButton variant="primary" @click="submitPaymentProof" :loading="submitting">
          Kirim Bukti
        </BaseButton>
      </template>
    </ModalDialog>

    <!-- Delete Confirmation -->
    <ConfirmDialog
      :show="showDeleteConfirm"
      @confirm="deletePayment"
      @cancel="showDeleteConfirm = false"
      :loading="deleting"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { usePaymentStore } from '../stores/paymentStore';
import { useToastStore } from '../stores/toastStore';
import api from '../services/api';
import PageHeader from '../components/ui/PageHeader.vue';
import DataTable from '../components/ui/DataTable.vue';
import ModalDialog from '../components/ui/ModalDialog.vue';
import ConfirmDialog from '../components/ui/ConfirmDialog.vue';
import FormInput from '../components/ui/FormInput.vue';
import BaseButton from '../components/ui/BaseButton.vue';
import BadgeStatus from '../components/ui/BadgeStatus.vue';

const authStore = useAuthStore();
const paymentStore = usePaymentStore();
const toastStore = useToastStore();

const students = ref([]);
const updatingStatusId = ref(null);

const columns = [
  { key: 'description', label: 'Deskripsi Tagihan', sortable: true },
  { key: 'amount', label: 'Nominal', sortable: true },
  { key: 'due_date', label: 'Jatuh Tempo', sortable: true },
  { key: 'status', label: 'Status SPP', sortable: true },
  { key: 'receipt_url', label: 'Bukti', sortable: false },
  { key: 'actions', label: 'Aksi', width: '180px' },
];

if (authStore.isAdmin) {
  columns.unshift({ key: 'student', label: 'Nama Siswa', sortable: true });
}

// Helpers
const formatRupiah = (val) => {
  if (val === undefined || val === null) return 'Rp 0';
  return 'Rp ' + Number(val).toLocaleString('id-ID');
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const getStatusType = (status) => {
  if (status === 'Lunas') return 'success';
  if (status === 'Pending') return 'warning';
  return 'danger';
};

// Calculations
const unpaidTotal = computed(() => {
  return paymentStore.payments
    .filter((p) => p.status !== 'Lunas')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
});

const paidTotal = computed(() => {
  return paymentStore.payments
    .filter((p) => p.status === 'Lunas')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
});

const showFormModal = ref(false);
const showPaymentModal = ref(false);
const showDeleteConfirm = ref(false);
const submitting = ref(false);
const deleting = ref(false);
const selectedPaymentId = ref(null);
const currentPayment = ref(null);
const paymentProofFile = ref(null);
const receiptPreview = ref(null);

const form = ref({
  student_id: '',
  amount: '',
  description: '',
  due_date: new Date().toISOString().substring(0, 10),
});

const resetForm = () => {
  form.value = {
    student_id: '',
    amount: '',
    description: '',
    due_date: new Date().toISOString().substring(0, 10),
  };
};

const openCreateModal = () => {
  resetForm();
  showFormModal.value = true;
};

const closeFormModal = () => {
  showFormModal.value = false;
  resetForm();
};

const openPaymentModal = (payment) => {
  currentPayment.value = payment;
  paymentProofFile.value = null;
  receiptPreview.value = null;
  showPaymentModal.value = true;
};

const closePaymentModal = () => {
  showPaymentModal.value = false;
  currentPayment.value = null;
  paymentProofFile.value = null;
  if (receiptPreview.value) {
    URL.revokeObjectURL(receiptPreview.value);
  }
  receiptPreview.value = null;
};

const handleReceiptUpload = (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    paymentProofFile.value = null;
    receiptPreview.value = null;
    return;
  }
  paymentProofFile.value = file;
  if (receiptPreview.value) {
    URL.revokeObjectURL(receiptPreview.value);
  }
  receiptPreview.value = URL.createObjectURL(file);
};

const confirmDelete = (payment) => {
  selectedPaymentId.value = payment.id;
  showDeleteConfirm.value = true;
};

// Actions
const saveInvoice = async () => {
  if (!form.value.student_id || !form.value.amount || !form.value.description || !form.value.due_date) {
    toastStore.warning('Harap lengkapi semua kolom wajib!');
    return;
  }

  submitting.value = true;
  try {
    await paymentStore.createPayment(form.value);
    toastStore.success('Tagihan pembayaran berhasil dibuat.');
    closeFormModal();
  } catch (err) {
    toastStore.error(err.message || 'Gagal membuat tagihan.');
  } finally {
    submitting.value = false;
  }
};

const submitPaymentProof = async () => {
  if (!paymentProofFile.value || !currentPayment.value) {
    toastStore.warning('Harap unggah bukti pembayaran terlebih dahulu.');
    return;
  }

  submitting.value = true;
  try {
    const formData = new FormData();
    formData.append('status', 'Lunas');
    formData.append('receipt', paymentProofFile.value);
    await paymentStore.updatePayment(currentPayment.value.id, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    toastStore.success('Bukti pembayaran berhasil dikirim.');
    closePaymentModal();
  } catch (err) {
    toastStore.error(err.message || 'Gagal mengirim bukti pembayaran.');
  } finally {
    submitting.value = false;
  }
};

const markAsPaid = async (payment) => {
  updatingStatusId.value = payment.id;
  try {
    await paymentStore.updatePayment(payment.id, { status: 'Lunas' });
    toastStore.success('Tagihan berhasil diset menjadi Lunas.');
  } catch (err) {
    toastStore.error(err.message || 'Gagal mengubah status tagihan.');
  } finally {
    updatingStatusId.value = null;
  }
};

const simulatePayment = async (payment) => {
  const confirmBayar = confirm(`Konfirmasi pembayaran sebesar ${formatRupiah(payment.amount)} untuk ${payment.description}?`);
  if (!confirmBayar) return;

  try {
    await paymentStore.updatePayment(payment.id, { status: 'Lunas' });
    toastStore.success('Pembayaran sukses disimulasikan!');
  } catch (err) {
    toastStore.error('Gagal memproses pembayaran.');
  }
};

const deletePayment = async () => {
  deleting.value = true;
  try {
    await paymentStore.deletePayment(selectedPaymentId.value);
    toastStore.success('Tagihan pembayaran berhasil dihapus.');
    showDeleteConfirm.value = false;
  } catch (err) {
    toastStore.error(err.message || 'Gagal menghapus tagihan.');
  } finally {
    deleting.value = false;
  }
};

onMounted(async () => {
  paymentStore.fetchPayments().catch(() => {
    toastStore.error('Gagal mengambil riwayat pembayaran.');
  });

  if (authStore.isAdmin) {
    try {
      const response = await api.get('/students');
      students.value = response.data?.data || response.data || [];
    } catch (e) {
      console.error('Gagal mengambil daftar siswa:', e);
    }
  }
});
</script>
