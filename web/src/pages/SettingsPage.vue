<template>
  <div class="page-grid">
    <PageSection
      eyebrow="Account and appearance"
      title="Settings"
      description="Theme, profile, and Isomo Brain history controls live here."
    >
      <div class="settings-grid">
        <section class="settings-card">
          <div class="settings-card-header">
            <div>
              <p class="card-label">Profile</p>
              <h3>Signed-in user</h3>
            </div>
            <span class="inline-badge">Leadership</span>
          </div>

          <div class="settings-user">
            <span class="profile-avatar large">JD</span>
            <div>
              <strong>John Doe</strong>
              <small>Google SSO shell</small>
            </div>
          </div>

          <div class="settings-meta">
            <div class="source-row">
              <span>Workspace mode</span>
              <strong>{{ activeWorkspaceLabel }}</strong>
            </div>
          </div>

          <div class="settings-actions-row">
            <RouterLink class="surface-button" to="/isomo-brain">
              <MessageSquareMore :size="16" />
              <span>Open Isomo Brain</span>
            </RouterLink>
            <button class="surface-button destructive-button" type="button" @click="logout">
              <LogOut :size="16" />
              <span>Logout</span>
            </button>
          </div>
        </section>

        <section class="settings-card">
          <div class="settings-card-header">
            <div>
              <p class="card-label">Theme</p>
              <h3>Appearance</h3>
            </div>
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
              <component :is="option.icon" :size="16" />
              <span>{{ option.label }}</span>
            </button>
          </div>

          <div class="theme-style-group">
            <div class="settings-card-header">
              <div>
                <p class="card-label">Theme style</p>
                <h3>Color presets</h3>
              </div>
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
          </div>
        </section>
      </div>
    </PageSection>

    <PageSection
      eyebrow="Brain history"
      title="Chat history controls"
      description="Manage active chats in this workspace and review archived conversations or items in bin."
    >
      <div class="settings-grid settings-grid-history">
        <section class="settings-card">
          <div class="settings-card-header">
            <div>
              <p class="card-label">Active workspace</p>
              <h3>{{ activeWorkspaceLabel }}</h3>
            </div>
            <span class="inline-badge">{{ appStore.workspaceActiveThreads.length }} active</span>
          </div>

          <div class="settings-actions-row">
            <button class="surface-button" type="button" @click="archiveWorkspaceThreads">
              <Archive :size="16" />
              <span>Archive all</span>
            </button>
            <button class="surface-button destructive-button" type="button" @click="deleteWorkspaceThreads">
              <Trash2 :size="16" />
              <span>Move to bin</span>
            </button>
          </div>

          <div class="history-record-list">
            <article v-for="thread in appStore.workspaceActiveThreads" :key="thread.threadId" class="history-record">
              <div class="history-record-copy">
                <strong>{{ thread.title }}</strong>
                <small>{{ spaceLabel(thread.spaceId) }} · {{ thread.updatedAt }}</small>
              </div>
              <div class="history-record-actions">
                <button class="thread-action-button" type="button" @click="archiveThread(thread.threadId)">
                  <Archive :size="15" />
                </button>
                <button class="thread-action-button destructive" type="button" @click="deleteThread(thread.threadId)">
                  <Trash2 :size="15" />
                </button>
              </div>
            </article>

            <article v-if="appStore.workspaceActiveThreads.length === 0" class="history-record empty">
              <div class="history-record-copy">
                <strong>No active chats</strong>
                <small>Start a new chat in Isomo Brain or restore one below.</small>
              </div>
            </article>
          </div>
        </section>

        <section class="settings-card">
          <div class="settings-card-header">
            <div>
              <p class="card-label">Archived chats</p>
              <h3>Stored for later</h3>
            </div>
            <span class="inline-badge">{{ appStore.archivedThreads.length }}</span>
          </div>

          <div class="history-record-list">
            <article v-for="thread in appStore.archivedThreads" :key="thread.threadId" class="history-record">
              <div class="history-record-copy">
                <strong>{{ thread.title }}</strong>
                <small>{{ workspaceLabel(thread.workspaceSlug) }} · {{ thread.updatedAt }}</small>
              </div>
              <div class="history-record-actions">
                <button class="thread-action-button" type="button" @click="restoreThread(thread.threadId)">
                  <RotateCcw :size="15" />
                </button>
              </div>
            </article>

            <article v-if="appStore.archivedThreads.length === 0" class="history-record empty">
              <div class="history-record-copy">
                <strong>No archived chats</strong>
                <small>Archived conversations will appear here.</small>
              </div>
            </article>
          </div>
        </section>
      </div>

      <section class="settings-card">
        <div class="settings-card-header">
          <div>
            <p class="card-label">Bin</p>
            <h3>Recently removed</h3>
          </div>
          <span class="inline-badge">{{ appStore.deletedThreads.length }}</span>
        </div>

        <div v-if="appStore.deletedThreads.length > 0" class="settings-actions-row bin-toolbar">
          <div class="selection-summary">
            <label class="selection-toggle master">
              <input type="checkbox" :checked="allBinSelected" @change="toggleAllBinSelection" />
              <span>Select all</span>
            </label>
            <small>{{ selectedBinCount }} selected</small>
          </div>

          <div class="history-record-actions">
            <button class="surface-button" type="button" :disabled="selectedBinCount === 0" @click="restoreSelectedThreads">
              <RotateCcw :size="16" />
              <span>Restore selected</span>
            </button>
            <button
              class="surface-button destructive-button"
              type="button"
              :disabled="selectedBinCount === 0"
              @click="clearSelectedThreads"
            >
              <Trash2 :size="16" />
              <span>Clear selected</span>
            </button>
            <button class="surface-button destructive-button" type="button" @click="clearAllDeletedThreads">
              <Trash2 :size="16" />
              <span>Clear all</span>
            </button>
          </div>
        </div>

        <div class="history-record-list">
          <article
            v-for="thread in appStore.deletedThreads"
            :key="thread.threadId"
            class="history-record selectable"
            :class="{ selected: selectedBinIds.includes(thread.threadId) }"
          >
            <label class="selection-toggle">
              <input
                type="checkbox"
                :checked="selectedBinIds.includes(thread.threadId)"
                @change="toggleBinSelection(thread.threadId)"
              />
            </label>
            <div class="history-record-copy">
              <strong>{{ thread.title }}</strong>
              <small>{{ workspaceLabel(thread.workspaceSlug) }} · {{ thread.updatedAt }}</small>
            </div>
            <div class="history-record-actions">
              <button class="thread-action-button" type="button" @click="restoreThread(thread.threadId)">
                <RotateCcw :size="15" />
              </button>
              <button class="thread-action-button destructive" type="button" @click="clearDeletedThread(thread.threadId)">
                <Trash2 :size="15" />
              </button>
            </div>
          </article>

          <article v-if="appStore.deletedThreads.length === 0" class="history-record empty">
            <div class="history-record-copy">
              <strong>Bin is empty</strong>
              <small>Chats moved to bin will appear here.</small>
            </div>
          </article>
        </div>
      </section>
    </PageSection>
  </div>
</template>

<script setup lang="ts">
import { Archive, LogOut, MessageSquareMore, Monitor, MoonStar, RotateCcw, Sun, Trash2 } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import PageSection from '../components/PageSection.vue'
import {
  workspaces,
  useAppStore,
  type ThemeMode,
  type ThemePreset,
  type WorkspaceSlug,
} from '../stores/app'

const router = useRouter()
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

const activeWorkspaceLabel = computed(
  () => workspaces.find((workspace) => workspace.slug === appStore.activeWorkspace)?.label ?? 'Unknown workspace',
)

const workspaceLabel = (workspaceSlug: WorkspaceSlug) => {
  return workspaces.find((workspace) => workspace.slug === workspaceSlug)?.label ?? 'Unknown workspace'
}

const spaceLabel = (spaceId: string) => {
  return appStore.spaces.find((space) => space.spaceId === spaceId)?.title ?? 'Space'
}

const setTheme = (theme: ThemeMode) => {
  appStore.setTheme(theme)
}

const setThemePreset = (preset: ThemePreset) => {
  appStore.setThemePreset(preset)
}

const archiveThread = (threadId: string) => {
  appStore.archiveThread(threadId)
}

const deleteThread = (threadId: string) => {
  appStore.deleteThread(threadId)
}

const restoreThread = (threadId: string) => {
  appStore.restoreThread(threadId)
}

const archiveWorkspaceThreads = () => {
  appStore.archiveWorkspaceThreads()
}

const deleteWorkspaceThreads = () => {
  appStore.deleteWorkspaceThreads()
}

const selectedBinCount = computed(() => selectedBinIds.value.length)

const allBinSelected = computed(
  () =>
    appStore.deletedThreads.length > 0 &&
    appStore.deletedThreads.every((thread) => selectedBinIds.value.includes(thread.threadId)),
)

const toggleBinSelection = (threadId: string) => {
  selectedBinIds.value = selectedBinIds.value.includes(threadId)
    ? selectedBinIds.value.filter((id) => id !== threadId)
    : [...selectedBinIds.value, threadId]
}

const toggleAllBinSelection = () => {
  selectedBinIds.value = allBinSelected.value
    ? []
    : appStore.deletedThreads.map((thread) => thread.threadId)
}

const clearDeletedThread = (threadId: string) => {
  appStore.clearDeletedThreads([threadId])
  selectedBinIds.value = selectedBinIds.value.filter((id) => id !== threadId)
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

watch(
  () => appStore.deletedThreads.map((thread) => thread.threadId),
  (threadIds) => {
    selectedBinIds.value = selectedBinIds.value.filter((id) => threadIds.includes(id))
  },
  { immediate: true },
)

const logout = () => {
  void router.push('/login')
}
</script>
