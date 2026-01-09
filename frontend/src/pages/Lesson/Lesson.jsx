import { useParams } from "react-router-dom";

export default function Lesson() {
  const { id } = useParams();

  return (
    <div>
      <h3>Bài học: {id}</h3>
      <video controls width="400">
        <source src="/videos/demo.mp4" type="video/mp4" />
      </video>
      <p>Mô tả cử chỉ tay ở đây.</p>
    </div>
  );
}
