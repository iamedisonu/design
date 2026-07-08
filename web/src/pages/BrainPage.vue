<template>
  <div class="brain-home" :class="{ 'resources-open': appStore.brainSourcesOpen }">
    <section class="brain-center-stage">
      <div class="brain-wordmark">
        <span>Isomo</span>
        <h1>isomo brain</h1>
      </div>

      <div class="brain-prompt-shell">
        <textarea
          rows="2"
          :placeholder="
            activeThread?.spaceId === appStore.rootSpaceId
              ? 'Ask Isomo Brain...'
              : `Ask Isomo Brain inside ${activeSpace?.title ?? 'this space'}...`
          "
        />

        <div class="brain-prompt-actions">
          <button class="prompt-icon-button" type="button" title="New general chat" @click="createRootThread">
            <Plus :size="21" />
          </button>

          <button class="prompt-mode-button" type="button" title="Search mode">
            <Search :size="17" />
            <span>Search</span>
            <ChevronDown :size="15" />
          </button>

          <button class="prompt-mode-button" type="button" title="Create chat in active space" @click="createThread">
            <FolderOpen :size="17" />
            <span>{{ activeSpace?.title ?? 'Space' }}</span>
          </button>

          <span class="prompt-spacer"></span>

          <button class="prompt-model-button" type="button" title="Model">
            <span>Model</span>
            <ChevronDown :size="15" />
          </button>

          <button class="prompt-icon-button" type="button" title="Voice input">
            <Mic :size="18" />
          </button>

          <button class="prompt-send-button" type="button" title="Send">
            <AudioLines :size="21" />
          </button>
        </div>
      </div>

      <div class="brain-scope-row">
        <button
          v-for="space in availableSpaces"
          :key="space.spaceId"
          class="brain-scope-chip"
          :class="{ active: space.spaceId === activeSpace?.spaceId }"
          type="button"
          @click="setActiveSpace(space.spaceId)"
        >
          <FolderClosed :size="14" />
          <span>{{ space.title }}</span>
        </button>

        <button class="brain-scope-chip" type="button" @click="createSpace">
          <FolderPlus :size="14" />
          <span>New space</span>
        </button>

        <button class="brain-scope-chip" type="button" @click="toggleBrainSources">
          <PanelRightOpen v-if="!appStore.brainSourcesOpen" :size="14" />
          <PanelRightClose v-else :size="14" />
          <span>Resources</span>
        </button>
      </div>
    </section>

    <aside v-if="appStore.brainSourcesOpen" class="brain-resource-panel">
      <div class="brain-resource-header">
        <div>
          <p class="eyebrow">Resources</p>
          <h2>Retrieval path</h2>
        </div>
        <button class="icon-button sources-toggle-button" type="button" title="Hide resources" @click="toggleBrainSources">
          <PanelRightClose :size="16" />
        </button>
      </div>

      <div class="brain-resource-list">
        <article v-for="step in retrievalSteps" :key="step.step" class="brain-resource-item">
          <span>{{ step.step }}</span>
          <div>
            <strong>{{ step.title }}</strong>
            <small>{{ step.description }}</small>
          </div>
        </article>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import {
  AudioLines,
  ChevronDown,
  FolderClosed,
  FolderOpen,
  FolderPlus,
  Mic,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Search,
} from '@lucide/vue'
import { computed } from 'vue'
import { useAppStore, workspaces } from '../stores/app'

const appStore = useAppStore()

const activeWorkspaceLabel = computed(
  () => workspaces.find((workspace) => workspace.slug === appStore.activeWorkspace)?.label ?? 'Unknown workspace',
)
const activeSpace = computed(() => appStore.activeSpace)
const activeThread = computed(() => appStore.activeThread)
const availableSpaces = computed(() => appStore.availableSpaces)

const retrievalSteps = [
  {
    step: '1',
    title: 'Workspace',
    description: activeWorkspaceLabel.value,
  },
  {
    step: '2',
    title: 'Space',
    description: activeSpace.value?.title ?? 'General chats',
  },
  {
    step: '3',
    title: 'Citations',
    description: 'Source-backed answers will connect here in later phases.',
  },
]

const createThread = () => {
  appStore.createThread()
}

const createRootThread = () => {
  appStore.createRootThread()
}

const createSpace = () => {
  appStore.createSpace()
}

const setActiveSpace = (spaceId: string) => {
  appStore.setActiveSpace(spaceId)
}

const toggleBrainSources = () => {
  appStore.toggleBrainSources()
}
</script>
