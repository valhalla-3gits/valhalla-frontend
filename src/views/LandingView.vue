<template>
  <div class="landing-view">
    <!-- Background Component -->
    <MatrixBackground />

    <!-- Main Content Area -->
    <div class="landing-content">
      <!-- Hero/Invitation Section -->
      <section class="hero-section">
        <ContentBox>
          <h1 class="hero-title">Master your skill</h1>
          <p class="hero-subtitle">
            Join Valhalla Code: <br />
            Solve Challenges, Rise as a Hero
          </p>
          <BaseButton
            text="Start"
            styleType="filled"
            fontSize="1.2rem"
            class="hero-button"
            @click="navigateToStart"
          />
        </ContentBox>
      </section>

      <!-- Languages Section -->
      <section class="languages-section">
        <p class="languages-intro">
          You are free to choose from a selection of the most popular programming languages
        </p>
        <div class="language-grid-container">
          <img src="../assets/languages.svg" />
        </div>
      </section>

      <!-- Solve Problems Section -->
      <section class="solve-problems-section">
        <ContentBox title="Solve Problems" title-font-size="2rem">
          <div class="screenshot-placeholder">
            <!--
              ###################################
              # Screenshot Image Goes Here      #
              # Replace this comment block with #
              # your actual <img> element or   #
              # a component that displays it.   #
              ###################################
            -->
            <!-- Example Placeholder Structure (Remove when adding image) -->
            <div
              style="
                width: 100%;
                aspect-ratio: 16 / 9; /* Maintain a 16:9 aspect ratio */
                background-color: var(--color-placeholder-bg, #333);
                border: 1px dashed var(--color-placeholder-border, #555);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
                color: var(--color-text-primary);
                opacity: 0.7;
              "
            >
              (App Screenshot: Solve Problems View)
            </div>
          </div>
        </ContentBox>
      </section>

      <section class="create-task-section">
        <ContentBox title="Create your own task" title-font-size="2rem">
          <div class="create-task-content-wrapper">
            <div class="screenshot-placeholder-small">
              <!--
                ###################################
                # Small Screenshot/Diagram Here   #
                # Replace this comment block with #
                # your actual <img> or <svg>.     #
                ###################################
              -->
              <div
                style="
                  width: 100%;
                  aspect-ratio: 4 / 3; /* Different aspect ratio example */
                  background-color: var(--color-placeholder-bg, #333);
                  border: 1px dashed var(--color-placeholder-border, #555);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 1rem;
                  color: var(--color-text-primary);
                  opacity: 0.7;
                  margin-left: auto; /* Align to the right if container allows */
                  margin-right: auto; /* Center if container allows */
                "
              >
                (Diagram/UI Snippet)
              </div>
            </div>
          </div>
        </ContentBox>
      </section>
      <!-- End of Create Training Task Section -->

      <!-- Open Source Section -->
      <section class="open-source-section">
        <ContentBox title="Completely Open Source" title-font-size="2rem">
          <p>
            This project is completely open-source and free to use. Feel free to grab it, deploy,
            and modify for your own needs. The only requirement is to keep it open-source and free.
          </p>
          <!-- Example: Font Awesome icon class -->
          <BaseButton
            text="GitHub"
            styleType="filled"
            icon="nf-dev-github"
            @click="navigateToGitHub"
            class="github-button"
          />
        </ContentBox>
      </section>
      <!-- Add other landing page sections here if needed -->
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
    navigateToStart() {
      this.$router.push('/signup')
    },
    navigateToGitHub() {
      // Replace with your actual GitHub repository URL
      window.open('https://github.com/your-repo/valhalla-code', '_blank', 'noopener,noreferrer')
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

.landing-content {
  position: relative; /* Ensure content is above the background */
  z-index: 1; /* Sit on top of MatrixBackground (z-index: -1) */
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  max-width: 90%; /* Max width for readability */
  padding: 2rem 1rem; /* Padding inside the content area */
  color: var(--color-text-primary); /* Use global text color */
  font-family: var(--font-family-monospace);
}

/* Hero Section Styling */
.hero-section {
  margin-bottom: 4rem; /* Space below hero */
}

.hero-title {
  font-size: 5rem; /* Adjust size as needed */
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #fff; /* Brighter white for main title */
  line-height: 1.1;
}

.hero-subtitle {
  font-size: 2rem; /* Adjust size */
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-button {
  /* BaseButton styles are applied, add specific margin if needed */
  padding: 0.8em 1.8em; /* Slightly larger padding */
}

/* Languages Section Styling */
.languages-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.languages-intro {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  max-width: 50%;
}

/* Add styles for your actual SVG elements here if needed */
/* Example: */
.language-grid-container img {
  max-width: 80%;
  height: auto;
}

.solve-problems-section {
  width: 50%;
  margin-top: 4rem; /* Space above this section */
  margin-bottom: 4rem; /* Space below this section */
}

/* Make ContentBox in this section potentially take more width */
.solve-problems-section .content-box {
  width: 100%;
}

.screenshot-placeholder {
  width: 100%;
  margin-bottom: var(--padding-standard, 1rem); /* Space below screenshot */
  /* If using an <img> tag, you might want to style it directly: */
  /* img {
      width: 100%;
      height: auto;
      display: block;
      border-radius: var(--border-radius-small, 4px); // Optional
      border: 1px solid var(--color-placeholder-border, #555); // Optional
   } */
}

.section-description {
  font-size: 2rem;
  line-height: 1.6;
  color: var(--color-text-primary);
  opacity: 0.9;
  text-align: left; /* Or center, depending on preference */
  padding: 0 0.5rem; /* Slight horizontal padding for the text */
}

.create-task-section {
  width: 50%;
  margin-top: 4rem;
  margin-bottom: 4rem;
}

.create-task-section .content-box {
  width: 100%;
}

.create-task-content-wrapper {
  display: flex;
  align-items: center; /* Vertically align text and image */
  gap: var(--padding-standard, 1rem); /* Space between text and image */
}

.create-task-text {
  flex: 1; /* Allow text to take available space */
  text-align: left;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text-primary);
  opacity: 0.9;
}

.screenshot-placeholder-small {
  width: 100%; /* Adjust width relative to text, or set a max-width */
  margin-bottom: var(--padding-standard, 1rem); /* Space below screenshot */
  /* If using an <img> tag: */
  /* img {
      width: 100%;
      height: auto;
      display: block;
      border-radius: var(--border-radius-small, 4px);
      border: 1px solid var(--color-placeholder-border, #555);
  } */
}

/* Open Source Section Styling */
.open-source-section {
  width: 50%;
  margin-top: 4rem;
  margin-bottom: 4rem; /* Good spacing before footer */
}

.open-source-section .content-box {
  width: 100%;
  text-align: center; /* Center text and button */
}

.open-source-section p {
  font-size: 1.5rem;
  margin-bottom: 1.5rem; /* Space before the button */
  color: var(--color-text-primary);
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
