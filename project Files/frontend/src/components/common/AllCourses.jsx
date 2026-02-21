import React, { useState, useEffect, useContext } from "react";
import axiosInstance from "./AxiosInstance";
import { Button, Modal, Form } from "react-bootstrap";
import { UserContext } from "../../App";
import { Link, useNavigate } from "react-router-dom";
import { MDBCol, MDBInput, MDBRow } from "mdb-react-ui-kit";

const AllCourses = () => {
  const navigate = useNavigate();
  const user = useContext(UserContext);

  const [allCourses, setAllCourses] = useState([]);
  const [filterTitle, setFilterTitle] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showModal, setShowModal] = useState([]);

  const [cardDetails, setCardDetails] = useState({
    cardholdername: "",
    cardnumber: "",
    cvvcode: "",
    expmonthyear: "",
  });

  // ================= CHANGE HANDLER =================
  const handleChange = (e) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  // ================= FREE CHECK =================
  const isCourseFree = (price) => {
    if (!price) return false;

    const priceStr = price.toString().toLowerCase().trim();
    return priceStr.includes("free") || priceStr === "0";
  };

  // ================= MODAL SHOW =================
  const handleShow = (courseIndex, coursePrice, courseId, courseTitle) => {
    // ✅ FREE course direct enroll
    if (isCourseFree(coursePrice)) {
      handleSubmit(courseId, true);
      return;
    }

    // ✅ paid course → open modal
    setShowModal((prev) => {
      const updated = [...prev];
      updated[courseIndex] = true;
      return updated;
    });
  };

  // ================= MODAL CLOSE =================
  const handleClose = (courseIndex) => {
    setShowModal((prev) => {
      const updated = [...prev];
      updated[courseIndex] = false;
      return updated;
    });
  };

  // ================= GET COURSES =================
  const getAllCoursesUser = async () => {
    try {
      const res = await axiosInstance.get("api/user/getallcourses", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res?.data?.success) {
        setAllCourses(res.data.data || []);
        setShowModal(Array(res.data.data.length).fill(false));
      }
    } catch (error) {
      console.log("Get courses error:", error);
    }
  };

  useEffect(() => {
    getAllCoursesUser();
  }, []);

  // ================= ENROLL =================
  const handleSubmit = async (courseId, isFree = false) => {
    try {
      const res = await axiosInstance.post(
        `api/user/enrolledcourse/${courseId}`,
        cardDetails,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res?.data?.success) {
        alert(res.data.message);

        const courseTitle = res.data.course?.Title || "";
        navigate(`/courseSection/${res.data.course.id}/${courseTitle}`);
      } else {
        alert(res?.data?.message || "Enrollment failed");
      }
    } catch (error) {
      console.log("Enroll error:", error);
    }
  };

  // ================= FILTERED COURSES =================
  const filteredCourses = allCourses
    ?.filter((course) =>
      filterTitle === ""
        ? true
        : course?.C_title?.toLowerCase().includes(filterTitle.toLowerCase())
    )
    .filter((course) => {
      if (filterType === "Free") return isCourseFree(course?.C_price);
      if (filterType === "Paid") return !isCourseFree(course?.C_price);
      return true;
    });

  // ================= UI =================
  return (
    <>
      {/* FILTER */}
      <div className="mt-4 filter-container text-center">
        <p className="mt-3">Search By:</p>

        <input
          type="text"
          placeholder="title"
          value={filterTitle}
          onChange={(e) => setFilterTitle(e.target.value)}
        />

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Courses</option>
          <option value="Paid">Paid</option>
          <option value="Free">Free</option>
        </select>
      </div>

      {/* COURSES */}
      <div className="p-2 course-container">
        {filteredCourses?.length > 0 ? (
          filteredCourses.map((course, index) => (
            <div
              key={course._id}
              className="course futuristic-card"
              style={{
                width: "370px",
                margin: "22px",
                borderRadius: "22px",
                background:
                  "linear-gradient(135deg, #0f2027 0%, #2c5364 100%)",
                boxShadow: "0 0 32px #00e0ff55",
                padding: "0",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* FRONT */}
              <div
                style={{
                  height: "180px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <h2 style={{ color: "#00ffff" }}>{course.C_title}</h2>
              </div>

              {/* BACK */}
              <div className="p-3 text-center">
                <p>{course.C_categories}</p>
                <p>by: {course.C_educator}</p>
                <p>Price: {course.C_price}</p>
                <p>Enrolled: {course.enrolled}</p>

                {user?.userLoggedIn ? (
                  <>
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() =>
                        handleShow(
                          index,
                          course.C_price,
                          course._id,
                          course.C_title
                        )
                      }
                    >
                      Enroll Now
                    </Button>

                    <Modal
                      show={showModal[index] || false}
                      onHide={() => handleClose(index)}
                    >
                      <Modal.Header closeButton>
                        <Modal.Title>
                          Payment for {course.C_title}
                        </Modal.Title>
                      </Modal.Header>

                      <Modal.Body>
                        <Form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit(course._id);
                          }}
                        >
                          <MDBInput
                            className="mb-2"
                            label="Card Holder Name"
                            name="cardholdername"
                            value={cardDetails.cardholdername}
                            onChange={handleChange}
                            type="text"
                            required
                          />

                          <MDBInput
                            className="mb-2"
                            label="Card Number"
                            name="cardnumber"
                            value={cardDetails.cardnumber}
                            onChange={handleChange}
                            type="text"
                            maxLength={16}
                            required
                          />

                          <MDBRow className="mb-4">
                            <MDBCol md="6">
                              <MDBInput
                                name="expmonthyear"
                                value={cardDetails.expmonthyear}
                                onChange={handleChange}
                                label="Expiration"
                                type="text"
                                required
                              />
                            </MDBCol>

                            <MDBCol md="6">
                              <MDBInput
                                name="cvvcode"
                                value={cardDetails.cvvcode}
                                onChange={handleChange}
                                label="CVV"
                                type="text"
                                maxLength={3}
                                required
                              />
                            </MDBCol>
                          </MDBRow>

                          <div className="d-flex justify-content-end">
                            <Button
                              className="mx-2"
                              variant="secondary"
                              onClick={() => handleClose(index)}
                            >
                              Close
                            </Button>
                            <Button variant="primary" type="submit">
                              Pay Now
                            </Button>
                          </div>
                        </Form>
                      </Modal.Body>
                    </Modal>
                  </>
                ) : (
                  <Link to="/login">
                    <Button variant="outline-info" size="sm">
                      Enroll Now
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No courses at the moment</p>
        )}
      </div>
    </>
  );
};

export default AllCourses;
