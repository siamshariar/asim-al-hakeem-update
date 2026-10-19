import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

import Meta from "../../components/meta";
import { useRouter } from "next/router";

export default function PDFViewer() {
  const router = useRouter();
  const { file } = router.query;

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return <>
    <Meta
      title="Document viewer"
      description="Read documents shared by Sheikh Assim Al Hakeem."
      image="/img/id/default_share.jpeg"
      type="website"
    />

    <section>
      <div>
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js">
          <Viewer
            fileUrl={decodeURIComponent((file + "").replace(/\+/g, "%20"))}
            plugins={[defaultLayoutPluginInstance]}
          />
        </Worker>
      </div>

      <style jsx>{`
        section {
          padding: 1rem;
          width: 100vw;
          height: 100vh;
        }
        div {
          width: 100%;
          max-width: 1140px;
          height: 100%;
          margin: 0 auto;
        }
        @media only screen and (max-width: 600px) {
          section {
            padding: 0;
          }
        }
      `}</style>
    </section>
  </>;
}
