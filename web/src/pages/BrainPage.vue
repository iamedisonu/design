<template>
  <div class="brain-workspace" :class="{ 'sources-hidden': !appStore.brainSourcesOpen }">
    <aside class="brain-rail brain-section-surface">
      <section class="brain-space-panel">
        <div class="rail-section-heading">
          <div>
            <h2 class="rail-section-label">Spaces</h2>
            <small>Foldered conversation groups for this programme.</small>
          </div>
          <button class="thread-action-button" type="button" title="New space" @click="createSpace">
            <Plus :size="16" />
          </button>
        </div>

        <div class="space-list">
          <div
            v-for="space in availableSpaces"
            :key="space.spaceId"
            class="space-row"
            :class="{ active: space.spaceId === activeSpace?.spaceId, 'menu-open': spaceMenuId === space.spaceId }"
          >
            <button class="space-item" type="button" :class="{ active: space.spaceId === activeSpace?.spaceId }" @click="setActiveSpace(space.spaceId)">
              <span class="space-item-icon">
                <FolderClosed :size="14" />
              </span>

              <span v-if="renamingSpaceId !== space.spaceId" class="space-item-copy">
                <strong>{{ space.title }}</strong>
                <small>{{ space.updatedAt }}</small>
              </span>

              <input
                v-else
                v-model="spaceRenameInput"
                class="thread-rename-input"
                type="text"
                @click.stop
                @blur="renameCurrentSpace(space.spaceId)"
                @keydown.enter="renameCurrentSpace(space.spaceId)"
                @keydown.escape="cancelSpaceRename"
              />
            </button>

            <div class="space-menu-shell" :class="{ open: spaceMenuOpenFor(space.spaceId) }">
              <button
                class="thread-more-button"
                type="button"
                title="Space menu"
                @click.stop="toggleSpaceMenu(space.spaceId)"
              >
                <MoreVertical :size="14" />
              </button>

              <div class="thread-menu">
                <button class="thread-menu-item" type="button" @click="startSpaceRename(space.spaceId, space.title)">
                  Rename
                </button>
                <button class="thread-menu-item" type="button" @click="archiveSpace(space.spaceId)">
                  Archive
                </button>
                <button class="thread-menu-item destructive" type="button" @click="deleteSpace(space.spaceId)">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="brain-chat-panel">
        <div class="rail-section-heading">
          <div>
            <h2 class="rail-section-label">Chats</h2>
            <small>{{ activeSpace?.title ?? 'Select a space' }}</small>
          </div>
          <button
            class="chat-create-button compact-button primary-button"
            type="button"
            :disabled="!activeSpace"
            @click="createThreadInActiveSpace"
          >
            <Plus :size="13" />
            New
          </button>
        </div>

        <div class="thread-list">
          <p v-if="activeThreads.length === 0" class="rail-empty-state">
            <strong>No chats yet.</strong>
            <small>Create a chat in this space.</small>
          </p>

          <div
            v-for="thread in activeThreads"
            :key="thread.threadId"
            class="thread-row"
            :class="{ active: thread.threadId === activeThread?.threadId, 'menu-open': threadMenuId === thread.threadId }"
          >
            <button
              class="thread-item"
              type="button"
              :class="{ active: thread.threadId === activeThread?.threadId }"
              @click="setActiveThread(thread.threadId)"
            >
              <div class="thread-item-copy">
                <strong>{{ thread.title }}</strong>
                <small>{{ thread.updatedAt }}</small>
              </div>
            </button>

            <div class="thread-menu-shell" :class="{ open: threadMenuOpenFor(thread.threadId) }">
              <button
                class="thread-more-button"
                type="button"
                title="Thread menu"
                @click.stop="toggleThreadMenu(thread.threadId)"
              >
                <MoreVertical :size="14" />
              </button>

              <div class="thread-menu">
                <button
                  class="thread-menu-item"
                  type="button"
                  @click="startThreadRename(thread.threadId, thread.title)"
                >
                  Rename
                </button>
                <button class="thread-menu-item" type="button" @click="archiveThread(thread.threadId)">
                  Archive
                </button>
                <button class="thread-menu-item destructive" type="button" @click="deleteThread(thread.threadId)">
                  Delete
                </button>
              </div>
            </div>

              <input
                v-if="renamingThreadId === thread.threadId"
                v-model="threadRenameInput"
                class="thread-rename-input"
                type="text"
                @click.stop
                @blur="renameCurrentThread(thread.threadId)"
                @keydown.enter="renameCurrentThread(thread.threadId)"
                @keydown.escape="cancelThreadRename"
              />
          </div>
        </div>
      </section>
    </aside>

    <main class="brain-canvas brain-section-surface">
      <header class="brain-toolbar">
        <div>
          <h1>{{ activeSpace?.title ?? 'Select a space' }}</h1>
          <p class="brain-toolbar-subtitle">
            {{ activeSpace ? `Conversations stay in ${activeSpace.title}` : 'Pick a space to continue.' }}
          </p>
        </div>

        <div class="route-chip-group">
          <button class="topbar-pill">
            <FolderKanban :size="14" />
            <span>Spaces</span>
          </button>
          <button class="topbar-pill">
            <History :size="14" />
            <span>{{ activeThreads.length }} chats</span>
          </button>
        </div>
      </header>

      <section class="brain-scroll">
        <div v-if="displayMessages.length === 0" class="brain-empty-state">
          <strong>Start a conversation in this space.</strong>
          <p>Ask your question in the composer and the thread will grow here.</p>
        </div>

        <div v-else class="message-stack">
          <article
            v-for="message in displayMessages"
            :key="message.id"
            class="chat-message"
            :class="message.role"
          >
            <div class="message-meta">
              <span class="message-role">{{ message.role === 'user' ? 'You' : 'Assistant' }}</span>
              <small>{{ message.loading ? 'Working...' : 'Phase 1 shell' }}</small>
            </div>
            <div class="message-card">
              <span v-if="message.loading">Generating...</span>
              <span v-else>{{ message.text }}</span>
            </div>
          </article>
        </div>
      </section>

      <footer class="brain-composer">
        <form class="composer-surface" @submit.prevent="sendMessage">
          <textarea
            v-model="composerValue"
            rows="1"
            placeholder="Ask something inside this space..."
            @keydown.enter.prevent.exact="sendMessage"
          />
          <div class="composer-footer">
            <button class="thread-action-button" type="button" title="Search mode">
              <Search :size="15" />
            </button>
            <button class="thread-action-button" type="button" title="Toggle sources" @click="toggleBrainSources">
              <PanelRightOpen v-if="!appStore.brainSourcesOpen" :size="15" />
              <PanelRightClose v-else :size="15" />
            </button>
            <button class="primary-button" type="submit">
              <Send :size="16" />
              Send
            </button>
          </div>
        </form>
      </footer>
    </main>

    <aside v-if="appStore.brainSourcesOpen" class="brain-sources brain-section-surface">
      <div class="sources-card sources-overview-card">
        <div class="sources-card-header">
          <div>
            <p class="eyebrow">Resources</p>
            <h2>Retrieval path</h2>
          </div>
          <button
            class="thread-action-button sources-toggle-button"
            type="button"
            title="Hide sources"
            @click="toggleBrainSources"
          >
            <PanelRightClose :size="16" />
          </button>
        </div>

        <div class="retrieval-flow">
          <article v-for="step in retrievalSteps" :key="step.step" class="retrieval-step">
            <span class="retrieval-step-index">{{ step.step }}</span>
            <div class="retrieval-step-copy">
              <strong>{{ step.title }}</strong>
              <small>{{ step.description }}</small>
            </div>
          </article>
        </div>
      </div>
      <div class="sources-card citations-card">
        <div class="citation-item-top">
          <strong>Citations</strong>
        </div>
        <div class="citation-list">
          <article v-for="source in citationSamples" :key="source.label" class="citation-item">
            <div class="citation-item-top">
              <strong>{{ source.label }}</strong>
              <small>{{ source.type }}</small>
            </div>
            <small>{{ source.text }}</small>
          </article>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import {
  FolderClosed,
  FolderKanban,
  History,
  MoreVertical,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Search,
  Send,
} from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { useAppStore, workspaces, type BrainThread } from '../stores/app'

type DisplayMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  loading?: boolean
}

const appStore = useAppStore()

const composerValue = ref('')
const messageThreads = ref<Record<string, DisplayMessage[]>>({})
const spaceMenuId = ref('')
const threadMenuId = ref('')
const renamingSpaceId = ref('')
const renamingThreadId = ref('')
const spaceRenameInput = ref('')
const threadRenameInput = ref('')

const activeWorkspaceLabel = computed(
  () => workspaces.find((workspace) => workspace.slug === appStore.activeWorkspace)?.label ?? 'Unknown workspace',
)
const activeSpace = computed(() => appStore.activeSpace)
const activeThread = computed(() => appStore.activeThread)
const availableSpaces = computed(() => appStore.availableSpaces)

const activeThreads = computed<BrainThread[]>(() =>
  appStore.threads.filter(
    (thread) =>
      thread.workspaceSlug === appStore.activeWorkspace &&
      thread.spaceId === activeSpace.value?.spaceId &&
      thread.status === 'active',
  ),
)

const displayMessages = computed<DisplayMessage[]>(() => {
  const threadId = activeThread.value?.threadId
  return threadId ? messageThreads.value[threadId] ?? [] : []
})

const retrievalSteps = computed(() => [
  {
    step: '01',
    title: 'Workspace',
    description: activeWorkspaceLabel.value,
  },
  {
    step: '02',
    title: 'Space',
    description: activeSpace.value?.title ?? 'No active space',
  },
  {
    step: '03',
    title: 'Chats',
    description: `${activeThreads.value.length} chat files`,
  },
])

const citationSamples = computed(() => [
  { label: 'Workspace context', type: 'Source', text: 'Space instructions guide how prompts are routed.' },
  { label: 'Upload assets', type: 'Source', text: 'Files added later will appear by retrieval step.' },
])

const spaceMenuOpenFor = (spaceId: string) => spaceMenuId.value === spaceId
const threadMenuOpenFor = (threadId: string) => threadMenuId.value === threadId

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
  appStore.createThread()
}

const toggleSpaceMenu = (spaceId: string) => {
  spaceMenuId.value = spaceMenuId.value === spaceId ? '' : spaceId
  threadMenuId.value = ''
}

const toggleThreadMenu = (threadId: string) => {
  threadMenuId.value = threadMenuId.value === threadId ? '' : threadId
  spaceMenuId.value = ''
}

const startSpaceRename = (spaceId: string, title: string) => {
  renamingSpaceId.value = spaceId
  spaceRenameInput.value = title
  spaceMenuId.value = ''
}

const startThreadRename = (threadId: string, title: string) => {
  renamingThreadId.value = threadId
  threadRenameInput.value = title
  threadMenuId.value = ''
}

const renameCurrentSpace = (spaceId: string) => {
  appStore.renameSpace(spaceId, spaceRenameInput.value)
  renamingSpaceId.value = ''
}

const renameCurrentThread = (threadId: string) => {
  appStore.renameThread(threadId, threadRenameInput.value)
  renamingThreadId.value = ''
}

const cancelSpaceRename = () => {
  renamingSpaceId.value = ''
}

const cancelThreadRename = () => {
  renamingThreadId.value = ''
}

const archiveThread = (threadId: string) => {
  appStore.archiveThread(threadId)
  closeMenus()
}

const deleteThread = (threadId: string) => {
  appStore.deleteThread(threadId)
  closeMenus()
}

const archiveSpace = (spaceId: string) => {
  appStore.archiveSpace(spaceId)
  closeMenus()
}

const deleteSpace = (spaceId: string) => {
  appStore.deleteSpace(spaceId)
  if (activeSpace.value?.spaceId === spaceId) {
    const nextSpace = availableSpaces.value.find((space) => space.spaceId !== spaceId)
    if (nextSpace) {
      appStore.setActiveSpace(nextSpace.spaceId)
    }
  }
  closeMenus()
}

const sendMessage = () => {
  let thread = activeThread.value
  if (!thread) {
    appStore.createThread()
    thread = appStore.activeThread
  }
  if (!thread) return
  const text = composerValue.value.trim()
  if (!text) return

  const now = Date.now()
  const userMessage: DisplayMessage = {
    id: `msg-${thread.threadId}-${now}-u`,
    role: 'user',
    text,
  }
  const placeholderMessage: DisplayMessage = {
    id: `msg-${thread.threadId}-${now}-a`,
    role: 'assistant',
    text: '',
    loading: true,
  }

  messageThreads.value = {
    ...messageThreads.value,
    [thread.threadId]: [...(messageThreads.value[thread.threadId] ?? []), userMessage, placeholderMessage],
  }

  composerValue.value = ''
}

const toggleBrainSources = () => {
  appStore.toggleBrainSources()
}

const closeMenus = () => {
  spaceMenuId.value = ''
  threadMenuId.value = ''
}

watch(
  () => appStore.activeThread?.threadId,
  (threadId) => {
    if (!threadId) return
    if (!messageThreads.value[threadId]) {
      messageThreads.value[threadId] = []
    }
  },
  { immediate: true },
)
</script>
