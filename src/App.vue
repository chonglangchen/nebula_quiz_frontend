<script>
export default {
  globalData: {
    systemInfo: null
  },
  onLaunch() {
    // Get system info
    uni.getSystemInfo({
      success: (res) => {
        this.globalData.systemInfo = res
        // Set CSS variable for status bar height
        const statusBarHeight = res.statusBarHeight || 0
        document.documentElement.style.setProperty('--status-bar-height', `${statusBarHeight}px`)
      }
    })
  }
}
</script>

<style lang="scss">
@import '@/uni.scss';

/* ── Global Reset & Base ── */
page {
  font-family: $font-body;
  font-size: $text-body;
  color: $text-primary;
  background-color: $bg-cool;
  line-height: $leading-body;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ── Safe Area ── */
.safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

/* ── Typography Defaults ── */
h1, h2, h3, h4, h5, h6 {
  font-family: $font-display;
  letter-spacing: $tracking-heading;
  font-weight: 700;
  line-height: 1.3;
}

/* ── Scrollbar Hide ── */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

/* ── Tap highlight ── */
view, text, image, button {
  -webkit-tap-highlight-color: transparent;
}

/* ── Global interactive states ── */
button {
  &::after {
    border: none;
  }

  &:active {
    opacity: 0.85;
    transform: scale(0.98);
  }
}

/* ── Focus states for accessibility ── */
input, textarea, button {
  &:focus-visible {
    outline: 2rpx solid $brand-cyan;
    outline-offset: 2rpx;
  }
}

/* ── Link styles ── */
.n-link {
  color: $text-link;
  text-decoration: none;
}

/* ── Utility: text clamp ── */
.text-clamp-1 { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.text-clamp-2 { overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }

/* ── Fade-in page transition ── */
.page-fade-enter-active,
.page-fade-leave-active {
  transition-property: opacity;
  transition-duration: $duration-normal;
  transition-timing-function: $ease-out;
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>
