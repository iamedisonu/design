import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

export type ThemeMode = 'system' | 'light' | 'dark'
export type ThemePreset = 'isomo' | 'lagoon' | 'grove' | 'cinder' | 'ember' | 'clay'
export type WorkspaceSlug = 'circles' | 'academy' | 'iris' | 'graduate'
export type NavKey = 'overview' | 'data-health'
export type BrainThreadStatus = 'active' | 'archived' | 'deleted'

export type Workspace = {
  slug: WorkspaceSlug
  label: string
  enabled: boolean
  statusLabel: string
}

export type BrainSpace = {
  spaceId: string
  workspaceSlug: WorkspaceSlug
  title: string
  updatedAt: string
  status: BrainThreadStatus
}

export type BrainThread = {
  threadId: string
  spaceId: string
  workspaceSlug: WorkspaceSlug
  title: string
  updatedAt: string
  status: BrainThreadStatus
  messages: Array<{
    id: string
    role: 'user' | 'assistant'
  }>
}

export const workspaces: Workspace[] = [
  { slug: 'circles', label: 'Isomo Circles', enabled: true, statusLabel: 'Available now' },
  { slug: 'academy', label: 'Academy', enabled: false, statusLabel: 'Coming soon' },
  { slug: 'iris', label: 'IRIS', enabled: false, statusLabel: 'Coming soon' },
  { slug: 'graduate', label: 'Graduate', enabled: false, statusLabel: 'Coming soon' },
]

export const programmeNav = [
  { key: 'overview', label: 'Overview', to: '/programmes/circles/overview' },
  { key: 'data-health', label: 'Data Health', to: '/programmes/circles/data-health' },
] as const

const THEME_KEY = 'isomo-theme'
const WORKSPACE_KEY = 'isomo-workspace'
const THREAD_KEY = 'isomo-brain-thread'
const THREADS_KEY = 'isomo-brain-threads'
const SPACES_KEY = 'isomo-brain-spaces'
const SPACE_KEY = 'isomo-brain-space'
const SIDEBAR_KEY = 'isomo-sidebar-collapsed'
const THEME_PRESET_KEY = 'isomo-theme-preset'
const ROOT_SPACE_PREFIX = 'root-space'

const defaultSpaces: BrainSpace[] = [
  {
    spaceId: 'circles-space-1',
    workspaceSlug: 'circles',
    title: 'Space 1',
    updatedAt: 'Updated now',
    status: 'active',
  },
  {
    spaceId: 'circles-space-2',
    workspaceSlug: 'circles',
    title: 'Space 2',
    updatedAt: 'Updated earlier',
    status: 'active',
  },
]

const defaultThreads: BrainThread[] = [
  {
    threadId: 'circles-thread-1',
    spaceId: 'circles-space-1',
    workspaceSlug: 'circles',
    title: 'Conversation 1',
    updatedAt: 'Updated now',
    status: 'active',
    messages: [
      { id: 'm1', role: 'user' },
      { id: 'm2', role: 'assistant' },
    ],
  },
  {
    threadId: 'circles-thread-2',
    spaceId: 'circles-space-1',
    workspaceSlug: 'circles',
    title: 'Conversation 2',
    updatedAt: 'Updated earlier',
    status: 'active',
    messages: [
      { id: 'm3', role: 'user' },
      { id: 'm4', role: 'assistant' },
    ],
  },
  {
    threadId: 'circles-thread-3',
    spaceId: 'circles-space-2',
    workspaceSlug: 'circles',
    title: 'Conversation 1',
    updatedAt: 'Updated earlier',
    status: 'active',
    messages: [
      { id: 'm5', role: 'user' },
      { id: 'm6', role: 'assistant' },
    ],
  },
]

const getStoredTheme = (): ThemeMode => {
  const stored = localStorage.getItem(THEME_KEY)
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
}

const getStoredWorkspace = (): WorkspaceSlug => {
  const stored = localStorage.getItem(WORKSPACE_KEY)
  return workspaces.some((workspace) => workspace.slug === stored && workspace.enabled)
    ? (stored as WorkspaceSlug)
    : 'circles'
}

const getStoredThread = (): string => localStorage.getItem(THREAD_KEY) ?? defaultThreads[0].threadId

const getStoredSpace = (): string => localStorage.getItem(SPACE_KEY) ?? defaultSpaces[0].spaceId

const getStoredSidebarCollapsed = (): boolean => localStorage.getItem(SIDEBAR_KEY) === 'true'

const getStoredThemePreset = (): ThemePreset => {
  const stored = localStorage.getItem(THEME_PRESET_KEY)
  return stored === 'lagoon' ||
    stored === 'grove' ||
    stored === 'cinder' ||
    stored === 'ember' ||
    stored === 'clay' ||
    stored === 'isomo'
    ? stored
    : 'isomo'
}

const getStoredThreads = (): BrainThread[] => {
  const stored = localStorage.getItem(THREADS_KEY)
  if (!stored) return defaultThreads

  try {
    const parsed = JSON.parse(stored) as Array<Partial<BrainThread>>
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultThreads

    return parsed.map((thread, index) => ({
      threadId: thread.threadId ?? `circles-thread-restored-${index}`,
      spaceId: thread.spaceId ?? 'circles-space-1',
      workspaceSlug: (thread.workspaceSlug as WorkspaceSlug | undefined) ?? 'circles',
      title: thread.title ?? `Conversation ${index + 1}`,
      updatedAt: thread.updatedAt ?? 'Updated earlier',
      status: thread.status ?? 'active',
      messages: Array.isArray(thread.messages) ? thread.messages : [],
    }))
  } catch {
    return defaultThreads
  }
}

const getStoredSpaces = (): BrainSpace[] => {
  const stored = localStorage.getItem(SPACES_KEY)
  if (!stored) return defaultSpaces

  try {
    const parsed = JSON.parse(stored) as Array<Partial<BrainSpace>>
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultSpaces

    return parsed.map((space, index) => ({
      spaceId: space.spaceId ?? `circles-space-restored-${index}`,
      workspaceSlug: (space.workspaceSlug as WorkspaceSlug | undefined) ?? 'circles',
      title: space.title ?? `Space ${index + 1}`,
      updatedAt: space.updatedAt ?? 'Updated earlier',
      status: space.status ?? 'active',
    }))
  } catch {
    return defaultSpaces
  }
}

export const useAppStore = defineStore('app', () => {
  const theme = ref<ThemeMode>(getStoredTheme())
  const themePreset = ref<ThemePreset>(getStoredThemePreset())
  const activeWorkspace = ref<WorkspaceSlug>(getStoredWorkspace())
  const workspaceMenuOpen = ref(false)
  const sidebarCollapsed = ref(getStoredSidebarCollapsed())
  const brainSourcesOpen = ref(true)
  const spaces = ref<BrainSpace[]>(getStoredSpaces())
  const threads = ref<BrainThread[]>(getStoredThreads())
  const activeSpaceId = ref(getStoredSpace())
  const activeThreadId = ref(getStoredThread())
  const rootSpaceId = computed(() => `${activeWorkspace.value}-${ROOT_SPACE_PREFIX}`)

  const availableSpaces = computed(() =>
    spaces.value.filter((space) => space.workspaceSlug === activeWorkspace.value && space.status === 'active'),
  )

  const activeSpace = computed(
    () => availableSpaces.value.find((space) => space.spaceId === activeSpaceId.value) ?? availableSpaces.value[0],
  )

  const availableThreads = computed(() => {
    if (!activeSpace.value) return []
    return threads.value.filter(
      (thread) =>
        thread.workspaceSlug === activeWorkspace.value &&
        thread.spaceId === activeSpace.value?.spaceId &&
        thread.status === 'active',
    )
  })

  const workspaceActiveThreads = computed(() =>
    threads.value.filter((thread) => thread.workspaceSlug === activeWorkspace.value && thread.status === 'active'),
  )

  const workspaceRootThreads = computed(() =>
    workspaceActiveThreads.value.filter((thread) => thread.spaceId === rootSpaceId.value),
  )

  const activeThreadCandidates = computed(() =>
    threads.value.filter(
      (thread) =>
        thread.workspaceSlug === activeWorkspace.value &&
        thread.status === 'active' &&
        (thread.spaceId === rootSpaceId.value ||
          (activeSpace.value && thread.spaceId === activeSpace.value.spaceId) ||
          thread.spaceId === availableSpaces.value[0]?.spaceId),
    ),
  )

  const archivedThreads = computed(() => threads.value.filter((thread) => thread.status === 'archived'))

  const deletedThreads = computed(() => threads.value.filter((thread) => thread.status === 'deleted'))

  const activeThread = computed(
    () =>
      activeThreadCandidates.value.find((thread) => thread.threadId === activeThreadId.value) ??
      availableThreads.value[0] ??
      workspaceRootThreads.value[0] ??
      activeThreadCandidates.value[0],
  )

  const syncActiveSpace = () => {
    const currentSpace = availableSpaces.value.find((space) => space.spaceId === activeSpaceId.value)
    if (currentSpace) return
    activeSpaceId.value = availableSpaces.value[0]?.spaceId ?? ''
  }

  const syncActiveThread = () => {
    const currentThread = activeThreadCandidates.value.find((thread) => thread.threadId === activeThreadId.value)
    if (currentThread) return
    activeThreadId.value =
      availableThreads.value[0]?.threadId ??
      workspaceRootThreads.value[0]?.threadId ??
      activeThreadCandidates.value[0]?.threadId ??
      ''
  }

  const syncSelections = () => {
    syncActiveSpace()
    syncActiveThread()
  }

  const updateThreadList = (transform: (thread: BrainThread) => BrainThread) => {
    threads.value = threads.value.map(transform)
    syncSelections()
  }

  const nextSpaceTitle = () => {
    const count = spaces.value.filter((space) => space.workspaceSlug === activeWorkspace.value).length
    return `Space ${count + 1}`
  }

  const nextThreadTitle = (spaceId: string) => {
    const count = threads.value.filter(
      (thread) =>
        thread.workspaceSlug === activeWorkspace.value &&
        thread.spaceId === spaceId &&
        thread.status === 'active',
    ).length
    return `Conversation ${count + 1}`
  }

  const closeWorkspaceMenu = () => {
    workspaceMenuOpen.value = false
  }

  const closeSurfaceMenus = () => {
    closeWorkspaceMenu()
  }

  const toggleSidebarCollapsed = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
    closeSurfaceMenus()
  }

  const setTheme = (nextTheme: ThemeMode) => {
    theme.value = nextTheme
  }

  const setThemePreset = (nextPreset: ThemePreset) => {
    themePreset.value = nextPreset
  }

  const setWorkspace = (workspaceSlug: WorkspaceSlug) => {
    const target = workspaces.find((workspace) => workspace.slug === workspaceSlug)
    if (!target?.enabled) return
    activeWorkspace.value = workspaceSlug
    syncSelections()
    closeSurfaceMenus()
  }

  const setActiveSpace = (spaceId: string) => {
    const space = availableSpaces.value.find((candidate) => candidate.spaceId === spaceId)
    if (!space) return
    activeSpaceId.value = spaceId
    syncActiveThread()
  }

  const setActiveThread = (threadId: string) => {
    const thread = activeThreadCandidates.value.find((candidate) => candidate.threadId === threadId)
    if (!thread) return
    activeThreadId.value = threadId
  }

  const createSpace = () => {
    const spaceId = `${activeWorkspace.value}-space-${Date.now()}`
    const nextSpace: BrainSpace = {
      spaceId,
      workspaceSlug: activeWorkspace.value,
      title: nextSpaceTitle(),
      updatedAt: 'Updated now',
      status: 'active',
    }

    spaces.value = [nextSpace, ...spaces.value]
    activeSpaceId.value = spaceId

    const nextThread: BrainThread = {
      threadId: `${activeWorkspace.value}-thread-${Date.now() + 1}`,
      spaceId,
      workspaceSlug: activeWorkspace.value,
      title: 'Conversation 1',
      updatedAt: 'Updated now',
      status: 'active',
      messages: [],
    }

    threads.value = [nextThread, ...threads.value]
    activeThreadId.value = nextThread.threadId
  }

  const createThread = () => {
    if (!activeSpace.value) return

    const threadId = `${activeWorkspace.value}-thread-${Date.now()}`
    const nextThread: BrainThread = {
      threadId,
      spaceId: activeSpace.value.spaceId,
      workspaceSlug: activeWorkspace.value,
      title: nextThreadTitle(activeSpace.value.spaceId),
      updatedAt: 'Updated now',
      status: 'active',
      messages: [],
    }

    threads.value = [nextThread, ...threads.value]
    activeThreadId.value = threadId
  }

  const createRootThread = () => {
    const threadId = `${activeWorkspace.value}-root-thread-${Date.now()}`
    const nextThread: BrainThread = {
      threadId,
      spaceId: rootSpaceId.value,
      workspaceSlug: activeWorkspace.value,
      title: `Conversation ${workspaceRootThreads.value.length + 1}`,
      updatedAt: 'Updated now',
      status: 'active',
      messages: [],
    }

    threads.value = [nextThread, ...threads.value]
    activeThreadId.value = threadId
  }

  const renameSpace = (spaceId: string, title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return

    spaces.value = spaces.value.map((space) =>
      space.spaceId === spaceId
        ? {
            ...space,
            title: trimmed,
            updatedAt: 'Renamed now',
          }
        : space,
    )
  }

  const archiveSpace = (spaceId: string) => {
    spaces.value = spaces.value.map((space) =>
      space.spaceId === spaceId
        ? {
            ...space,
            status: 'archived',
            updatedAt: 'Archived now',
          }
        : space,
    )

    updateThreadList((thread) =>
      thread.spaceId === spaceId && thread.status === 'active'
        ? {
            ...thread,
            status: 'archived',
            updatedAt: 'Archived now',
          }
        : thread,
    )
  }

  const deleteSpace = (spaceId: string) => {
    const space = spaces.value.find((item) => item.spaceId === spaceId)
    if (!space) return

    spaces.value = spaces.value.map((item) =>
      item.spaceId === spaceId
        ? {
            ...item,
            status: 'deleted',
            updatedAt: 'Moved to bin',
          }
        : item,
    )

    updateThreadList((thread) =>
      thread.spaceId === spaceId && thread.status !== 'deleted'
        ? {
            ...thread,
            status: 'deleted',
            updatedAt: 'Moved to bin',
          }
        : thread,
    )

    syncSelections()
  }

  const renameThread = (threadId: string, title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return

    updateThreadList((thread) =>
      thread.threadId === threadId
        ? {
            ...thread,
            title: trimmed,
            updatedAt: 'Renamed now',
          }
        : thread,
    )
  }

  const archiveThread = (threadId: string) => {
    updateThreadList((thread) =>
      thread.threadId === threadId
        ? {
            ...thread,
            status: 'archived',
            updatedAt: 'Archived now',
          }
        : thread,
    )
  }

  const deleteThread = (threadId: string) => {
    updateThreadList((thread) =>
      thread.threadId === threadId
        ? {
            ...thread,
            status: 'deleted',
            updatedAt: 'Moved to bin',
          }
        : thread,
    )
  }

  const restoreThread = (threadId: string) => {
    const restored = threads.value.find((thread) => thread.threadId === threadId)

    if (restored) {
      spaces.value = spaces.value.map((space) =>
        restored.spaceId !== rootSpaceId.value && space.spaceId === restored.spaceId && space.status !== 'active'
          ? {
              ...space,
              status: 'active',
              updatedAt: 'Restored now',
            }
          : space,
      )
    }

    updateThreadList((thread) =>
      thread.threadId === threadId
        ? {
            ...thread,
            status: 'active',
            updatedAt: 'Restored now',
          }
        : thread,
    )

    const restoredThread = threads.value.find((thread) => thread.threadId === threadId)
    if (restoredThread?.workspaceSlug === activeWorkspace.value) {
      if (restoredThread.spaceId !== rootSpaceId.value) {
        activeSpaceId.value = restoredThread.spaceId
      }
      activeThreadId.value = threadId
    }
  }

  const restoreThreads = (threadIds: string[]) => {
    if (threadIds.length === 0) return

    const idSet = new Set(threadIds)
    const restoredSpaceIds = new Set(
      threads.value.filter((thread) => idSet.has(thread.threadId)).map((thread) => thread.spaceId),
    )

    spaces.value = spaces.value.map((space) =>
      restoredSpaceIds.has(space.spaceId) &&
      space.spaceId !== rootSpaceId.value &&
      space.status !== 'active'
        ? {
            ...space,
            status: 'active',
            updatedAt: 'Restored now',
          }
        : space,
    )

    updateThreadList((thread) =>
      idSet.has(thread.threadId)
        ? {
            ...thread,
            status: 'active',
            updatedAt: 'Restored now',
          }
        : thread,
    )

    const restored = threads.value.find(
      (thread) => idSet.has(thread.threadId) && thread.workspaceSlug === activeWorkspace.value,
    )

    if (restored) {
      if (restored.spaceId !== rootSpaceId.value) {
        activeSpaceId.value = restored.spaceId
      }
      activeThreadId.value = restored.threadId
    }
  }

  const archiveWorkspaceThreads = () => {
    updateThreadList((thread) =>
      thread.workspaceSlug === activeWorkspace.value && thread.status === 'active'
        ? {
            ...thread,
            status: 'archived',
            updatedAt: 'Archived now',
          }
        : thread,
    )
  }

  const deleteWorkspaceThreads = () => {
    updateThreadList((thread) =>
      thread.workspaceSlug === activeWorkspace.value && thread.status === 'active'
        ? {
            ...thread,
            status: 'deleted',
            updatedAt: 'Moved to bin',
          }
        : thread,
    )
  }

  const clearDeletedThreads = (threadIds?: string[]) => {
    const targetIds = threadIds?.length
      ? new Set(threadIds)
      : new Set(deletedThreads.value.map((thread) => thread.threadId))

    if (targetIds.size === 0) return

    threads.value = threads.value.filter(
      (thread) => thread.status !== 'deleted' || !targetIds.has(thread.threadId),
    )
    syncSelections()
  }

  const toggleWorkspaceMenu = () => {
    workspaceMenuOpen.value = !workspaceMenuOpen.value
  }

  const toggleBrainSources = () => {
    brainSourcesOpen.value = !brainSourcesOpen.value
  }

  const applyTheme = (nextTheme: ThemeMode, nextPreset: ThemePreset = themePreset.value) => {
    const root = document.documentElement
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const resolvedTheme = nextTheme === 'system' ? (prefersDark ? 'dark' : 'light') : nextTheme
    root.dataset.theme = resolvedTheme
    root.dataset.themePreset = nextPreset
    root.style.colorScheme = resolvedTheme
  }

  const systemThemeMedia = window.matchMedia('(prefers-color-scheme: dark)')

  const syncSystemTheme = () => {
    if (theme.value === 'system') {
      applyTheme(theme.value, themePreset.value)
    }
  }

  if (typeof systemThemeMedia.addEventListener === 'function') {
    systemThemeMedia.addEventListener('change', syncSystemTheme)
  } else {
    systemThemeMedia.addListener(syncSystemTheme)
  }

  watch(theme, (nextTheme) => {
    localStorage.setItem(THEME_KEY, nextTheme)
    applyTheme(nextTheme, themePreset.value)
  }, { immediate: true })

  watch(themePreset, (nextPreset) => {
    localStorage.setItem(THEME_PRESET_KEY, nextPreset)
    applyTheme(theme.value, nextPreset)
  }, { immediate: true })

  watch(activeWorkspace, (workspace) => {
    localStorage.setItem(WORKSPACE_KEY, workspace)
  }, { immediate: true })

  watch(activeThreadId, (threadId) => {
    localStorage.setItem(THREAD_KEY, threadId)
  }, { immediate: true })

  watch(sidebarCollapsed, (collapsed) => {
    localStorage.setItem(SIDEBAR_KEY, String(collapsed))
  }, { immediate: true })

  watch(activeSpaceId, (spaceId) => {
    localStorage.setItem(SPACE_KEY, spaceId)
  }, { immediate: true })

  watch(threads, (nextThreads) => {
    localStorage.setItem(THREADS_KEY, JSON.stringify(nextThreads))
  }, { immediate: true, deep: true })

  watch(spaces, (nextSpaces) => {
    localStorage.setItem(SPACES_KEY, JSON.stringify(nextSpaces))
  }, { immediate: true, deep: true })

  syncSelections()

  return {
    theme,
    themePreset,
    activeWorkspace,
    workspaceMenuOpen,
    sidebarCollapsed,
    brainSourcesOpen,
    spaces,
    threads,
    activeSpaceId,
    activeThreadId,
    availableSpaces,
    activeSpace,
    availableThreads,
    workspaceRootThreads,
    workspaceActiveThreads,
    archivedThreads,
    deletedThreads,
    activeThread,
    activeThreadCandidates,
    rootSpaceId,
    setTheme,
    setThemePreset,
    setWorkspace,
    setActiveSpace,
    setActiveThread,
    createSpace,
    createThread,
    createRootThread,
    renameSpace,
    archiveSpace,
    deleteSpace,
    renameThread,
    archiveThread,
    deleteThread,
    restoreThread,
    restoreThreads,
    archiveWorkspaceThreads,
    deleteWorkspaceThreads,
    clearDeletedThreads,
    toggleWorkspaceMenu,
    toggleSidebarCollapsed,
    closeWorkspaceMenu,
    closeSurfaceMenus,
    toggleBrainSources,
    applyTheme,
  }
})
