<template>
  <div>
    <NuxtPwaManifest />
    <NuxtLoadingIndicator color="#16a34a" :height="3" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- PWA Update Notification Banner -->
    <div
      v-if="$pwa?.needRefresh"
      class="fixed bottom-20 left-4 right-4 max-w-md mx-auto bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center justify-between z-50 animate-bounce"
    >
      <div class="text-xs">
        <p class="font-semibold">Update available!</p>
        <p class="text-slate-300">Click update to load the latest version.</p>
      </div>
      <button
        type="button"
        class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-semibold"
        @click="$pwa.updateServiceWorker()"
      >
        Update
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $pwa } = useNuxtApp()
</script>
