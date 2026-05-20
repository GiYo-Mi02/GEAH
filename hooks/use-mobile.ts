import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Initial setup inside a small timeout or just avoiding sync state change if possible,
    // but the best way without sync effects is to just set it in a microtask, or simply
    // use a different pattern. Let's just wrap the initial call in a setTimeout to avoid sync issue.
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    
    // Defer the initial state update to avoiding cascading render warning
    const timeout = setTimeout(() => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT), 0);
    
    return () => {
      mql.removeEventListener("change", onChange)
      clearTimeout(timeout)
    }
  }, [])

  return !!isMobile
}
