<template>
  <div
    class="progress-bar-container"
    role="progressbar"
    :aria-valuenow="currentValue"
    :aria-valuemin="minValue"
    :aria-valuemax="maxValue"
    :aria-label="ariaLabel || 'Progress'"
    :title="`${percentage.toFixed(0)}%`"
  >
    <div class="progress-bar-track">
      <div
        class="progress-bar-fill"
        :style="fillStyle"
      ></div>
    </div>
    <span v-if="showValueText" class="progress-value-text">
      {{ currentValue.toLocaleString() }} / {{ maxValue.toLocaleString() }}
    </span>
    <span v-if="showPercentageText" class="progress-percentage-text">
      ({{ percentage.toFixed(percentageDecimals) }}%)
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, CSSProperties } from 'vue';

export default defineComponent({
  name: 'ProgressBar',

  props: {
    /**
     * The current value of the progress.
     */
    currentValue: {
      type: Number,
      required: true,
      validator: (value: number) => value >= 0,
    },
    /**
     * The maximum value for the progress.
     */
    maxValue: {
      type: Number,
      required: true,
      validator: (value: number) => value > 0,
    },
    /**
     * The minimum value for the progress (usually 0).
     */
    minValue: {
      type: Number,
      default: 0,
      validator: (value: number) => value >= 0,
    },
    /**
     * The color of the progress bar fill.
     * Defaults to primary green.
     */
    fillColor: {
      type: String,
      default: 'var(--color-primary-green)',
    },
    /**
     * The background color of the progress bar track.
     * Defaults to a darker shade or a subtle color.
     */
    trackColor: {
      type: String,
      default: 'var(--color-background-dark-L2, #1a241a)', // Example: slightly lighter than main bg
    },
    /**
     * Height of the progress bar.
     */
    height: {
      type: String,
      default: '10px', // e.g., '10px', '0.8rem'
    },
    /**
     * Border radius for the progress bar.
     */
    borderRadius: {
      type: String,
      default: 'var(--border-radius-small, 4px)',
    },
    /**
     * Whether to show the "currentValue / maxValue" text.
     */
    showValueText: {
      type: Boolean,
      default: false, // As per screenshot, this text is not directly on the bar
    },
    /**
     * Whether to show the percentage text.
     */
    showPercentageText: {
      type: Boolean,
      default: false, // As per screenshot, this text is not directly on the bar
    },
    /**
     * Number of decimal places for the percentage text.
     */
    percentageDecimals: {
      type: Number,
      default: 0,
      validator: (value: number) => value >= 0 && Number.isInteger(value),
    },
    /**
     * ARIA label for accessibility.
     */
    ariaLabel: {
      type: String,
      default: null,
    }
  },

  setup(props) {
    const percentage = computed(() => {
      if (props.maxValue <= props.minValue) return 0;
      const range = props.maxValue - props.minValue;
      const correctedValue = Math.max(0, Math.min(props.currentValue - props.minValue, range));
      return (correctedValue / range) * 100;
    });

    const fillStyle = computed((): CSSProperties => ({
      width: `${percentage.value}%`,
      backgroundColor: props.fillColor,
      height: '100%', // Fill height of the track
      borderRadius: props.borderRadius, // Apply to fill for consistent rounding
      transition: 'width 0.3s ease-in-out', // Smooth transition on value change
    }));

    return {
      percentage,
      fillStyle,
    };
  },
});
</script>

<style scoped>
.progress-bar-container {
  display: flex;
  align-items: center;
  width: 100%; /* Take full width of its parent by default */
  gap: 0.5em; /* Space between bar and text if shown */
  font-family: var(--font-family-monospace);
  /* If you want to define --color-background-dark-L2 in main.css:
     :root { --color-background-dark-L2: #1a241a; }
     This is just an example for a track color slightly different from the main background.
  */
}

.progress-bar-track {
  flex-grow: 1; /* Track takes available space */
  background-color: var(--trackColor, #1a241a); /* Use prop or fallback */
  border-radius: var(--border-radius); /* Use prop */
  height: 5rem; /* Use prop */
  overflow: hidden; /* Ensures fill doesn't overflow rounded corners */
  position: relative; /* For potential future absolute positioned elements inside track */
}

.progress-bar-fill {
  /* Dynamic styles are applied via :style binding */
  /* Base styles for the fill if any */
}

.progress-value-text,
.progress-percentage-text {
  font-size: 0.8rem; /* Adjust as needed */
  color: var(--color-text-primary);
  white-space: nowrap;
  line-height: 1; /* Ensure text aligns well with bar */
}
</style>
