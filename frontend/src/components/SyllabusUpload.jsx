import { uploadSyllabus } from "../services/syllabus.service.js";

function SyllabusUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const syllabusText = await uploadSyllabus(file);
      console.log(syllabusText); // next step: send this to parse-syllabus
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload Syllabus"}
      </button>
    </div>
  );
}

export default SyllabusUpload;