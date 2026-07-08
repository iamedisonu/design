<template>
  <div class="page-grid">
    <PageSection
      eyebrow="Programme snapshot"
      title="Overview"
      description="At-a-glance programme status, active warnings, updates, and the key metrics people need fast."
    >
      <div class="hero-panel">
        <div class="hero-copy">
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
          <span class="inline-badge">Overview blocks</span>
        </div>

        <div class="metric-grid">
          <div v-for="metric in metrics" :key="metric" class="metric-card">
            <p class="card-label">{{ metric }}</p>
            <div class="placeholder-lines compact">
              <span></span>
              <span></span>
            </div>
            <div class="skeleton-block"></div>
          </div>
        </div>
      </div>

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
          <p class="card-label">Freshness and source context</p>
          <div class="placeholder-lines">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </PageSection>
  </div>
</template>

<script setup lang="ts">
import PageSection from '../components/PageSection.vue'

const metrics = ['Records', 'Submissions', 'Issues', 'Freshness']
</script>
