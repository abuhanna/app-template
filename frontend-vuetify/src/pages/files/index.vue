<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <span>File Management</span>
            <v-spacer />
            <v-btn color="primary" prepend-icon="mdi-upload" @click="showUploadDialog = true">
              Upload File
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="files"
              :loading="loading"
              item-value="id"
            >
              <template #item.fileSize="{ item }">
                {{ formatFileSize(item.fileSize) }}
              </template>
              <template #item.isPublic="{ item }">
                <v-chip :color="item.isPublic ? 'success' : 'default'" size="small">
                  {{ item.isPublic ? 'Public' : 'Private' }}
                </v-chip>
              </template>
              <template #item.createdAt="{ item }">
                {{ formatDate(item.createdAt) }}
              </template>
              <template #item.actions="{ item }">
                <v-btn
                  icon="mdi-download"
                  variant="text"
                  size="small"
                  @click="downloadFile(item)"
                />
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  size="small"
                  color="error"
                  @click="confirmDelete(item)"
                />
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Upload Dialog -->
    <v-dialog v-model="showUploadDialog" max-width="500">
      <v-card>
        <v-card-title>Upload File</v-card-title>
        <v-card-text>
          <v-file-input
            v-model="uploadFile"
            label="Select File"
            prepend-icon="mdi-paperclip"
            show-size
          />
          <v-text-field v-model="uploadForm.description" label="Description" />
          <v-text-field v-model="uploadForm.category" label="Category" />
          <v-switch v-model="uploadForm.isPublic" label="Public" color="primary" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showUploadDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="uploading" @click="handleUpload">Upload</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useNotificationStore } from '@/stores/notification'
import fileService from '@/services/fileService'

const confirmDialog = useConfirmDialog()
const notificationStore = useNotificationStore()

const loading = ref(false)
const uploading = ref(false)
const files = ref([])
const showUploadDialog = ref(false)
const uploadFile = ref(null)
const uploadForm = ref({ description: '', category: '', isPublic: false })

const headers = [
  { title: 'Name', key: 'originalFileName' },
  { title: 'Type', key: 'contentType' },
  { title: 'Size', key: 'fileSize' },
  { title: 'Category', key: 'category' },
  { title: 'Public', key: 'isPublic' },
  { title: 'Created', key: 'createdAt' },
  { title: 'Actions', key: 'actions', sortable: false },
]

async function loadFiles() {
  loading.value = true
  try {
    files.value = await fileService.getFiles()
  } catch (error) {
    notificationStore.showError('Failed to load files')
  } finally {
    loading.value = false
  }
}

async function handleUpload() {
  if (!uploadFile.value) return

  uploading.value = true
  try {
    await fileService.uploadFile(uploadFile.value, uploadForm.value)
    notificationStore.showSuccess('File uploaded successfully')
    showUploadDialog.value = false
    uploadFile.value = null
    uploadForm.value = { description: '', category: '', isPublic: false }
    await loadFiles()
  } catch (error) {
    notificationStore.showError('Failed to upload file')
  } finally {
    uploading.value = false
  }
}

function downloadFile(file) {
  window.open(fileService.getDownloadUrl(file.id), '_blank')
}

async function confirmDelete(file) {
  const confirmed = await confirmDialog.confirm({
    title: 'Delete File',
    message: `Are you sure you want to delete "${file.originalFileName}"?`,
    confirmLabel: 'Delete',
    color: 'error',
  })

  if (confirmed) {
    try {
      await fileService.deleteFile(file.id)
      notificationStore.showSuccess('File deleted successfully')
      await loadFiles()
    } catch (error) {
      notificationStore.showError('Failed to delete file')
    }
  }
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
