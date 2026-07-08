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

export type BrainMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  loading?: boolean
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
  messages: BrainMessage[]
}

export const workspaces: Workspace[] = [
  { slug: 'circles', label: 'Isomo', enabled: true, statusLabel: 'Available now' },
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
const ROOT_SPACE_SUFFIX = 'root-space'

const defaultSpaces: BrainSpace[] = [
  {
    spaceId: 'circles-space-1',
    workspaceSlug: 'circles',
    title: 'Project Alpha',
    updatedAt: 'Updated now',
    status: 'active',
  },
]

const emptyMessage = (role: BrainMessage['role'], text: string, loading = false): BrainMessage => ({
  id: `msg-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  role,
  text,
  loading,
})

const defaultThreads: BrainThread[] = [
  {
    threadId: 'circles-root-thread-1',
    spaceId: 'circles-root-space',
    workspaceSlug: 'circles',
    title: 'General',
    updatedAt: 'Updated now',
    status: 'active',
    messages: [],
  },
  {
    threadId: 'circles-thread-1',
    spaceId: 'circles-space-1',
    workspaceSlug: 'circles',
    title: 'Conversation 1',
    updatedAt: 'Updated now',
    status: 'active',
    messages: [],
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

const getStoredSpace = (): string => localStorage.getItem(SPACE_KEY) ?? 'circles-root-space'

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
      threadId: thread.threadId ?? `circles-restored-thread-${index}`,
      spaceId: thread.spaceId ?? 'circles-root-space',
      workspaceSlug: (thread.workspaceSlug as WorkspaceSlug | undefined) ?? 'circles',
      title: thread.title ?? `Conversation ${index + 1}`,
      updatedAt: thread.updatedAt ?? 'Updated now',
      status: thread.status ?? 'active',
      messages:
        Array.isArray(thread.messages) && thread.messages.length > 0
          ? thread.messages.map((message, msgIndex) => ({
              id: message.id ?? `msg-${index}-${msgIndex}`,
              role: message.role === 'assistant' ? 'assistant' : 'user',
              text: typeof message.text === 'string' ? message.text : '',
              loading: Boolean(message.loading),
            }))
          : [],
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
      spaceId: space.spaceId ?? `circles-restored-space-${index}`,
      workspaceSlug: (space.workspaceSlug as WorkspaceSlug | undefined) ?? 'circles',
      title: space.title ?? `Space ${index + 1}`,
      updatedAt: space.updatedAt ?? 'Updated now',
      status: space.status ?? 'active',
    }))
  } catch {
    return defaultSpaces
  }
}

const touchTimestamp = () => 'Updated now'

export const useAppStore = defineStore('app', () => {
  const theme = ref<ThemeMode>(getStoredTheme())
  const themePreset = ref<ThemePreset>(getStoredThemePreset())
  const activeWorkspace = ref<WorkspaceSlug>(getStoredWorkspace())
  const workspaceMenuOpen = ref(false)
  const sidebarCollapsed = ref(getStoredSidebarCollapsed())
  const brainSourcesOpen = ref(true)

  const spaces = ref<BrainSpace[]>(getStoredSpaces())
  const threads = ref<BrainThread[]>(getStoredThreads())
  const activeSpaceId = ref<string>(getStoredSpace())
  const activeThreadId = ref(getStoredThread())

  const rootSpaceId = computed(() => `${activeWorkspace.value}-${ROOT_SPACE_SUFFIX}`)

  const rootSpace = computed<BrainSpace>(() => ({
    spaceId: rootSpaceId.value,
    workspaceSlug: activeWorkspace.value,
    title: 'General',
    updatedAt: touchTimestamp(),
    status: 'active',
  }))

  const availableSpaces = computed(() =>
    spaces.value.filter((space) => space.workspaceSlug === activeWorkspace.value && space.status === 'active'),
  )

  const spacesWithRoot = computed(() => [rootSpace.value, ...availableSpaces.value])

  const activeSpace = computed(() => {
    const active = spacesWithRoot.value.find((space) => space.spaceId === activeSpaceId.value)
    return active ?? rootSpace.value
  })

  const workspaceThreads = computed(() =>
    threads.value.filter(
      (thread) =>
        thread.workspaceSlug === activeWorkspace.value &&
        thread.status !== 'deleted' &&
        thread.status !== 'archived',
    ),
  )

  const workspaceActiveThreads = computed(() =>
    threads.value.filter((thread) => thread.workspaceSlug === activeWorkspace.value && thread.status === 'active'),
  )

  const workspaceRootThreads = computed(() =>
    workspaceThreads.value.filter((thread) => thread.spaceId === rootSpaceId.value),
  )

  const threadsByActiveSpace = computed(() =>
    workspaceThreads.value.filter((thread) => thread.spaceId === activeSpace.value.spaceId && thread.status === 'active'),
  )

  const archivedThreads = computed(() => threads.value.filter((thread) => thread.status === 'archived'))

  const deletedThreads = computed(() => threads.value.filter((thread) => thread.status === 'deleted'))

  const activeThread = computed(() => {
    const direct = workspaceThreads.value.find((thread) => thread.threadId === activeThreadId.value)
    if (direct) return direct

    return threadsByActiveSpace.value[0] ?? workspaceRootThreads.value[0] ?? workspaceThreads.value[0]
  })

  const syncSelections = () => {
    const currentSpaceExists = spacesWithRoot.value.some((space) => space.spaceId === activeSpaceId.value)
    if (!currentSpaceExists) {
      activeSpaceId.value = rootSpace.value.spaceId
    }

    const currentThreadExists = workspaceThreads.value.some((thread) => thread.threadId === activeThreadId.value)
    if (!currentThreadExists) {
      activeThreadId.value =
        threadsByActiveSpace.value[0]?.threadId ?? workspaceRootThreads.value[0]?.threadId ?? workspaceThreads.value[0]?.threadId ?? ''
    }
  }

  const nextSpaceTitle = () => {
    const count = availableSpaces.value.length + 1
    return `Space ${count}`
  }

  const nextThreadTitle = (spaceId: string) => {
    const count = workspaceThreads.value.filter((thread) => thread.spaceId === spaceId).length + 1
    return `Conversation ${count}`
  }

  const closeWorkspaceMenu = () => {
    workspaceMenuOpen.value = false
  }

  const closeSurfaceMenus = () => {
    closeWorkspaceMenu()
  }

  const setTheme = (nextTheme: ThemeMode) => {
    theme.value = nextTheme
  }

  const setThemePreset = (nextPreset: ThemePreset) => {
    themePreset.value = nextPreset
  }

  const applyTheme = (nextTheme: ThemeMode, nextPreset: ThemePreset = themePreset.value) => {
    const root = document.documentElement
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const resolvedTheme = nextTheme === 'system' ? (prefersDark ? 'dark' : 'light') : nextTheme
    root.dataset.theme = resolvedTheme
    root.dataset.themePreset = nextPreset
    root.style.colorScheme = resolvedTheme
  }

  const setWorkspace = (workspaceSlug: WorkspaceSlug) => {
    const target = workspaces.find((workspace) => workspace.slug === workspaceSlug)
    if (!target?.enabled) return
    activeWorkspace.value = workspaceSlug
    syncSelections()
    closeSurfaceMenus()
  }

  const setActiveSpace = (spaceId: string) => {
    const foundSpace = spacesWithRoot.value.find((candidate) => candidate.spaceId === spaceId)
    if (!foundSpace) return
    activeSpaceId.value = spaceId
    if (foundSpace.spaceId === rootSpaceId.value) {
      activeThreadId.value = workspaceRootThreads.value[0]?.threadId ?? threadsByActiveSpace.value[0]?.threadId ?? ''
    } else {
      activeThreadId.value =
        threadsByActiveSpace.value[0]?.threadId ??
        workspaceThreads.value.find((thread) => thread.spaceId === foundSpace.spaceId)?.threadId ??
        ''
    }
  }

  const setActiveThread = (threadId: string) => {
    const thread = workspaceThreads.value.find((candidate) => candidate.threadId === threadId)
    if (!thread) return
    activeSpaceId.value = thread.spaceId
    activeThreadId.value = threadId
  }

  const createSpace = () => {
    const spaceId = `${activeWorkspace.value}-space-${Date.now()}`
    const nextSpace: BrainSpace = {
      spaceId,
      workspaceSlug: activeWorkspace.value,
      title: nextSpaceTitle(),
      updatedAt: touchTimestamp(),
      status: 'active',
    }
    spaces.value = [nextSpace, ...spaces.value]
    activeSpaceId.value = spaceId

    const nextThread: BrainThread = {
      threadId: `${activeWorkspace.value}-thread-${Date.now()}`,
      spaceId,
      workspaceSlug: activeWorkspace.value,
      title: 'Conversation 1',
      updatedAt: touchTimestamp(),
      status: 'active',
      messages: [],
    }
    threads.value = [nextThread, ...threads.value]
    activeThreadId.value = nextThread.threadId
  }

  const createThread = (spaceId?: string) => {
    const targetSpace = spacesWithRoot.value.find((space) => space.spaceId === spaceId) ?? activeSpace.value
    const targetSpaceId = targetSpace.spaceId

    const nextThread: BrainThread = {
      threadId: `${activeWorkspace.value}-thread-${Date.now()}`,
      spaceId: targetSpaceId,
      workspaceSlug: activeWorkspace.value,
      title: nextThreadTitle(targetSpaceId),
      updatedAt: touchTimestamp(),
      status: 'active',
      messages: [],
    }

    threads.value = [nextThread, ...threads.value]
    activeSpaceId.value = targetSpaceId
    activeThreadId.value = nextThread.threadId
  }

  const createRootThread = () => {
    createThread(rootSpaceId.value)
  }

  const createThreadInActiveSpace = () => {
    createThread(activeSpace.value.spaceId)
  }

  const renameSpace = (spaceId: string, title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return
    spaces.value = spaces.value.map((space) =>
      space.spaceId === spaceId
        ? {
            ...space,
            title: trimmed,
            updatedAt: touchTimestamp(),
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
            updatedAt: touchTimestamp(),
          }
        : space,
    )

    threads.value = threads.value.map((thread) =>
      thread.spaceId === spaceId && thread.status === 'active'
        ? {
            ...thread,
            status: 'archived',
            updatedAt: touchTimestamp(),
          }
        : thread,
    )

    syncSelections()
  }

  const deleteSpace = (spaceId: string) => {
    spaces.value = spaces.value.map((space) =>
      space.spaceId === spaceId
        ? {
            ...space,
            status: 'deleted',
            updatedAt: 'Moved to bin',
          }
        : space,
    )

    threads.value = threads.value.map((thread) =>
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
    threads.value = threads.value.map((thread) =>
      thread.threadId === threadId
        ? {
            ...thread,
            title: trimmed,
            updatedAt: touchTimestamp(),
          }
        : thread,
    )
  }

  const archiveThread = (threadId: string) => {
    threads.value = threads.value.map((thread) =>
      thread.threadId === threadId
        ? {
            ...thread,
            status: 'archived',
            updatedAt: touchTimestamp(),
          }
        : thread,
    )

    syncSelections()
  }

  const deleteThread = (threadId: string) => {
    threads.value = threads.value.map((thread) =>
      thread.threadId === threadId
        ? {
            ...thread,
            status: 'deleted',
            updatedAt: 'Moved to bin',
          }
        : thread,
    )

    syncSelections()
  }

  const restoreThread = (threadId: string) => {
    threads.value = threads.value.map((thread) =>
      thread.threadId === threadId
        ? {
            ...thread,
            status: 'active',
            updatedAt: touchTimestamp(),
          }
        : thread,
    )

    const restored = threads.value.find((thread) => thread.threadId === threadId)
    if (!restored) return
    if (restored.spaceId !== rootSpaceId.value) {
      spaces.value = spaces.value.map((space) =>
        space.spaceId === restored.spaceId && space.status !== 'active'
          ? {
              ...space,
              status: 'active',
              updatedAt: touchTimestamp(),
            }
          : space,
      )
      activeSpaceId.value = restored.spaceId
    }
    activeThreadId.value = restored.threadId
  }

  const restoreThreads = (threadIds: string[]) => {
    if (threadIds.length === 0) return
    const set = new Set(threadIds)
    const restoredSpaceIds = new Set(
      threads.value.filter((thread) => set.has(thread.threadId)).map((thread) => thread.spaceId),
    )
    threads.value = threads.value.map((thread) =>
      set.has(thread.threadId)
        ? {
            ...thread,
            status: 'active',
            updatedAt: touchTimestamp(),
          }
        : thread,
    )
    spaces.value = spaces.value.map((space) =>
      restoredSpaceIds.has(space.spaceId) && space.status !== 'active'
        ? {
            ...space,
            status: 'active',
            updatedAt: touchTimestamp(),
          }
        : space,
    )

    const restoredThread = threads.value.find((thread) => set.has(thread.threadId) && thread.workspaceSlug === activeWorkspace.value)
    if (restoredThread) {
      if (restoredThread.spaceId !== rootSpaceId.value) {
        activeSpaceId.value = restoredThread.spaceId
      }
      activeThreadId.value = restoredThread.threadId
    }
  }

  const clearDeletedThreads = (threadIds?: string[]) => {
    const targetIds = threadIds?.length ? new Set(threadIds) : new Set(deletedThreads.value.map((thread) => thread.threadId))
    if (targetIds.size === 0) return

    threads.value = threads.value.filter((thread) => thread.status !== 'deleted' || !targetIds.has(thread.threadId))
    syncSelections()
  }

  const archiveWorkspaceThreads = () => {
    threads.value = threads.value.map((thread) =>
      thread.workspaceSlug === activeWorkspace.value && thread.status === 'active'
        ? {
            ...thread,
            status: 'archived',
            updatedAt: touchTimestamp(),
          }
        : thread,
    )
  }

  const deleteWorkspaceThreads = () => {
    threads.value = threads.value.map((thread) =>
      thread.workspaceSlug === activeWorkspace.value && thread.status === 'active'
        ? {
            ...thread,
            status: 'deleted',
            updatedAt: 'Moved to bin',
          }
        : thread,
    )
    syncSelections()
  }

  const addMessageToThread = (threadId: string, role: BrainMessage['role'], text: string, loading = false) => {
    const message = emptyMessage(role, text, loading)
    threads.value = threads.value.map((thread) =>
      thread.threadId === threadId
        ? {
            ...thread,
            updatedAt: touchTimestamp(),
            messages: [...thread.messages, message],
          }
        : thread,
    )
    if (threadId === activeThreadId.value && threadId !== '') {
      activeThreadId.value = threadId
    }
    return message.id
  }

  const updateMessage = (threadId: string, messageId: string, text: string, loading = false) => {
    threads.value = threads.value.map((thread) =>
      thread.threadId === threadId
        ? {
            ...thread,
            messages: thread.messages.map((message) =>
              message.id === messageId ? { ...message, text, loading } : message,
            ),
          }
        : thread,
    )
  }

  const toggleSidebarCollapsed = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
    closeSurfaceMenus()
  }

  const toggleWorkspaceMenu = () => {
    workspaceMenuOpen.value = !workspaceMenuOpen.value
  }

  const toggleBrainSources = () => {
    brainSourcesOpen.value = !brainSourcesOpen.value
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

  watch(activeWorkspace, () => {
    localStorage.setItem(WORKSPACE_KEY, activeWorkspace.value)
    syncSelections()
  }, { immediate: true })

  watch(activeThreadId, (threadId) => {
    localStorage.setItem(THREAD_KEY, threadId)
  }, { immediate: true })

  watch(activeSpaceId, (spaceId) => {
    localStorage.setItem(SPACE_KEY, spaceId)
  }, { immediate: true })

  watch(sidebarCollapsed, (collapsed) => {
    localStorage.setItem(SIDEBAR_KEY, String(collapsed))
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
    rootSpaceId,
    rootSpace,
    availableSpaces,
    spacesWithRoot,
    activeSpace,
    threadsByActiveSpace,
    workspaceThreads,
    workspaceRootThreads,
    workspaceActiveThreads,
    archivedThreads,
    deletedThreads,
    activeThread,
    setTheme,
    setThemePreset,
    setWorkspace,
    setActiveSpace,
    setActiveThread,
    createSpace,
    createThread,
    createThreadInActiveSpace,
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
    addMessageToThread,
    updateMessage,
    toggleWorkspaceMenu,
    toggleSidebarCollapsed,
    closeWorkspaceMenu,
    closeSurfaceMenus,
    toggleBrainSources,
    applyTheme,
  }
})
