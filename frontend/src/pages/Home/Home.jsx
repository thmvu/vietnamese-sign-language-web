import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="home">

      {/* HERO */}
      <section className="hero">
        <div className="hero-text">
          <h1>Học Ngôn Ngữ Ký Hiệu</h1>
          <p>
            Nền tảng học ngôn ngữ ký hiệu trực quan, dễ hiểu,
            dành cho người mới bắt đầu.
          </p>
          <Link to="/course" className="btn">
            Bắt đầu học ngay
          </Link>
        </div>

        <div className="hero-image">
          <img
            src="/images/hand-sign.png"
            alt="Sign Language"
          />
        </div>
      </section>

      {/* GIỚI THIỆU */}
      <section className="intro">
        <h2>Tại sao nên học ngôn ngữ ký hiệu?</h2>
        <p>
          Ngôn ngữ ký hiệu giúp kết nối cộng đồng,
          hỗ trợ người khiếm thính và mở rộng khả năng giao tiếp.
        </p>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div className="feature">
          <h3>🎥 Video trực quan</h3>
          <p>Học bằng video thực tế, dễ quan sát động tác tay.</p>
        </div>

        <div className="feature">
          <h3>📚 Lộ trình rõ ràng</h3>
          <p>Từ cơ bản đến nâng cao, phù hợp cho người mới.</p>
        </div>

        <div className="feature">
          <h3>🤖 AI hỗ trợ</h3>
          <p>Nhận diện cử chỉ tay (demo) để luyện tập hiệu quả.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Sẵn sàng bắt đầu?</h2>
        <Link to="/course" className="btn">
          Xem khoá học
        </Link>
      </section>

    </div>
  );
}
