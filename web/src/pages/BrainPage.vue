<template>
  <section class="space-page">
    <div class="space-layout" :class="{ 'sources-hidden': !appStore.brainSourcesOpen }">
      <aside class="space-rail">
        <section class="rail-card">
          <div class="rail-heading">
            <h2>Spaces</h2>
            <button class="icon-button" type="button" title="New space" @click="createSpace">
              <FolderPlus :size="15" />
            </button>
          </div>

          <div class="space-list">
            <div
              v-for="space in displaySpaces"
              :key="space.spaceId"
              class="space-row"
              :class="{ active: space.spaceId === activeSpace?.spaceId, menuOpen: spaceMenuId === space.spaceId }"
            >
              <button class="space-item" type="button" @click="setActiveSpace(space.spaceId)">
                <FolderOpen :size="15" />
                <span class="row-copy">
                  <strong>{{ space.title }}</strong>
                  <small>{{ space.updatedAt }}</small>
                </span>
              </button>

              <button
                class="row-menu-trigger"
                type="button"
                title="Space options"
                @click.stop="toggleSpaceMenu(space.spaceId)"
              >
                <MoreVertical :size="14" />
              </button>

              <div class="space-menu" :class="{ open: spaceMenuId === space.spaceId }">
                <button type="button" class="thread-menu-item" @click="startRenameSpace(space.spaceId, space.title)">
                  Rename
                </button>
                <button
                  v-if="space.spaceId !== appStore.rootSpaceId"
                  type="button"
                  class="thread-menu-item"
                  @click="archiveSpace(space.spaceId)"
                >
                  Archive
                </button>
                <button
                  v-if="space.spaceId !== appStore.rootSpaceId"
                  type="button"
                  class="thread-menu-item destructive"
                  @click="deleteSpace(space.spaceId)"
                >
                  Move to bin
                </button>
              </div>

              <input
                v-if="renamingSpaceId === space.spaceId"
                v-model="spaceRenameValue"
                class="inline-input"
                type="text"
                @click.stop
                @blur="renameCurrentSpace(space.spaceId)"
                @keydown.enter="renameCurrentSpace(space.spaceId)"
                @keydown.escape="cancelRenameSpace"
              />
            </div>
          </div>
        </section>

        <section class="rail-card">
          <div class="rail-heading">
            <div>
              <h2>Chats</h2>
              <small>{{ activeSpace?.title ?? 'General' }}</small>
            </div>
            <button class="surface-button compact-button" type="button" @click="createThreadInActiveSpace">
              <Plus :size="14" />
              New
            </button>
          </div>

          <div class="thread-list">
            <p v-if="activeSpaceThreads.length === 0" class="rail-empty-state">Start a chat in this space.</p>

            <div
              v-for="thread in activeSpaceThreads"
              :key="thread.threadId"
              class="thread-row"
              :class="{ active: thread.threadId === activeThread?.threadId, menuOpen: threadMenuId === thread.threadId }"
            >
              <button class="thread-item" type="button" @click="setActiveThread(thread.threadId)">
                <div class="row-copy">
                  <strong>{{ thread.title }}</strong>
                  <small>{{ thread.updatedAt }}</small>
                </div>
              </button>

              <button
                class="row-menu-trigger"
                type="button"
                title="Thread options"
                @click.stop="toggleThreadMenu(thread.threadId)"
              >
                <MoreVertical :size="14" />
              </button>

              <div class="space-menu" :class="{ open: threadMenuId === thread.threadId }">
                <button
                  type="button"
                  class="thread-menu-item"
                  @click="startRenameThread(thread.threadId, thread.title)"
                >
                  Rename
                </button>
                <button type="button" class="thread-menu-item" @click="archiveThread(thread.threadId)">Archive</button>
                <button type="button" class="thread-menu-item destructive" @click="deleteThread(thread.threadId)">
                  Move to bin
                </button>
              </div>

              <input
                v-if="renamingThreadId === thread.threadId"
                v-model="threadRenameValue"
                class="inline-input"
                type="text"
                @click.stop
                @blur="renameCurrentThread(thread.threadId)"
                @keydown.enter="renameCurrentThread(thread.threadId)"
                @keydown.escape="cancelRenameThread"
              />
            </div>
          </div>
        </section>
      </aside>

      <main class="space-main">
        <header class="space-canvas-header">
          <div>
            <p class="eyebrow">{{ activeSpace?.title ?? 'General' }}</p>
            <h1>{{ workspaceTitle }}</h1>
            <small>{{ activeThreadTitle }}</small>
          </div>

          <div class="canvas-toolbar">
            <button
              class="icon-button"
              type="button"
              :title="appStore.sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'"
              @click="appStore.toggleSidebarCollapsed"
            >
              <PanelLeftOpen v-if="appStore.sidebarCollapsed" :size="16" />
              <PanelLeftClose v-else :size="16" />
            </button>
            <button class="icon-button" type="button" title="Toggle resources" @click="toggleBrainSources">
              <PanelRightOpen v-if="!appStore.brainSourcesOpen" :size="16" />
              <PanelRightClose v-else :size="16" />
            </button>
          </div>
        </header>

        <div class="route-chip-group">
          <button class="topbar-pill">
            <Folders :size="13" />
            <span>{{ activeWorkspaceLabel }} · {{ activeSpace?.title ?? 'General' }}</span>
          </button>
            <button class="topbar-pill">
            <MessagesSquare :size="13" />
            <span>{{ activeSpaceThreads.length }} chats</span>
          </button>
        </div>

        <div class="message-area">
          <article v-if="displayMessages.length === 0" class="space-empty">
            <strong>Start a conversation</strong>
            <p>Ask any question. Responses are placeholders in Phase 1 while this shell is wired.</p>
          </article>

          <article v-for="message in displayMessages" :key="message.id" class="chat-message" :class="message.role">
            <div class="message-meta">
              <span>{{ message.role === 'user' ? 'You' : 'Isomo' }}</span>
              <small>{{ message.loading ? 'Working...' : 'Phase 1 shell' }}</small>
            </div>
            <div class="message-card">{{ message.loading ? 'Generating…' : message.text }}</div>
          </article>
        </div>

        <form class="composer-shell" @submit.prevent="sendMessage">
          <textarea
            v-model="composerValue"
            rows="1"
            placeholder="Ask in this space..."
            @keydown.enter.prevent.exact="sendMessage"
          ></textarea>
          <button class="primary-button compact" type="submit">
            <Send :size="15" />
            Send
          </button>
        </form>
      </main>

      <aside v-if="appStore.brainSourcesOpen" class="space-sources">
        <div class="sources-card">
          <div class="sources-header">
            <h2>Retrieval path</h2>
            <button class="icon-button" type="button" title="Hide resources" @click="toggleBrainSources">
              <PanelRightClose :size="15" />
            </button>
          </div>

          <div class="retrieval-flow">
            <article v-for="step in retrievalSteps" :key="step.step" class="retrieval-step">
              <span>{{ step.step }}</span>
              <div>
                <strong>{{ step.title }}</strong>
                <small>{{ step.description }}</small>
              </div>
            </article>
          </div>
        </div>

        <div class="sources-card">
          <h2>Citations</h2>
          <div class="citation-list">
            <article v-for="item in citationSamples" :key="item.label" class="citation-item">
              <strong>{{ item.label }}</strong>
              <small>{{ item.type }}</small>
            </article>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  FolderOpen,
  FolderPlus,
  Folders,
  MessagesSquare,
  MoreVertical,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Send,
} from '@lucide/vue'
import { computed, ref } from 'vue'
import { useAppStore, workspaces } from '../stores/app'

const appStore = useAppStore()

const composerValue = ref('')
const spaceMenuId = ref('')
const threadMenuId = ref('')
const renamingSpaceId = ref('')
const renamingThreadId = ref('')
const spaceRenameValue = ref('')
const threadRenameValue = ref('')

const activeWorkspaceLabel = computed(
  () => workspaces.find((workspace) => workspace.slug === appStore.activeWorkspace)?.label ?? 'Isomo',
)

const displaySpaces = computed(() => appStore.spacesWithRoot)
const activeSpace = computed(() => appStore.activeSpace)
const activeThread = computed(() => appStore.activeThread)
const activeSpaceThreads = computed(() => appStore.threadsByActiveSpace)

const activeWorkspaceLabelWithDefault = computed(() => activeWorkspaceLabel.value)

const workspaceTitle = computed(() => `Space workspace · ${activeWorkspaceLabelWithDefault.value}`)

const activeThreadTitle = computed(() =>
  activeThread.value ? `Conversation: ${activeThread.value.title}` : `No thread selected in ${activeSpace.value?.title ?? 'General'}`,
)

const displayMessages = computed(() => activeThread.value?.messages ?? [])

const retrievalSteps = computed(() => [
  { step: '01', title: 'Workspace', description: activeWorkspaceLabel.value },
  {
    step: '02',
    title: 'Space',
    description: activeSpace.value?.title ? activeSpace.value.title : 'General',
  },
  { step: '03', title: 'Mode', description: 'Phase 1 skeleton chat' },
])

const citationSamples = [
  { label: 'Sample source A', type: 'Retrieved from placeholder input' },
  { label: 'Sample source B', type: 'Stored context placeholder' },
]

const closeMenus = () => {
  spaceMenuId.value = ''
  threadMenuId.value = ''
}

const setActiveSpace = (spaceId: string) => {
  appStore.setActiveSpace(spaceId)
  closeMenus()
}

const setActiveThread = (threadId: string) => {
  appStore.setActiveThread(threadId)
  closeMenus()
}

const createSpace = () => {
  appStore.createSpace()
}

const createThreadInActiveSpace = () => {
  appStore.createThreadInActiveSpace()
}

const toggleSpaceMenu = (spaceId: string) => {
  spaceMenuId.value = spaceMenuId.value === spaceId ? '' : spaceId
}

const toggleThreadMenu = (threadId: string) => {
  threadMenuId.value = threadMenuId.value === threadId ? '' : threadId
}

const startRenameSpace = (spaceId: string, title: string) => {
  renamingSpaceId.value = spaceId
  spaceRenameValue.value = title
}

const renameCurrentSpace = (spaceId: string) => {
  appStore.renameSpace(spaceId, spaceRenameValue.value)
  renamingSpaceId.value = ''
  spaceRenameValue.value = ''
}

const cancelRenameSpace = () => {
  renamingSpaceId.value = ''
}

const archiveSpace = (spaceId: string) => {
  appStore.archiveSpace(spaceId)
  if (spaceMenuId.value === spaceId) {
    spaceMenuId.value = ''
  }
}

const deleteSpace = (spaceId: string) => {
  appStore.deleteSpace(spaceId)
  if (spaceMenuId.value === spaceId) {
    spaceMenuId.value = ''
  }
}

const startRenameThread = (threadId: string, title: string) => {
  renamingThreadId.value = threadId
  threadRenameValue.value = title
}

const renameCurrentThread = (threadId: string) => {
  appStore.renameThread(threadId, threadRenameValue.value)
  renamingThreadId.value = ''
  threadRenameValue.value = ''
}

const cancelRenameThread = () => {
  renamingThreadId.value = ''
}

const archiveThread = (threadId: string) => {
  appStore.archiveThread(threadId)
  if (threadMenuId.value === threadId) {
    threadMenuId.value = ''
  }
}

const deleteThread = (threadId: string) => {
  appStore.deleteThread(threadId)
  if (threadMenuId.value === threadId) {
    threadMenuId.value = ''
  }
}

const toggleBrainSources = () => {
  appStore.toggleBrainSources()
}

const sendMessage = () => {
  const text = composerValue.value.trim()
  if (!text) return

  if (!activeThread.value) {
    appStore.createThreadInActiveSpace()
  }

  const threadId = activeThread.value?.threadId
  if (!threadId) return

  appStore.addMessageToThread(threadId, 'user', text)
  const assistantId = appStore.addMessageToThread(threadId, 'assistant', 'Thinking...', true)
  composerValue.value = ''

  setTimeout(() => {
    appStore.updateMessage(threadId, assistantId, 'Phase 1 shell: assistant response appears here.', false)
  }, 450)
}
</script>
