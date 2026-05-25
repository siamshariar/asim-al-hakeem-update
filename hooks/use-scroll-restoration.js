import { useEffect, useLayoutEffect, useRef } from 'react';
import { useRouter } from 'next/router';

function saveScrollPos(url, y) {
  sessionStorage.setItem(`scroll_pos_${url}`, y.toString());
}

function restoreScrollPos(url) {
  const y = sessionStorage.getItem(`scroll_pos_${url}`);
  return y ? parseInt(y, 10) : undefined;
}

export default function useScrollRestoration() {
  const router = useRouter();
  const scrollY = useRef(null);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';

      const onBeforeUnload = () => {
        saveScrollPos(router.asPath, window.scrollY);
      };

      const onRouteChangeStart = () => {
        saveScrollPos(router.asPath, window.scrollY);
      };

      window.addEventListener('beforeunload', onBeforeUnload);
      router.events.on('routeChangeStart', onRouteChangeStart);

      router.beforePopState((state) => {
        const pos = restoreScrollPos(state.as);
        if (pos !== undefined) {
          state.options.scroll = false;
          scrollY.current = pos;
        }
        return true;
      });

      return () => {
        window.removeEventListener('beforeunload', onBeforeUnload);
        router.events.off('routeChangeStart', onRouteChangeStart);
        router.beforePopState(() => true);
      };
    }
  }, [router]);

  useLayoutEffect(() => {
    if (scrollY.current === null || typeof window === 'undefined') {
      return;
    }

    window.scrollTo(0, scrollY.current);
    document.documentElement.scrollTop = scrollY.current;
    document.body.scrollTop = scrollY.current;
    scrollY.current = null;
  }, [router.asPath]);
}
