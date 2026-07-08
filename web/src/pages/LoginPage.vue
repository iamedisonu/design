<template>
  <div class="auth-page">
    <div class="auth-panel">
      <p class="eyebrow">Leadership access</p>
      <h1>Login</h1>
      <p class="auth-copy">
        Google SSO-first sign-in shell for leadership, field staff, and admin access states.
      </p>

      <button class="primary-button large" type="button">Continue with Google</button>

      <div class="auth-states">
        <div class="status-card">
          <strong>Loading role</strong>
          <div class="placeholder-lines">
            <span></span>
            <span></span>
          </div>
        </div>
        <div class="status-card">
          <strong>Access policy</strong>
          <div class="placeholder-lines">
            <span></span>
            <span></span>
          </div>
        </div>
        <div class="status-card warning">
          <strong>Access denied</strong>
          <div class="placeholder-lines">
            <span></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
