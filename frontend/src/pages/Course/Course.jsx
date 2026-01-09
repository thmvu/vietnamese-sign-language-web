import { Link } from "react-router-dom";

export default function Course() {
  return (
    <div>
      <h2>Khoá học</h2>
      <ul>
        <li>
          <Link to="/course/99-dau-hieu">99 dấu hiệu đầu tiên</Link>
        </li>
        <li>
          <Link to="/course/150-thiet-yeu">150 từ thiết yếu</Link>
        </li>
      </ul>
    </div>
  );
}
