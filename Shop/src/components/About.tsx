import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function About() {
  return (
    <div className="container">
      <div className="about">
        <h1> VỀ CHÚNG TÔI - D.CHIC</h1>
        <h5>NEW-tiME - NEW ME</h5>
      </div>
      <div className="row">
        <div className="col-6">
          <p className="contentabout">
            D.CHIC – Delicate & Chic. Sự sang trọng và tinh tế là hai yếu tố
            quyết định hàng đầu trong việc hình thành vẻ đẹp tự tin và thần thái
            quyến rũ của người phụ nữ.
          </p>
          <p className="contentabout">
            {" "}
            Chính vì vậy, từng chi tiết trên những mẫu thiết kế do D.CHIC tạo ra
            đều làm nổi bật những nét đẹp tiềm ẩn, từng đường cong trên cơ thể
            người phụ nữ để họ luôn cảm nhận nguồn năng lượng phát ra từ trong
            chính bản thân họ. Những thiết kế của D.CHIC là sự kết hợp hoàn hảo
            của tính thời trang và tính ứng dụng giúp khách hàng có thể sử dụng
            trang phục của D.CHIC trong nhiều trường hợp mà vẫn đảm bảo một vẻ
            ngoài sang trọng, đậm chất cá tính.{" "}
          </p>
          <p className="contentabout">
            Đặc biệt, D.CHIC Couture là dòng sản phẩm thủ công cao cấp, được
            kiểm soát chặt chẽ khâu chọn lựa vải, thiết kế chi tiết cầu kì, sang
            trọng và đẳng cấp, thổi vào từng sản phẩm nguồn năng lượng sáng tạo
            và nghệ thuật.{" "}
          </p>
          <p className="contentabout">
            Hướng đến xây dựng hình ảnh thương hiệu thiết kế Made in Viet Nam,
            D.CHIC đang từng bước khẳng định vị trí của mình trong ngành thời
            trang Việt nam và nâng tầm hình ảnh thời trang Việt Nam đến với thế
            giới. Chính vì vậy, không chỉ tập trung xây dựng đội ngũ nhân viên
            chuyên nghiệp, năng động và sáng tạo, D.CHIC còn tập trung phát
            triển mạng lưới showroom được thiết kế theo phong cách hiện đại với
            nhiều dịch vụ tiện ích đem lại những trải nghiệm mua sắm mới mẻ dành
            cho khách hàng.{" "}
          </p>
          <p>D.CHIC | NEW tiME - NEW ME.</p>
        </div>
        <div className="col-6">
          <div className="ytp-cued-thumbnail-overlay-image"></div>
        </div>
      </div>
    </div>
  );
}

export default About;
