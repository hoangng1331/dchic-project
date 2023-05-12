import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
// import { ProductList } from "./data/ProductList";
import { ProductList } from "../data/ProductList";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";


function Vest() {
  const [products, setProduct] = useState(ProductList);
  return (
    <div className="product">
      <div className="row">
        <div className="col-2">
          <Dropdown>
            <Dropdown.Toggle
              variant="dark"
              id="dropdown-basic"
              style={{ width: "300px", height: "50px" }}
            >
              List Product
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ width: "300px", textAlign: "center" }}>
              <Dropdown.Item href="/vest">Vest/Blazer</Dropdown.Item>
              <Dropdown.Item href="/knitwear">Knitwear</Dropdown.Item>
              <Dropdown.Item href="/ao">Áo</Dropdown.Item>
              <Dropdown.Item href="/vest">Váy</Dropdown.Item>
              <Dropdown.Item href="/quan">Quần</Dropdown.Item>
              <Dropdown.Item href="/quansooc">Quần Sooc</Dropdown.Item>
              <Dropdown.Item href="/chanvay">Chân Váy</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="col-10">
          <div>
            {products.map((product) => (
              <div className="d-inline-flex">
              <div>
                {/* if (product.description === "Vest") {
                  <Card
                  className="shadow p-3 mb-5 bg-body-tertiary rounded"
                  style={{ width: "28rem" }}
                >
                  <Card.Img
                    style={{ width: "26rem" }}
                    variant="top"
                    // src={require(`${product.thumb}`)}
                    src="https://static.dchic.vn/uploads/media/2023/01/DTT_5052-644299225-576x768.jpg"
                  />
                  <Card.Body>
                    <Card.Title>{product.description}</Card.Title>
                    <Card.Text>{product.product_name}</Card.Text>
                    <h6>Price : {product.price} VND </h6>
                    <div>
                      <p>
                        Số lượng:
                        <Button variant="dark" className="m-2" >+</Button >1 <Button variant="dark" >-</Button>
                      </p>
                    </div>
                    <Link to="/order">
                      <Button variant="dark">Thêm vào giỏ hàng</Button>
                    </Link>
                  </Card.Body>
                </Card>
                }  */}
              </div>
                
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Vest