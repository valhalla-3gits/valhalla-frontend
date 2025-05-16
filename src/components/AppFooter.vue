<template>
  <footer class="app-footer">
    <div class="footer-container">
      <span class="footer__copyright">
        <!-- You might want to make the year dynamic later -->
        {{ currentYear }} Valhalla. Created by lis.
      </span>
      <!-- Replace with your actual GitHub repo URL -->
      <a
        href="https://github.com/your-repo"
      target="_blank"
      rel="noopener noreferrer"
      class="footer__github-link"
      >
      <!-- Add your icon class here if using an icon font -->
      <span class="icon-github" aria-hidden="true"></span>
      Github
      </a>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AppFooter',

  // No props needed for this static version

  data() {
    return {
      // Make the year dynamic
      currentYear: new Date().getFullYear()
    }
  }

  // No methods needed for this version
})
</script>

<style scoped>
.app-footer {
  /* Use global variables for styling */
  background-color: var(--color-background-dark); /* Match body background */
  color: var(--color-text-primary);
  font-family: var(--font-family-monospace);
  padding: 0.8rem 1.5rem; /* Adjust padding as needed */
  border-top: 1px solid var(--color-border-primary); /* Thin green line */
  font-size: 0.85rem; /* Slightly smaller font size for footer */
}

.footer-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px; /* Optional: constrain width, match header */
  margin: 0 auto; /* Optional: center container */
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
  gap: 0.5rem; /* Add some gap for wrapping */
}

.footer__copyright {
  /* Specific styling if needed */
  opacity: 0.9; /* Slightly less prominent */
}

.footer__github-link {
  /* Inherits link color from global styles (a tag) */
  display: inline-flex; /* Align icon and text */
  align-items: center;
  gap: 0.4em; /* Space between icon and text */
  color: var(--color-text-primary); /* Explicitly set or rely on global 'a' style */
  transition: opacity 0.2s ease-in-out;
}

.footer__github-link:hover,
.footer__github-link:focus {
  opacity: 0.8;
  text-decoration: underline; /* Ensure underline on hover */
}

/* Placeholder for icon styling */
/* Replace .icon-github with your actual icon class */
.icon-github::before {
  /* Example using content property if using pseudo-elements */
  /* content: '\f09b'; */ /* Example Font Awesome unicode */
  /* font-family: "Font Awesome 5 Brands"; */
  /* display: inline-block; */

  /* --- OR if using background image --- */
  /* content: ''; */
  /* display: inline-block; */
  /* width: 1em; */
  /* height: 1em; */
  /* background-image: url('/path/to/github-icon.svg'); */
  /* background-size: contain; */
  /* background-repeat: no-repeat; */
  /* vertical-align: middle; */

  /* --- OR if using a class from an icon library --- */
  /* The library's CSS will handle the display. */
  /* You might adjust vertical-align if needed */
  vertical-align: middle; /* Adjust as needed */
}

/* Example: If using Font Awesome, you'd add classes like 'fab fa-github'
   to the <span class="icon-github"> element directly in the template */
/* <span class="icon-github fab fa-github" aria-hidden="true"></span> */

</style>
