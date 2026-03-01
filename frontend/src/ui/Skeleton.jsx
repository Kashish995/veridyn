import "../styles/skeleton.css";

const Skeleton = ({ height = "20px", width = "100%" }) => {
  return (
    <div
      className="skeleton"
      style={{ height, width }}
    />
  );
};

export default Skeleton;