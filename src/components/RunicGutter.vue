<template>
  <div class="runic-gutter-wrapper" :style="wrapperStyle">
    <canvas ref="runicCanvasStatic" class="runic-canvas"></canvas>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  onUnmounted,
  watch,
  type PropType,
  nextTick,
  computed,
} from 'vue'

// Example runes - you can expand this or use a specific character set
const RUNES = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ'

interface StaticRune {
  char: string
  x: number
  y: number
  baseOpacity: number // For the dim state
  activeOpacity: number // For the lit state
  currentOpacity: number
  targetOpacity: number
  color: string
}

export default defineComponent({
  name: 'RunicGutterStatic',
  props: {
    isActive: {
      type: Boolean,
      default: false,
    },
    orientation: {
      type: String as PropType<'vertical' | 'horizontal'>,
      default: 'vertical',
    },
    thickness: {
      type: String,
      default: '30px', // Width for vertical, Height for horizontal
    },
    runeSize: {
      type: String,
      default: '20px', // CSS font size for runes
    },
    runeSpacing: {
      type: Number, // Additional spacing between runes in pixels
      default: 5,
    },
    runeColor: {
      type: String,
      default: 'var(--color-primary-green)',
    },
    dimOpacity: {
      type: Number,
      default: 0.3, // Slightly more visible for static runes
    },
    activeOpacity: {
      type: Number,
      default: 0.8,
    },
    transitionSpeed: {
      type: Number,
      default: 0.03, // Slower transition for a smoother fade
    },
  },
  setup(props) {
    const runicCanvasStatic = ref<HTMLCanvasElement | null>(null)
    let ctx: CanvasRenderingContext2D | null = null
    let animationFrameId: number | null = null
    const staticRunes = ref<StaticRune[]>([])
    let canvasWidth = 0
    let canvasHeight = 0
    let resolvedRuneColor = '#01FF00' // Default fallback

    const wrapperStyle = computed(() => ({
      width: props.orientation === 'vertical' ? props.thickness : '100%',
      height: props.orientation === 'horizontal' ? props.thickness : '100%',
    }))

    const getResolvedRuneColor = () => {
      if (typeof window !== 'undefined') {
        try {
          // Extract variable name if it's a CSS var
          const match = props.runeColor.match(/var\((--[^,)]+)/)
          if (match && match[1]) {
            return (
              getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim() ||
              '#01FF00'
            )
          }
          return props.runeColor // Assume it's a direct color if not a var()
        } catch (e) {
          console.warn('Could not resolve runeColor, defaulting.', e)
          return '#01FF00'
        }
      }
      return '#01FF00' // Fallback for SSR or if window is not defined
    }

    const initializeCanvas = () => {
      if (!runicCanvasStatic.value) return
      ctx = runicCanvasStatic.value.getContext('2d')
      if (!ctx) return

      resolvedRuneColor = getResolvedRuneColor()

      const dpr = window.devicePixelRatio || 1
      const parent = runicCanvasStatic.value.parentElement
      if (!parent) return

      canvasWidth = parent.offsetWidth
      canvasHeight = parent.offsetHeight

      runicCanvasStatic.value.width = canvasWidth * dpr
      runicCanvasStatic.value.height = canvasHeight * dpr
      ctx.scale(dpr, dpr)

      createStaticRunes()
    }

    const createStaticRunes = () => {
      if (!ctx) return
      staticRunes.value = []
      const parsedRuneSize = parseFloat(props.runeSize) // Get numeric value of runeSize
      const effectiveRuneSize = parsedRuneSize + props.runeSpacing

      if (props.orientation === 'vertical') {
        const numRunes = Math.floor(canvasHeight / effectiveRuneSize)
        const xPos = canvasWidth / 2 // Center runes horizontally
        for (let i = 0; i < numRunes; i++) {
          const yPos = i * effectiveRuneSize + effectiveRuneSize / 2 + parsedRuneSize / 4 // Center vertically within its slot
          staticRunes.value.push({
            char: RUNES[Math.floor(Math.random() * RUNES.length)],
            x: xPos,
            y: yPos,
            baseOpacity: props.dimOpacity,
            activeOpacity: props.activeOpacity,
            currentOpacity: props.isActive ? props.activeOpacity : props.dimOpacity,
            targetOpacity: props.isActive ? props.activeOpacity : props.dimOpacity,
            color: resolvedRuneColor,
          })
        }
      } else {
        // Horizontal
        const numRunes = Math.floor(canvasWidth / effectiveRuneSize)
        const yPos = canvasHeight / 2 + parsedRuneSize / 4 // Center runes vertically, adjust for text baseline
        for (let i = 0; i < numRunes; i++) {
          const xPos = i * effectiveRuneSize + effectiveRuneSize / 2 // Center horizontally
          staticRunes.value.push({
            char: RUNES[Math.floor(Math.random() * RUNES.length)],
            x: xPos,
            y: yPos,
            baseOpacity: props.dimOpacity,
            activeOpacity: props.activeOpacity,
            currentOpacity: props.isActive ? props.activeOpacity : props.dimOpacity,
            targetOpacity: props.isActive ? props.activeOpacity : props.dimOpacity,
            color: resolvedRuneColor,
          })
        }
      }
    }

    const draw = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)

      ctx.font = `${props.runeSize} ${getComputedStyle(document.documentElement).getPropertyValue('--font-family-monospace')}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle' // Helps with vertical centering

      staticRunes.value.forEach((rune) => {
        // Update opacity towards target
        if (rune.currentOpacity < rune.targetOpacity) {
          rune.currentOpacity = Math.min(
            rune.currentOpacity + props.transitionSpeed,
            rune.targetOpacity,
          )
        } else if (rune.currentOpacity > rune.targetOpacity) {
          rune.currentOpacity = Math.max(
            rune.currentOpacity - props.transitionSpeed,
            rune.targetOpacity,
          )
        }

        ctx!.fillStyle = hexToRgba(rune.color, rune.currentOpacity)
        ctx!.fillText(rune.char, rune.x, rune.y)
      })
    }

    const animate = () => {
      draw()
      animationFrameId = requestAnimationFrame(animate)
    }

    const hexToRgba = (hex: string, alpha: number): string => {
      let r = 0,
        g = 0,
        b = 0
      if (hex.startsWith('#')) {
        const bigint = parseInt(hex.slice(1), 16)
        r = (bigint >> 16) & 255
        g = (bigint >> 8) & 255
        b = bigint & 255
      } else if (hex.startsWith('rgb')) {
        const parts = hex.match(/\d+/g)
        if (parts && parts.length >= 3) {
          r = parseInt(parts[0])
          g = parseInt(parts[1])
          b = parseInt(parts[2])
        }
      } else {
        // Fallback for direct color names (less accurate, browser dependent)
        // This is a very basic attempt and might not work for all color names
        const tempEl = document.createElement('div')
        tempEl.style.color = hex
        document.body.appendChild(tempEl)
        const computedColor = getComputedStyle(tempEl).color
        document.body.removeChild(tempEl)
        const parts = computedColor.match(/\d+/g)
        if (parts && parts.length >= 3) {
          r = parseInt(parts[0])
          g = parseInt(parts[1])
          b = parseInt(parts[2])
        }
      }
      return `rgba(${r},${g},${b},${alpha})`
    }

    watch(
      () => props.isActive,
      (newVal) => {
        staticRunes.value.forEach((rune) => {
          rune.targetOpacity = newVal ? rune.activeOpacity : rune.baseOpacity
        })
      },
    )

    // Watch for changes that require re-initialization
    watch(
      () => [
        props.thickness,
        props.orientation,
        props.runeSize,
        props.runeSpacing,
        props.runeColor,
        props.dimOpacity,
        props.activeOpacity,
      ],
      () => {
        nextTick(() => {
          initializeCanvas()
        })
      },
      { deep: true },
    )

    onMounted(() => {
      nextTick(() => {
        initializeCanvas()
        animate()
      })
      window.addEventListener('resize', initializeCanvas)
    })

    onUnmounted(() => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      window.removeEventListener('resize', initializeCanvas)
    })

    return {
      runicCanvasStatic,
      wrapperStyle,
    }
  },
})
</script>

<style scoped>
.runic-gutter-wrapper {
  overflow: hidden;
  position: relative;
  background-color: var(--color-background-dark); /* Match page gutter background */
}

.runic-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
