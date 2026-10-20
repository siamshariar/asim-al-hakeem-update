import { useEffect } from "react";
import { useRouter } from "next/router";
import * as gtag from "../lib/gtag";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "materialize-css/dist/css/materialize.min.css";
import "slick-carousel/slick/slick.css";
import "../styles/style.scss";
import "../styles/QuranSlider.scss";
import '../styles/globals.css';
import Layout from "../components/layout";
import ScrollReveal from "../components/scroll-reveal";
import useScrollRestoration from '../hooks/use-scroll-restoration';

const App = ({ Component, pageProps }) => {
  const router = useRouter();
  useScrollRestoration();
  
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (typeof gtag.pageview === 'function') {
        gtag.pageview(url);
      }
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <Layout>
      <ScrollReveal />
      <Component {...pageProps} />
    </Layout>
  );
};

export default App;