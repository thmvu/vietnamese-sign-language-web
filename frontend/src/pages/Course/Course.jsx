import { Link } from "react-router-dom";
import "./Course.css";

const courses = [
  {
    id: "99-dau-hieu",
    title: "99 dấu hiệu đầu tiên",
    desc: "Những cử chỉ tay cơ bản cho người mới",
  },
  {
    id: "150-thiet-yeu",
    title: "150 từ thiết yếu",
    desc: "Giao tiếp hàng ngày bằng ngôn ngữ ký hiệu",
  },
];

export default function Course() {
  return (
    <div className="course-page">
      <h1>Khoá học</h1>

      <div className="course-grid">
        {courses.map((c) => (
          <Link key={c.id} to={`/course/${c.id}`} className="course-card">
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
