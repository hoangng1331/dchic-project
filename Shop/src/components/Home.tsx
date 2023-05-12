import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import banner1 from "../image/banner pc 1-592213892.jpg";
import banner2 from "../image/banner 2.png";
import bannerslide from "../image/bannerslide.jpg";
import bannerslide2 from "../image/bannerslide2.jpg";
import shopnow  from "../image/SHOP NOW.png";
function Home() {
  return (
    <>
      <div>
        <div className="content">
          {/* <div className="modal-content">
            <Link to={"/products"} target="_blank">
              <img src={popup} alt="Pop up" />
            </Link>
          </div> */}

          <div
            id="carouselExampleIndicators"
            className="carousel slide"
            data-ride="carousel"
          >
            <ol className="carousel-indicators">
              <li
                data-target="#carouselExampleIndicators"
                data-slide-to="0"
                className="active"
              ></li>
              <li
                data-target="#carouselExampleIndicators"
                data-slide-to="1"
              ></li>
              <li
                data-target="#carouselExampleIndicators"
                data-slide-to="2"
              ></li>
            </ol>
            <div className="carousel-inner">
              <div className="carousel-item active">
                <img src={banner1} className="d-block w-100" alt="..." />
              </div>
              <div className="carousel-item">
                <img src={bannerslide} className="d-block w-100" alt="..." />
              </div>
              <div className="carousel-item">
                <img src={bannerslide2} className="d-block w-100" alt="..." />
              </div>
            </div>
            <button
              className="carousel-control-prev"
              type="button"
              data-target="#carouselExampleIndicators"
              data-slide="prev"
            >
              <span
                className="carousel-control-prev-icon"
                aria-hidden="true"
              ></span>
              <span className="sr-only"></span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-target="#carouselExampleIndicators"
              data-slide="next"
            >
              <span
                className="carousel-control-next-icon"
                aria-hidden="true"
              ></span>
              <span className="sr-only"></span>
            </button>
          </div>
          {/* <img className="image1" src={banner1} alt="banner1" /> */}
          <img className="image2" src={banner2} alt="banner2" />
          <Link className="active" to="/products">
          <img className="image2" style={{width:"200px",height:"100px",margin:"auto"}} src={shopnow} alt="shopnow" />
              </Link>
          {/* <h3 className="h3">SHOP NOW</h3> */}
          <div className="content2">
            <h4 className="h4">Hệ Thống Cửa Hàng</h4>
            <Link className="cuahang" to="/system">
              {" "}
              Cửa hàng của chúng tôi
            </Link>
          </div>
        </div>
        <div className="footer">
          <div className="footer">
            ® 2023 . Công ty TNHH MTV D.CHIC hân hạnh được tiếp đón quý khách Sự
            hài lòng của quý khách là niềm vinh hạnh của chúng tôi.
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
