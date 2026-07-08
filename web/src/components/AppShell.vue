<template>
  <div class="shell ai-shell" :class="{ 'sidebar-collapsed': appStore.sidebarCollapsed }" @click="closeSurfaceMenus">
    <aside class="shell-sidebar" :class="{ collapsed: appStore.sidebarCollapsed }" @click.stop>
      <div class="ai-brand-row">
        <button
          class="brand-mark-button"
          :aria-label="appStore.sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'"
          :title="appStore.sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'"
          type="button"
          @click="toggleSidebarCollapsed"
        >
          <span class="brand-mark"></span>
        </button>

        <button class="ai-collapse-button" type="button" title="Toggle menu" @click="toggleSidebarCollapsed">
          <PanelLeftClose v-if="!appStore.sidebarCollapsed" :size="18" />
          <PanelLeftOpen v-else :size="18" />
        </button>
      </div>

      <button class="ai-new-button" type="button" title="New chat" @click="createNewBrainChat">
        <span class="ai-new-icon">
          <Plus :size="21" />
        </span>
        <span>New</span>
      </button>

      <nav class="ai-sidebar-menu">
        <div class="workspace-stack">
          <button
            class="ai-sidebar-link workspace-trigger"
            type="button"
            :title="activeWorkspaceLabel"
            @click="toggleWorkspaceMenu"
          >
            <span class="ai-sidebar-icon live">
              <Monitor :size="18" />
            </span>
            <span class="workspace-trigger-copy single">
              <strong>{{ activeWorkspaceLabel }}</strong>
            </span>
            <ChevronsUpDown :size="15" />
          </button>

          <div v-if="appStore.workspaceMenuOpen" class="workspace-menu ai-workspace-menu">
            <button
              v-for="workspace in workspaces"
              :key="workspace.slug"
              class="workspace-option"
              :class="{ active: workspace.slug === appStore.activeWorkspace, disabled: !workspace.enabled }"
              type="button"
              :disabled="!workspace.enabled"
              @click="activateWorkspace(workspace.slug)"
            >
              <span class="workspace-option-copy">
                <strong>{{ workspace.label }}</strong>
                <small>{{ workspace.statusLabel }}</small>
              </span>
              <span class="workspace-option-status">
                <Check v-if="workspace.slug === appStore.activeWorkspace" :size="16" />
                <Lock v-else-if="!workspace.enabled" :size="16" />
              </span>
            </button>
          </div>
        </div>

        <RouterLink class="ai-sidebar-link" active-class="active" to="/isomo-brain" title="Isomo Brain" @click="closeSurfaceMenus">
          <BrainCircuit :size="18" />
          <span>Isomo Brain</span>
        </RouterLink>

        <button class="ai-sidebar-link" type="button" title="Spaces" @click="goBrain">
          <FolderKanban :size="18" />
          <span>Spaces</span>
        </button>

        <RouterLink class="ai-sidebar-link" active-class="active" to="/settings" title="Settings" @click="closeSurfaceMenus">
          <SlidersHorizontal :size="18" />
          <span>Customize</span>
        </RouterLink>
      </nav>

      <div class="ai-sidebar-muted-links">
        <span>Connectors</span>
        <span>Skills</span>
        <span>Workflows</span>
        <span>Memory</span>
      </div>

      <section class="ai-history-panel">
        <div class="ai-history-heading">
          <History :size="17" />
          <span>History</span>
        </div>

        <button
          v-for="thread in appStore.workspaceActiveThreads.slice(0, 10)"
          :key="thread.threadId"
          class="ai-history-item"
          type="button"
          @click="openThread(thread.threadId)"
        >
          <span>{{ thread.title }}</span>
          <i aria-hidden="true"></i>
        </button>
      </section>

      <div class="sidebar-footer ai-footer">
        <RouterLink class="ai-profile-link" to="/settings" title="John Doe" @click="closeSurfaceMenus">
          <span class="account-avatar">JD</span>
          <span class="account-copy">
            <strong>John Doe</strong>
            <small>Signed in</small>
          </span>
        </RouterLink>

        <RouterLink class="icon-button footer-icon-button settings-icon-button" to="/settings" title="Settings" @click="closeSurfaceMenus">
          <Settings2 :size="18" />
        </RouterLink>
      </div>
    </aside>

    <main class="shell-main">
      <header class="app-topbar">
        <nav class="topbar-nav" aria-label="Programme pages">
          <RouterLink
            v-for="item in programmeNav"
            :key="item.key"
            :to="workspaceRoute(item.to)"
            class="topbar-link"
            active-class="active"
            @click="closeSurfaceMenus"
          >
            <component :is="navIcons[item.key]" :size="15" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </nav>

        <div class="topbar-actions" aria-hidden="true"></div>
      </header>

      <div class="page-body">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  BrainCircuit,
  Check,
  ChevronsUpDown,
  FolderKanban,
  History,
  LayoutDashboard,
  Lock,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings2,
  ShieldAlert,
  SlidersHorizontal,
} from '@lucide/vue'
import { computed, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import {
  programmeNav,
  workspaces,
  useAppStore,
  type WorkspaceSlug,
} from '../stores/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const navIcons = {
  overview: LayoutDashboard,
  'data-health': ShieldAlert,
} as const

const activeWorkspaceLabel = computed(
  () => workspaces.find((workspace) => workspace.slug === appStore.activeWorkspace)?.label ?? 'Unknown workspace',
)

const workspaceRoute = (baseRoute: string) =>
  baseRoute.replace('/programmes/circles', `/programmes/${appStore.activeWorkspace}`)

const activeProgrammeKey = computed(() => {
  const routeName = typeof route.name === 'string' ? route.name : ''
  return programmeNav.find((item) => item.key === routeName)?.key ?? 'overview'
})

const isProgrammeView = computed(() => {
  const routeName = typeof route.name === 'string' ? route.name : ''
  return programmeNav.some((item) => item.key === routeName)
})

const activateWorkspace = (workspaceSlug: WorkspaceSlug) => {
  const workspace = workspaces.find((item) => item.slug === workspaceSlug)
  if (!workspace?.enabled) return

  appStore.setWorkspace(workspaceSlug)

  if (isProgrammeView.value) {
    void router.push(`/programmes/${workspaceSlug}/${activeProgrammeKey.value}`)
    return
  }

  appStore.closeSurfaceMenus()
}

const goBrain = () => {
  closeSurfaceMenus()
  void router.push('/isomo-brain')
}

const createNewBrainChat = () => {
  appStore.createRootThread()
  closeSurfaceMenus()
  void router.push('/isomo-brain')
}

const openThread = (threadId: string) => {
  const thread = appStore.workspaceActiveThreads.find((item) => item.threadId === threadId)
  if (!thread) return

  if (thread.spaceId !== appStore.rootSpaceId) {
    appStore.setActiveSpace(thread.spaceId)
  }

  appStore.setActiveThread(threadId)
  closeSurfaceMenus()
  void router.push('/isomo-brain')
}

const toggleWorkspaceMenu = () => {
  appStore.toggleWorkspaceMenu()
}

const toggleSidebarCollapsed = () => {
  appStore.toggleSidebarCollapsed()
}

const closeSurfaceMenus = () => {
  appStore.closeSurfaceMenus()
}

watch(
  () => route.params.workspaceSlug,
  (workspaceSlug) => {
    if (typeof workspaceSlug !== 'string') return

    const workspace = workspaces.find((item) => item.slug === workspaceSlug)
    if (!workspace?.enabled) {
      void router.replace(`/programmes/${appStore.activeWorkspace}/${activeProgrammeKey.value}`)
      return
    }

    if (workspaceSlug !== appStore.activeWorkspace) {
      appStore.setWorkspace(workspaceSlug as WorkspaceSlug)
    }
  },
  { immediate: true },
)

watch(
  () => route.fullPath,
  () => {
    closeSurfaceMenus()
  },
)
</script>
