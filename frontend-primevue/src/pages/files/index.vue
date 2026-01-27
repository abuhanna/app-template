<template>
  <div class="files-page">
    <Card>
      <template #content>
        <DataTable :value="files" :loading="loading" responsiveLayout="scroll" stripedRows>
          <template #header>
            <div class="flex flex-wrap align-items-center justify-content-between gap-2">

              <Button label="Upload File" icon="pi pi-upload" @click="showUploadDialog = true" />
            </div>
          </template>
          <Column field="originalFileName" header="Name" />
          <Column field="contentType" header="Type" />
          <Column header="Size">
            <template #body="{ data }">
              {{ formatFileSize(data.fileSize) }}
            </template>
          </Column>
          <Column field="category" header="Category" />
          <Column header="Public">
            <template #body="{ data }">
              <Tag :value="data.isPublic ? 'Public' : 'Private'" :severity="data.isPublic ? 'success' : 'secondary'" />
            </template>
          </Column>
          <Column header="Created">
            <template #body="{ data }">
              {{ formatDate(data.createdAt) }}
            </template>
          </Column>
          <Column header="Actions">
            <template #body="{ data }">
              <Button icon="pi pi-download" text rounded @click="downloadFile(data)" />
              <Button icon="pi pi-trash" text rounded severity="danger" @click="confirmDelete(data)" />
            </template>
          </Column>
          <template #empty>
            <div class="flex flex-column align-items-center py-5 text-color-secondary">
              <i class="pi pi-file text-5xl mb-3"></i>
              <span>No files found</span>
            </div>
          </template>
        </DataTable>
      </template>
    </Card>

    <!-- Upload Dialog -->
    <Dialog v-model:visible="showUploadDialog" header="Upload File" :modal="true" :style="{ width: '450px' }">
      <div class="field">
        <label>File</label>
        <FileUpload
          mode="basic"
          :auto="false"
          :maxFileSize="50000000"
          @select="onFileSelect"
          chooseLabel="Select File"
        />
      </div>
      <div class="field">
        <label for="description">Description</label>
        <InputText id="description" v-model="uploadForm.description" class="w-full" />
      </div>
      <div class="field">
        <label for="category">Category</label>
        <InputText id="category" v-model="uploadForm.category" class="w-full" />
      </div>
      <div class="field-checkbox">
        <Checkbox v-model="uploadForm.isPublic" :binary="true" inputId="isPublic" />
        <label for="isPublic" class="ml-2">Public</label>
      </div>
      <template #footer>
        <Button label="Cancel" text @click="showUploadDialog = false" />
        <Button label="Upload" icon="pi pi-upload" :loading="uploading" @click="handleUpload" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useNotificationStore } from '@/stores/notification'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Checkbox from 'primevue/checkbox'
import FileUpload from 'primevue/fileupload'
import Tag from 'primevue/tag'
import fileService from '@/services/fileService'

const confirm = useConfirm()
const notificationStore = useNotificationStore()

const loading = ref(false)
const uploading = ref(false)
const files = ref([])
const showUploadDialog = ref(false)
const selectedFile = ref(null)
const uploadForm = ref({ description: '', category: '', isPublic: false })

async function loadFiles() {
  loading.value = true
  try {
    const response = await fileService.getFiles()
    files.value = response.items || []
  } catch (error) {
    notificationStore.showError('Failed to load files')
  } finally {
    loading.value = false
  }
}

function onFileSelect(event) {
  selectedFile.value = event.files[0]
}

async function handleUpload() {
  if (!selectedFile.value) return

  uploading.value = true
  try {
    await fileService.uploadFile(selectedFile.value, uploadForm.value)
    notificationStore.showSuccess('File uploaded successfully')
    showUploadDialog.value = false
    selectedFile.value = null
    uploadForm.value = { description: '', category: '', isPublic: false }
    await loadFiles()
  } catch (error) {
    notificationStore.showError('Failed to upload file')
  } finally {
    uploading.value = false
  }
}

async function downloadFile(file) {
  try {
    await fileService.downloadFile(file.id, file.originalFileName)
  } catch (error) {
    notificationStore.showError('Failed to download file')
  }
}

function confirmDelete(file) {
  confirm.require({
    message: `Are you sure you want to delete "${file.originalFileName}"?`,
    header: 'Delete File',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await fileService.deleteFile(file.id)
        notificationStore.showSuccess('File deleted successfully')
        await loadFiles()
      } catch (error) {
        notificationStore.showError('Failed to delete file')
      }
    },
  })
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatDate(date) {
  return new Date(date).toLocaleDateString()
}

onMounted(loadFiles)
</script>

<style scoped>
.files-page {
  padding: 1rem;
}

.field {
  margin-bottom: 1rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.field-checkbox {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}
</style>
