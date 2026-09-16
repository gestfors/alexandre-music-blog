import Footer from "../Footer/Footer.jsx";

export default function Layout({ children, mainProps = {} }) {
  return (
    <>
      <main {...mainProps}>{children}</main>
      <Footer />
    </>
  );
}
