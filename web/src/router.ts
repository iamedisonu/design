import { createRouter, createWebHistory } from 'vue-router'
import AppShell from './components/AppShell.vue'
import BrainPage from './pages/BrainPage.vue'
import DataHealthPage from './pages/DataHealthPage.vue'
import LoginPage from './pages/LoginPage.vue'
import OverviewPage from './pages/OverviewPage.vue'
import SettingsPage from './pages/SettingsPage.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },
    {
      path: '/',
      component: AppShell,
      children: [
        {
          path: '',
          redirect: '/programmes/circles/overview',
        },
        {
          path: 'settings',
          name: 'settings',
          component: SettingsPage,
          meta: {
            pageTitle: 'Settings',
            pageEyebrow: 'Account and appearance',
          },
        },
        {
          path: 'isomo-brain',
          redirect: '/spaces',
        },
        {
          path: 'spaces',
          name: 'spaces',
          component: BrainPage,
          meta: {
            pageTitle: 'Spaces',
            pageEyebrow: 'AI workspace',
          },
        },
        {
          path: 'programmes/:workspaceSlug/overview',
          name: 'overview',
          component: OverviewPage,
          meta: {
            pageTitle: 'Overview',
            pageEyebrow: 'Programme workspace',
          },
        },
        {
          path: 'programmes/:workspaceSlug/data-health',
          name: 'data-health',
          component: DataHealthPage,
          meta: {
            pageTitle: 'Data Health',
            pageEyebrow: 'Programme workspace',
          },
        },
      ],
    },
  ],
})
