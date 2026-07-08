<template>
  <div class="page-grid">
    <PageSection eyebrow="Account and experience" title="Settings" description="Workspace profile and appearance controls for Phase 1.">
      <div class="settings-grid">
        <section class="settings-card">
          <div class="settings-card-header">
            <p class="card-label">Signed-in user</p>
            <span class="inline-badge">Fixed shell user</span>
          </div>

          <div class="settings-user">
            <span class="profile-avatar large">JD</span>
            <div>
              <strong>John Doe</strong>
              <small>Google SSO shell</small>
            </div>
          </div>
        </section>

        <section class="settings-card">
          <div class="settings-card-header">
            <p class="card-label">Theme</p>
            <span class="inline-badge">{{ activeThemeLabel }}</span>
          </div>

          <div class="theme-options">
            <button
              v-for="option in options"
              :key="option.value"
              class="theme-option"
              :class="{ active: appStore.theme === option.value }"
              type="button"
              @click="setTheme(option.value)"
            >
              <component :is="option.icon" :size="15" />
              <span>{{ option.label }}</span>
            </button>
          </div>
        </section>
      </div>

      <div class="settings-grid settings-grid-history">
        <section class="settings-card">
          <div class="settings-card-header">
            <p class="card-label">Theme style</p>
            <span class="inline-badge">{{ activePresetLabel }}</span>
          </div>

          <div class="palette-grid">
            <button
              v-for="preset in themePresets"
              :key="preset.value"
              class="palette-option"
              :class="{ active: appStore.themePreset === preset.value }"
              type="button"
              @click="setThemePreset(preset.value)"
            >
              <span class="palette-swatch-row">
                <span class="palette-swatch" :class="`${preset.value}-primary`"></span>
                <span class="palette-swatch" :class="`${preset.value}-accent`"></span>
                <span class="palette-swatch neutral"></span>
              </span>
              <span>{{ preset.label }}</span>
            </button>
          </div>
        </section>

        <section class="settings-card">
          <div class="settings-card-header">
            <p class="card-label">Workspace chats</p>
            <span class="inline-badge">{{ workspaceActiveThreads }} active</span>
          </div>
          <p class="section-description">
            Archived and deleted chats can be recovered here until permanently removed.
          </p>
          <div class="settings-actions-row">
            <button class="surface-button" type="button" @click="archiveWorkspaceThreads">
              <Archive :size="15" />
              <span>Archive active</span>
            </button>
            <button class="surface-button destructive-button" type="button" @click="deleteWorkspaceThreads">
              <Trash2 :size="15" />
              <span>Move active to bin</span>
            </button>
          </div>
        </section>
      </div>
    </PageSection>

    <PageSection eyebrow="Bin history" title="Deleted chats" description="Select items to restore or clear completely.">
      <section class="settings-card">
        <div class="settings-card-header">
          <p class="card-label">Bin</p>
          <span class="inline-badge">{{ appStore.deletedThreads.length }}</span>
        </div>

        <div class="settings-actions-row">
          <label class="selection-toggle">
            <input type="checkbox" :checked="allBinSelected" @change="toggleAllBinSelection" />
            <span>Select all</span>
          </label>
          <div class="history-record-actions">
            <button
              class="surface-button"
              type="button"
              :disabled="selectedBinCount === 0"
              @click="restoreSelectedThreads"
            >
              <RotateCcw :size="15" />
              <span>Restore selected</span>
            </button>
            <button
              class="surface-button destructive-button"
              type="button"
              :disabled="selectedBinCount === 0"
              @click="clearSelectedThreads"
            >
              <Trash2 :size="15" />
              <span>Clear selected</span>
            </button>
            <button class="surface-button destructive-button" type="button" @click="clearAllDeletedThreads">
              <Trash2 :size="15" />
              <span>Clear all</span>
            </button>
          </div>
        </div>

        <div class="history-record-list">
          <article v-for="thread in appStore.deletedThreads" :key="thread.threadId" class="history-record">
            <label class="selection-toggle">
              <input
                type="checkbox"
                :checked="selectedBinIds.includes(thread.threadId)"
                @change="toggleBinSelection(thread.threadId)"
              />
            </label>
            <div class="history-record-copy">
              <strong>{{ thread.title }}</strong>
              <small>{{ spaceLabel(thread.spaceId) }} · {{ thread.updatedAt }}</small>
            </div>
            <div class="history-record-actions">
              <button class="surface-button" type="button" @click="restoreThread(thread.threadId)">
                <RotateCcw :size="14" />
              </button>
              <button class="surface-button destructive-button" type="button" @click="clearDeletedThread(thread.threadId)">
                <Trash2 :size="14" />
              </button>
            </div>
          </article>

          <article v-if="appStore.deletedThreads.length === 0" class="history-record empty">
            <strong>Bin is empty</strong>
            <small>Deleted chats will appear here.</small>
          </article>
        </div>
      </section>
    </PageSection>
  </div>
</template>

<script setup lang="ts">
import { Archive, Monitor, MoonStar, RotateCcw, Sun, Trash2 } from '@lucide/vue'
import { computed, ref } from 'vue'
import PageSection from '../components/PageSection.vue'
import {
  useAppStore,
  type ThemeMode,
  type ThemePreset,
} from '../stores/app'

const appStore = useAppStore()
const selectedBinIds = ref<string[]>([])

const options: Array<{ label: string; value: ThemeMode; icon: typeof Monitor }> = [
  { label: 'System', value: 'system', icon: Monitor },
  { label: 'Light', value: 'light', icon: Sun },
  { label: 'Dark', value: 'dark', icon: MoonStar },
]

const themePresets: Array<{ label: string; value: ThemePreset }> = [
  { label: 'Isomo', value: 'isomo' },
  { label: 'Lagoon', value: 'lagoon' },
  { label: 'Grove', value: 'grove' },
  { label: 'Cinder', value: 'cinder' },
  { label: 'Ember', value: 'ember' },
  { label: 'Clay', value: 'clay' },
]

const activeThemeLabel = computed(() => appStore.theme.charAt(0).toUpperCase() + appStore.theme.slice(1))
const activePresetLabel = computed(
  () => themePresets.find((preset) => preset.value === appStore.themePreset)?.label ?? 'Isomo',
)

const workspaceActiveThreads = computed(
  () => appStore.workspaceActiveThreads.filter((thread) => thread.workspaceSlug === appStore.activeWorkspace).length,
)

const selectedBinCount = computed(() => selectedBinIds.value.length)

const allBinSelected = computed(
  () => selectedBinCount.value > 0 && selectedBinCount.value === appStore.deletedThreads.length,
)

const setTheme = (theme: ThemeMode) => {
  appStore.setTheme(theme)
}

const setThemePreset = (preset: ThemePreset) => {
  appStore.setThemePreset(preset)
}

const spaceLabel = (spaceId: string) => {
  if (spaceId === appStore.rootSpaceId) return 'General'
  return appStore.spaces.find((space) => space.spaceId === spaceId)?.title ?? 'Space'
}

const restoreSelectedThreads = () => {
  appStore.restoreThreads(selectedBinIds.value)
  selectedBinIds.value = []
}

const clearSelectedThreads = () => {
  appStore.clearDeletedThreads(selectedBinIds.value)
  selectedBinIds.value = []
}

const clearAllDeletedThreads = () => {
  appStore.clearDeletedThreads()
  selectedBinIds.value = []
}

const restoreThread = (threadId: string) => {
  appStore.restoreThread(threadId)
  selectedBinIds.value = selectedBinIds.value.filter((id) => id !== threadId)
}

const clearDeletedThread = (threadId: string) => {
  appStore.clearDeletedThreads([threadId])
  selectedBinIds.value = selectedBinIds.value.filter((id) => id !== threadId)
}

const toggleBinSelection = (threadId: string) => {
  if (selectedBinIds.value.includes(threadId)) {
    selectedBinIds.value = selectedBinIds.value.filter((item) => item !== threadId)
    return
  }
  selectedBinIds.value = [...selectedBinIds.value, threadId]
}

const toggleAllBinSelection = () => {
  if (allBinSelected.value) {
    selectedBinIds.value = []
    return
  }
  selectedBinIds.value = appStore.deletedThreads.map((thread) => thread.threadId)
}

const archiveWorkspaceThreads = () => {
  appStore.archiveWorkspaceThreads()
}

const deleteWorkspaceThreads = () => {
  appStore.deleteWorkspaceThreads()
}
</script>
