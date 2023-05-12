import React from "react";
import dhicitem from "../../image/D.CHIC.png";
function Ao() {
  return (
    <div>
      <div className="row">
        <div className="col-6"> ok</div>
        <div className="col-6">
          <div className="d-flex justify-content-center container mt-5">
            <div className="card p-3 bg-white">
              <i className="fa fa-apple"></i>

              <div className="about-product text-center mt-2">
                <img src={dhicitem} style={{ width: "300px" }} />
                <div className="text-uppercase product-name" style={{padding: '5px 0px'}}>
                AV dài tay túi ốp ngực trang trí
              </div>
              </div>
              <div>
              <div className="product-ms" style={{padding: '10px 0px', textAlign:"center"}}>MS: 161621</div>
              <div className="form-group price-detail" style={{padding: '5px 0px'}}>
                <span
                  className="mr-3 origin"
                  style={{
                    textDecoration: "line-through",
                    margin: "10px",
                    fontSize: "18px",
                  }}
                >
                  2.200.000 VNĐ
                </span>
                <span
                  className="sale"
                  style={{ color: "red", fontSize: "20px" }}
                >
                  1.100.000 VNĐ
                </span>
              </div>
            </div>
            <div className="form-check" style={{padding: '0px 0px'}}>
              
              <label className="form-check-label" htmlFor="inlineRadio1">
                Đỏ
              </label>
              <input
                className="form-check-input"
                type="radio"
                name="inlineRadioOptions"
                id="inlineRadio1"
                value="option1"
              />
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="inlineRadioOptions"
                id="inlineRadio2"
                value="option2"
              />
              <label className="form-check-label" htmlFor="inlineRadio2">
                Xanh
              </label>
            </div>
            <div className="size">
             <div>
              <label htmlFor="" style={{padding: '5px 0px',textAlign:"center"}}  >Size</label>
             </div>
             <div className="form-check form-check-inline" style={{padding: '5px 0px'}} >
              <input
                className="form-check-input"
                type="radio"
                name="inlineRadioOptions"
                id="inlineRadio1"
                value="option1"
              />
              <label className="form-check-label" htmlFor="inlineRadio1">
                S
              </label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="inlineRadioOptions"
                id="inlineRadio1"
                value="option1"
              />
              <label className="form-check-label" htmlFor="inlineRadio1">
                M
              </label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="inlineRadioOptions"
                id="inlineRadio1"
                value="option1"
              />
              <label className="form-check-label" htmlFor="inlineRadio1">
                L
              </label>
            </div>
            <div className="btn add-to-cart text-black w-100" id="btn-add-cart" style={{background:'antiquewhite', padding:'10px 0px' }}>Thêm vào giỏ hàng</div>
            </div>
              {/* <div className="stats mt-2">
                <div className="d-flex justify-content-between p-price">
                  <span>Pro Display XDR</span>
                  <span>$5,999</span>
                </div>
                <div className="d-flex justify-content-between p-price">
                  <span>Pro stand</span>
                  <span>$999</span>
                </div>
                <div className="d-flex justify-content-between p-price">
                  <span>Vesa Mount Adapter</span>
                  <span>$199</span>
                </div>
              </div>
              <div className="d-flex justify-content-between total font-weight-bold mt-4">
                <span>Total</span>
                <span>$7,197.00</span>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ao;
