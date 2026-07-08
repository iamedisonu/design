<template>
  <div class="page-grid">
    <PageSection
      eyebrow="Programme workspace"
      title="Overview"
      description="Workspace snapshot for Isomo: warnings, updates, and the metrics needed at a glance."
    >
      <div class="hero-panel">
        <div class="hero-copy">
          <p class="section-description">
            Use this page as the quick landing view when you open the programme workspace.
          </p>
          <div class="placeholder-lines">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <div class="hero-warning">
          <p class="card-label">Warnings</p>
          <div class="placeholder-lines">
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <div class="content-group">
        <div class="content-group-header">
          <p class="card-label">Metrics</p>
          <span class="inline-badge">Workspace summary</span>
        </div>

        <div class="metric-grid">
          <div v-for="metric in metrics" :key="metric.label" class="metric-card">
            <p class="card-label">{{ metric.label }}</p>
            <strong>{{ metric.value }}</strong>
            <div class="placeholder-lines compact">
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <div class="content-group">
        <p class="card-label">Status and updates</p>
        <div class="two-column-grid">
          <div class="detail-panel">
            <p class="card-label">Updates</p>
            <div class="placeholder-lines">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div class="detail-panel">
            <p class="card-label">Freshness</p>
            <div class="placeholder-lines">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </PageSection>
  </div>
</template>

<script setup lang="ts">
import PageSection from '../components/PageSection.vue'

const metrics = [
  { label: 'Records', value: '1,240' },
  { label: 'Submissions', value: '386' },
  { label: 'Issues', value: '14' },
  { label: 'Sync windows', value: '12' },
]
</script>
