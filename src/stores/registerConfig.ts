/**
 * Register config store
 * Global state for register switch status
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getRegisterStatus } from '@/api/sysConfig'

export const useRegisterConfigStore = defineStore('registerConfig', () => {
    // Register enabled status
    const registerEnabled = ref<boolean>(false) // Default to false
    const loaded = ref<boolean>(false)
    const loading = ref<boolean>(false)

    /**
     * Fetch register status from backend
     */
    const fetchRegisterStatus = async () => {
        if (loading.value) return
        loading.value = true
        try {
            const res = await getRegisterStatus()
            registerEnabled.value = res.registerEnabled
            loaded.value = true
        } catch (error) {
            console.error('Failed to fetch register status:', error)
            // Default to false on error (fail closed)
            registerEnabled.value = false
        } finally {
            loading.value = false
        }
    }

    return {
        registerEnabled,
        loaded,
        loading,
        fetchRegisterStatus
    }
})
