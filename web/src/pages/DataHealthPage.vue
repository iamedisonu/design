<template>
  <div class="page-grid">
    <PageSection
      eyebrow="Data operations"
      title="Data Health"
      description="One page for sync status, uploads, mismatches, validation, and freshness."
    >
      <div class="segment-list">
        <span>Sync</span>
        <span>Uploads</span>
        <span>Mismatches</span>
        <span>Validation</span>
        <span>Freshness</span>
      </div>

      <div class="metric-grid compact">
        <SkeletonCard v-for="index in 4" :key="index" variant="compact" />
      </div>

      <div class="two-column-grid">
        <div class="detail-panel">
          <p class="card-label">Uploads</p>
          <div class="upload-shell">
            <div class="upload-dropzone"></div>
            <div class="placeholder-lines">
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
        <div class="detail-panel">
          <p class="card-label">Sync and freshness</p>
          <div class="placeholder-lines">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <div class="two-column-grid">
        <div class="detail-panel tall">
          <p class="card-label">Mismatches</p>
          <div class="table-row header">
            <span></span><span></span><span></span>
          </div>
          <div v-for="index in 4" :key="index" class="table-row">
            <span></span><span></span><span></span>
          </div>
        </div>
        <div class="detail-panel tall">
          <p class="card-label">Validation</p>
          <div class="validation-list">
            <div v-for="index in 4" :key="index" class="validation-item">
              <div class="status-pill"></div>
              <div class="placeholder-lines">
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageSection>
  </div>
</template>

<script setup lang="ts">
import PageSection from '../components/PageSection.vue'
import SkeletonCard from '../components/SkeletonCard.vue'
</script>
