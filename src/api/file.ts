/**
 * File API module
 * Handles file upload and management
 */

import request from '@/api/request'

/**
 * Upload a single file
 * @param file The file to upload
 * @param biz Business type: 'user_avatar' | 'service_image'
 * @returns The uploaded file URL
 */
export function uploadFile(file: File, biz: string): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('biz', biz)

  return request<string>({
    url: '/file/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * Upload multiple files
 * @param files The files to upload
 * @param biz Business type: 'user_avatar' | 'service_image'
 * @returns Array of uploaded file URLs
 */
export function uploadFiles(files: File[], biz: string): Promise<string[]> {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })
  formData.append('biz', biz)

  return request<string[]>({
    url: '/file/upload/batch',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * Delete a file
 * @param url The file URL to delete
 * @returns Whether deletion was successful
 */
export function deleteFile(url: string): Promise<boolean> {
  return request<boolean>({
    url: '/file/delete',
    method: 'delete',
    params: { url }
  })
}
