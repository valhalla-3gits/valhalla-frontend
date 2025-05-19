<template>
  <div class="landing-view">
    <!-- Background Component -->
    <MatrixBackground />

    <!-- Main Content Area -->
    <div class="about-content">
      <!-- Hero/Invitation Section -->
      <section class="about-section">
        <ContentBox title="About" title-font-size="2rem">
          <p class="about-text">
            Valhalla Code is a dynamic, open-source platform designed to empower developers of all
            levels to sharpen their coding prowess through engaging challenges and hands-on
            practice. At its core, Valhalla provides a space to tackle diverse programming problems,
            experiment with different languages, and even create and share your own unique training
            tasks. We passionately believe in the power of community and open collaboration, which
            is why the entire project is freely available on GitHub. We wholeheartedly encourage you
            to fork the repository, dive into the codebase, and adapt Valhalla to your specific
            learning objectives, team training needs, or educational purposes – modify it, deploy
            it, and make it your own, fostering a cycle of continuous learning and shared
            improvement.
          </p>
          <BaseButton
            text="GitHub"
            styleType="filled"
            icon="nf-dev-github"
            @click="navigateToGitHub"
            class="github-button"
          />
        </ContentBox>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseButton from '../components/BaseButton.vue' // Adjust path if needed
import MatrixBackground from '../components/MatrixBackground.vue'
import ContentBox from '@/components/ContentBox.vue' // Adjust path if needed

export default defineComponent({
  name: 'LandingView',

  components: {
    ContentBox,
    BaseButton,
    MatrixBackground,
  },

  methods: {
    /**
     * Handles navigation when the Start button is clicked.
     * Replace '/challenges' with your desired target route.
     */
    navigateToGitHub() {
      // Replace with your actual GitHub repository URL
      window.open('https://github.com/valhalla-3gits', '_blank', 'noopener,noreferrer')
    },
  },
})
</script>

<style scoped>
.landing-view {
  position: relative; /* Needed for absolute positioning of background */
  width: 100%;
  min-height: 100%; /* Ensure it takes at least the viewport height */
  overflow: hidden; /* Prevent potential overflow from background */
  /* If used in App.vue with flex-grow, this might not need height */
  display: flex; /* Use flex to help center content */
  justify-content: center; /* Center content horizontally */
  align-items: center; /* Center content vertically */
  padding: var(--padding-standard); /* Use global padding */
  box-sizing: border-box;
}

.about-content {
  position: relative; /* Ensure content is above the background */
  z-index: 1; /* Sit on top of MatrixBackground (z-index: -1) */
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  max-width: 50%; /* Max width for readability */
  padding: 2rem 1rem; /* Padding inside the content area */
  color: var(--color-text-primary); /* Use global text color */
  font-family: var(--font-family-monospace);
  margin: 25vh 0;
}

.about-section {
  margin-bottom: 4rem; /* Space below hero */
}

.about-title {
  font-size: 5rem; /* Adjust size as needed */
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #fff; /* Brighter white for main title */
  line-height: 1.1;
}

.about-text {
  font-size: 1rem; /* Adjust size */
  margin-bottom: 2rem;
  opacity: 0.9;
}

.about-button {
  /* BaseButton styles are applied, add specific margin if needed */
  padding: 0.8em 1.8em; /* Slightly larger padding */
}

.github-button {
  /* Add specific styling if needed, e.g., margin */
  margin-top: 0.5rem;
}

/* Responsive Adjustments (Example) */
@media (max-width: 768px) {
  .create-task-section,
  .open-source-section {
    margin-top: 3rem;
    margin-bottom: 3rem;
  }

  .create-task-content-wrapper {
    flex-direction: column; /* Stack text and image on smaller screens */
    text-align: center;
  }

  .create-task-text {
    text-align: center;
    margin-bottom: 1rem;
  }

  .screenshot-placeholder-small {
    width: 60%; /* Adjust width for stacked layout */
    margin-left: auto;
    margin-right: auto;
  }
}

/* Responsive Adjustments (Example) */
@media (max-width: 768px) {
  .solve-problems-section {
    margin-top: 3rem;
    margin-bottom: 3rem;
  }

  .section-description {
    font-size: 0.9rem;
  }
}

/* Responsive Adjustments (Example) */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .languages-intro {
    font-size: 1rem;
  }

  .landing-content {
    padding: 1rem 0.5rem;
  }
}
</style>
