<template>
  <div class="app-shell" :class="{ 'sidebar-collapsed': appStore.sidebarCollapsed }" @click="closeOpenMenus">
    <aside class="app-sidebar">
      <button class="sidebar-toggle icon-button" type="button" @click.stop="toggleSidebar" title="Hide sidebar">
        <PanelLeftClose v-if="!appStore.sidebarCollapsed" :size="19" />
        <PanelLeftOpen v-else :size="19" />
      </button>

      <button class="workspace-switcher" type="button" @click.stop="toggleWorkspaceMenu">
        <span class="workspace-tag">
          <span class="workspace-icon">
            <LayoutDashboard :size="15" />
          </span>
          <span class="workspace-copy">
            <small>Workspace</small>
            <strong>{{ activeWorkspaceLabel }}</strong>
          </span>
        </span>
        <ChevronsUpDown :size="15" />
      </button>

      <div v-if="appStore.workspaceMenuOpen" class="workspace-menu">
        <button
          v-for="workspace in workspaces"
          :key="workspace.slug"
          class="workspace-option"
          :class="{ active: workspace.slug === appStore.activeWorkspace, disabled: !workspace.enabled }"
          type="button"
          :disabled="!workspace.enabled"
          @click="activateWorkspace(workspace.slug)"
        >
          <span class="workspace-title">{{ workspace.label }}</span>
          <span class="workspace-subtle">{{ workspace.statusLabel }}</span>
          <Check v-if="workspace.slug === appStore.activeWorkspace" :size="14" />
          <Lock v-else-if="!workspace.enabled" :size="14" />
        </button>
      </div>

      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in programmeNav"
          :key="item.key"
          :to="workspaceRoute(item.to)"
          class="nav-item"
          active-class="active"
          @click="closeOpenMenus"
        >
          <component :is="navIcons[item.key]" :size="16" />
          <span>{{ item.label }}</span>
        </RouterLink>

        <RouterLink to="/spaces" class="nav-item nav-space" active-class="active" @click="closeOpenMenus">
          <FolderKanban :size="16" />
          <span>Spaces</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <button
          class="icon-button profile-launcher"
          type="button"
          :title="profileMenuOpen ? 'Close profile menu' : 'Open profile menu'"
          @click.stop="toggleProfileMenu"
        >
          <span class="profile-icon">JD</span>
        </button>

        <div v-if="profileMenuOpen" class="profile-popover">
          <RouterLink class="profile-item" to="/settings" @click="closeProfileMenu">
            <Settings2 :size="15" />
            <span>Settings</span>
          </RouterLink>
          <button class="profile-item" type="button" @click="logout">
            <LogOut :size="15" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </aside>

    <main class="app-main">
      <header class="app-topbar">
        <div class="app-topline">
          <p>{{ activePageLabel }}</p>
          <small>{{ activeWorkspaceLabel }} · workspace</small>
        </div>

        <div v-if="showProgrammeTabs" class="app-topbar-tabs">
          <RouterLink
            v-for="item in programmeNav"
            :key="item.key"
            :to="workspaceRoute(item.to)"
            class="tab-link"
            active-class="active"
          >
            <component :is="navIcons[item.key]" :size="15" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </div>
      </header>

      <section class="app-page-content">
        <RouterView />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  Check,
  ChevronsUpDown,
  FolderKanban,
  LayoutList,
  BarChart3,
  LayoutDashboard,
  Lock,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
} from '@lucide/vue'
import { computed, ref } from 'vue'
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
const profileMenuOpen = ref(false)

const navIcons = {
  overview: LayoutList,
  'data-health': BarChart3,
} as const

const activeWorkspaceLabel = computed(
  () => workspaces.find((workspace) => workspace.slug === appStore.activeWorkspace)?.label ?? 'Isomo',
)
const activePageLabel = computed(() => {
  const title = route.meta?.pageTitle
  if (typeof title === 'string' && title.length > 0) return title
  if (route.path === '/spaces') return 'Spaces'
  if (route.path === '/settings') return 'Settings'
  return 'Overview'
})
const showProgrammeTabs = computed(() => route.path.includes('/programmes/'))

const workspaceRoute = (baseRoute: string) => baseRoute.replace('/programmes/circles', `/programmes/${appStore.activeWorkspace}`)

const activateWorkspace = (workspaceSlug: WorkspaceSlug) => {
  const workspace = workspaces.find((item) => item.slug === workspaceSlug)
  if (!workspace?.enabled) return

  appStore.setWorkspace(workspaceSlug)
  const targetPath = workspaceSlugRoute(route.path)
  if (targetPath) {
    void router.push(targetPath)
  }
}

const workspaceSlugRoute = (path: string) => {
  if (path.includes('/programmes/')) {
    const section = path.split('/').pop()
    return section ? `/programmes/${appStore.activeWorkspace}/${section}` : undefined
  }
  return undefined
}

const toggleWorkspaceMenu = () => {
  appStore.toggleWorkspaceMenu()
}

const toggleSidebar = () => {
  appStore.toggleSidebarCollapsed()
}

const toggleProfileMenu = () => {
  profileMenuOpen.value = !profileMenuOpen.value
}

const closeProfileMenu = () => {
  profileMenuOpen.value = false
}

const closeOpenMenus = () => {
  closeProfileMenu()
  appStore.closeSurfaceMenus()
}

const logout = () => {
  closeProfileMenu()
  void router.push('/login')
}
</script>
