import axios from "axios";
import { useEffect, useState } from "react";
// import styles from "./MasterCmp.module.css";
import Swal from "sweetalert2";
import useAuthStore from "../../authstore/useAuthStore";
import styles from "./CreateBrand.module.css";

const CreateBrand = () => {
  const [brand, setBrand] = useState({
    brandName: "",
    description: "",
  });
  const [brandList, setBrandList] = useState([]);
  const [send, setSend] = useState(false);
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/master/getBrandList`)
      .then((res) => {
        console.log(res.data);
        setBrandList([...res.data]);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [send]);
  const { loginId } = useAuthStore();
  const changeDescription = async (brand) => {
    const { value: patchDescription } = await Swal.fire({
      title: "설명 수정",
      input: "text",
      inputLabel: "수정할 설명문",
      showCancelButton: true,
      inputValidator: (v) => (!v ? "빈문자열은 불가합니다" : undefined),
    });
    if (patchDescription) {
      const patchBrand = {
        brandName: brand.brandName,
        description: patchDescription,
      };
      console.log(patchBrand);
      axios
        .patch(
          `${import.meta.env.VITE_BACKSERVER}/master/patchBrand`,
          patchBrand,
        )
        .then((res) => {
          if (res.data === 1) {
            Swal.fire({
              icon: "info",
              text: "브랜드가 수정되었습니다.",
              confirmButtonText: "확인",
            });
            setSend(!send);
            console.log(res.data);
          }
        })
        .catch((err) => {
          console.log(err);
        });
      console.log("afteraxios");
    }
  };
  return (
    loginId && (
      <div className={styles.createBrand_page}>
        <h2 className={styles.createBrand_title}>브랜드 생성</h2>

        <div className={styles.createBrand_wrap}>
          <div className={styles.createBrand_content_wrap}>
            <div className={styles.createBrand_field}>
              <label htmlFor="brandName">브랜드 이름</label>
              <input
                id="brandName"
                value={brand.brandName}
                name="brandName"
                onChange={(e) => {
                  setBrand({ ...brand, [e.target.name]: e.target.value });
                }}
              />
            </div>

            <div className={styles.createBrand_field}>
              <label htmlFor="brandInfo">브랜드 설명</label>
              <textarea
                id="brandInfo"
                name="description"
                value={brand.description}
                onChange={(e) => {
                  setBrand({ ...brand, [e.target.name]: e.target.value });
                }}
              />
            </div>

            <button
              className={styles.createBrand_submit}
              onClick={() => {
                if (brand.description === "" || brand.brandName === "") {
                  Swal.fire({
                    icon: "warning",
                    text: "빈문자열은 보낼수 없습니다.",
                  });
                  return;
                }
                axios
                  .post(
                    `${import.meta.env.VITE_BACKSERVER}/master/createAdmin?`,
                    brand,
                  )
                  .then((res) => {
                    if (res.data === 1) {
                      Swal.fire({
                        icon: "success",
                        text: "등록 성공",
                        confirmButtonText: "완료",
                      });
                      setBrand({ brandName: "", description: "" });
                      setSend(!send);
                    }
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }}
            >
              등록
            </button>

            <div className={styles.createBrand_list_wrap}>
              <div className={styles.createBrand_list_head}>
                <div>브랜드 이름</div>
                <div>설명</div>
                <div>메뉴 수</div>
                <div>관리</div>
              </div>

              <div className={styles.createBrand_list_body}>
                {brandList.map((brand, index) => {
                  return (
                    <div className={styles.createBrand_list_row} key={index}>
                      <div>{brand.brandName}</div>
                      <div>{brand.description}</div>
                      <div>{brand.itemCount}</div>
                      <button
                        className={styles.createBrand_delete}
                        onClick={() => {
                          changeDescription(brand);
                        }}
                      >
                        설명 수정
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};
export default CreateBrand;
