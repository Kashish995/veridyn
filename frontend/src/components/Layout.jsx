const Layout = ({ children }) => {
  const pageWrapper = {
    maxWidth: "900px",
    margin: "60px auto",
    padding: "0 20px",
  };

  return <div style={pageWrapper}>{children}</div>;
};

export default Layout;