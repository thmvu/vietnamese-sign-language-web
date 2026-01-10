import { useParams } from "react-router-dom";
import "./Lesson.css";

export default function Lesson() {
  const { id } = useParams();

  return (
    <div className="lesson-page">
      <h1>Bài học: {id}</h1>

      <video controls>
        <source src="/videos/demo.mp4" type="video/mp4" />
      </video>

      <p>
        Mô tả chi tiết cử chỉ tay cho bài học này. 
        Sau này nội dung sẽ lấy từ backend hoặc AI.
      </p>
    </div>
  );
}
