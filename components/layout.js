import Footer from "./footer";

export default function Layout({ children }) {
  return (
    <>
      <div className="content_without_footer">
        <main className="homepage home-3">{children}</main>
      </div>
      <Footer />
    </>
  );
}
