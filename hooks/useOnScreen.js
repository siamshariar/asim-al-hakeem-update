import { useState, useEffect, useRef, useCallback } from 'react'

const useOnScreen = (ref, options = {}, resetKey) => {
    const [isIntersecting, setIntersecting] = useState(false)
    const observerRef = useRef(null)
    const rafRef = useRef(null)
    const listenerRef = useRef(null)

    const parseRootMargin = (rootMargin = '0px') => {
        const parts = String(rootMargin).trim().split(/\s+/).filter(Boolean)
        const normalized = [parts[0], parts[1] || parts[0], parts[2] || parts[0], parts[3] || parts[1] || parts[0]]

        const toPixels = (value) => {
            const parsed = Number.parseFloat(value)
            return Number.isFinite(parsed) ? parsed : 0
        }

        return {
            top: toPixels(normalized[0]),
            right: toPixels(normalized[1]),
            bottom: toPixels(normalized[2]),
            left: toPixels(normalized[3]),
        }
    }

    const isElementWithinViewport = useCallback((element, rootMargin = '0px') => {
        if (!element || typeof window === 'undefined' || typeof document === 'undefined') {
            return false
        }

        const rect = element.getBoundingClientRect()
        const margin = parseRootMargin(rootMargin)
        const viewportTop = -margin.top
        const viewportLeft = -margin.left
        const viewportBottom = (window.innerHeight || document.documentElement.clientHeight || 0) + margin.bottom
        const viewportRight = (window.innerWidth || document.documentElement.clientWidth || 0) + margin.right

        return (
            rect.bottom >= viewportTop &&
            rect.right >= viewportLeft &&
            rect.top <= viewportBottom &&
            rect.left <= viewportRight
        )
    }, [])

    const evaluateVisibility = useCallback(() => {
        return isElementWithinViewport(ref?.current, options.rootMargin || '0px')
    }, [isElementWithinViewport, options.rootMargin, ref])

    const scheduleVisibilityCheck = useCallback(() => {
        if (typeof window === 'undefined') return

        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current)
        }

        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null
            setIntersecting(evaluateVisibility())
        })
    }, [evaluateVisibility])

    useEffect(() => {
        // Cleanup previous observer
        if (observerRef.current) {
            observerRef.current.disconnect()
            observerRef.current = null
        }

        if (listenerRef.current && typeof window !== 'undefined') {
            window.removeEventListener('scroll', listenerRef.current)
            window.removeEventListener('resize', listenerRef.current)
            window.removeEventListener('orientationchange', listenerRef.current)
            listenerRef.current = null
        }

        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = null
        }

        if (!ref?.current || typeof IntersectionObserver === "undefined") {
            scheduleVisibilityCheck()

            if (typeof window !== 'undefined') {
                const handleViewportChange = () => scheduleVisibilityCheck()
                listenerRef.current = handleViewportChange
                window.addEventListener('scroll', handleViewportChange, { passive: true })
                window.addEventListener('resize', handleViewportChange, { passive: true })
                window.addEventListener('orientationchange', handleViewportChange, { passive: true })
            }

            return
        }

        scheduleVisibilityCheck()

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIntersecting(Boolean(entry?.isIntersecting) || evaluateVisibility())
            },
            {
                root: options.root || null,
                rootMargin: options.rootMargin || '0px',
                threshold: options.threshold || 0,
            }
        )

        observer.observe(ref.current)
        observerRef.current = observer

        const handleViewportChange = () => scheduleVisibilityCheck()
        listenerRef.current = handleViewportChange
        window.addEventListener('scroll', handleViewportChange, { passive: true })
        window.addEventListener('resize', handleViewportChange, { passive: true })
        window.addEventListener('orientationchange', handleViewportChange, { passive: true })

        scheduleVisibilityCheck()
        window.setTimeout(scheduleVisibilityCheck, 0)
        window.setTimeout(scheduleVisibilityCheck, 100)

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect()
                observerRef.current = null
            }

            if (listenerRef.current) {
                window.removeEventListener('scroll', listenerRef.current)
                window.removeEventListener('resize', listenerRef.current)
                window.removeEventListener('orientationchange', listenerRef.current)
                listenerRef.current = null
            }

            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = null
            }
        }
    }, [evaluateVisibility, options.root, options.rootMargin, options.threshold, ref, resetKey, scheduleVisibilityCheck])

    return isIntersecting
}

export default useOnScreen