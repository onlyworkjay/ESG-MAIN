import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./AdminMenueDetail.module.css";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import defaultImg from "../../assets/default_image.png";
import useAuthStore from "../../authstore/useAuthStore";
import Swal from "sweetalert2";

const AdminMenueDetail = () => {
  const { userId } = useAuthStore();
  const navigate = useNavigate();
  const { productId } = useParams();
  const [menueDetail, setMenueDetail] = useState();
  const [menueInfo, setMenueInfo] = useState();
  const [updateInfo, setUpdateInfo] = useState(true);
  const [inputMenue, setInputMenue] = useState();
  const [itsFile, setItsFile] = useState(null);
  const [pickImg, setPickImg] = useState(false);
  const [imageUrl, setImageUrl] = useState();
  const [fixPage, setFixPage] = useState(true);
  const requiredFields = [
    // "brandId",
    // "name",
    "description",
    "price",
    "weight",
    "kcal",
    "protein",
    "sodium",
    "sugar",
    "saturatedFat",
    // "caffeine",
    "informerUserId",
  ];
  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/admin/getMenueDetail?productId=${productId}`,
      )
      .then((res) => {
        console.log(res.data);
        setMenueInfo({ ...res.data });
        setMenueDetail({ ...res.data });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [fixPage]);
  const [brandList, setBrandList] = useState();
  // useEffect(() => {
  //   axios
  //     .get(`${import.meta.env.VITE_BACKSERVER}/admin/getBrand`)
  //     .then((res) => {
  //       console.log(res.data);
  //       setBrandList([...res.data]);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // }, []);

  const [allergyList, setAllergyList] = useState();
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/admin/getAllergy`)
      .then((res) => {
        setAllergyList([...res.data]);

        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  const handleFileChange = (e) => {
    if (!e.target.files[0]) {
      return;
    } //파일 선택창 열고 그냥 닫았을때 예외처리
    setItsFile(e.target.files[0]);
    setPickImg(true);
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl); //그거 삭제 시키는 로직(아예 없앰)(없애지 않으면 계속 url이 저장되어 있음)
    }
    setImageUrl(URL.createObjectURL(e.target.files[0])); //임시로 URL가져와서 이미지나 파일 띄울수 있는 로직
  };
  const handleNumberChange = (e) => {
    //이게 숫자 입력 칸 숫자만 들어가게 막아주는 로직(onchange안에 넣어서 e.target 작업도 처리)
    const { name, value } = e.target;
    //const name = e.target.name;
    // const value = e.target.value;(구조 분해 할당)
    if (!/^\d*$/.test(value)) {
      //정규표현식(공부 더 필요)
      return;
    }

    setMenueDetail({
      //(onchange 안에서 하던 작업)
      ...menueDetail,
      [name]: value,
    });
  };
  return (
    menueDetail &&
    allergyList && (
      <div className={styles.admin_menue_detail_wrap}>
        <div className={styles.admin_menue_detail_title}>
          <h2
            className={styles.admin_menue_detail_wrap_h2}
            onClick={() => {
              navigate("/adminpage/menue/list");
            }}
          >
            돌아가기
          </h2>
          <h3>메뉴 수정하기</h3>
        </div>
        <div className={styles.admin_menue_detail_content}>
          {/* product_id,brandId, createdAt,updatedAt,informer_user_id 제외 */}
          <div>
            <label htmlFor="itemName">메뉴명</label>
            <input
              readOnly
              name="name"
              placeholder={menueDetail.name}
              id="itemName"
              // onChange={(e) => {
              //   setMenueDetail({
              //     ...menueDetail,
              //     [e.target.name]: e.target.value,
              //   });
              // }}
            ></input>
            <label htmlFor="itemExp">메뉴설명</label>
            <textarea
              disabled={updateInfo}
              id="itemExp"
              name="description"
              value={menueDetail.description}
              onChange={(e) => {
                setMenueDetail({
                  ...menueDetail,
                  [e.target.name]: e.target.value,
                });
              }}
            ></textarea>
            {/*resize:none */}
          </div>

          <label>상태</label>
          {/* <select
            disabled={updateInfo}
            value={menueDetail.brandId}
            onChange={(e) => {
              setMenueDetail({ ...menueDetail, brandId: e.target.value });
            }}
          >
            {brandList.map((brand, index) => {
              return (
                <option key={brand.brandName} value={brand.brandId}>
                  {brand.brandName}
                </option>
              );
            })}
          </select> */}
          <select
            disabled={updateInfo}
            value={menueDetail.status}
            onChange={(e) => {
              setMenueDetail({ ...menueDetail, status: e.target.value });
            }}
          >
            <option value={"hidden"}>숨김</option>
            <option value={"discontinued"}>단종</option>
            <option value={"active"}>판매중</option>
          </select>
          <label htmlFor="price">가격</label>
          <input
            disabled={updateInfo}
            name="price"
            id="price"
            value={menueDetail.price}
            onChange={handleNumberChange}
          ></input>
          <label htmlFor="weight">중량</label>
          <input
            disabled={updateInfo}
            name="weight"
            id="weight"
            value={menueDetail.weight}
            onChange={handleNumberChange}
          ></input>
          <label htmlFor="kcal">칼로리</label>
          <input
            disabled={updateInfo}
            name="kcal"
            id="kcal"
            value={menueDetail.kcal}
            onChange={handleNumberChange}
          ></input>
          <label htmlFor="protein">단백질</label>
          <input
            disabled={updateInfo}
            name="protein"
            id="protein"
            value={menueDetail.protein}
            onChange={handleNumberChange}
          ></input>
          <label htmlFor="natrium">나트륨</label>
          <input
            disabled={updateInfo}
            name="sodium"
            id="natrium"
            value={menueDetail.sodium}
            onChange={handleNumberChange}
          ></input>
          <label htmlFor="sugar">당</label>
          <input
            disabled={updateInfo}
            name="sugar"
            id="sugar"
            value={menueDetail.sugar}
            onChange={handleNumberChange}
          ></input>
          <label htmlFor="saturate">포화지방</label>
          <input
            disabled={updateInfo}
            id="saturate"
            name="saturatedFat"
            value={menueDetail.saturatedFat}
            onChange={handleNumberChange}
          ></input>
          <label htmlFor="caffeine">카페인</label>
          <input
            disabled={updateInfo}
            id="caffeine"
            name="caffeine"
            value={menueDetail.caffeine}
            onChange={handleNumberChange}
          ></input>
        </div>
        <div className={styles.admin_menue_detail_allergy}>
          <Autocomplete
            disabled={updateInfo}
            disablePortal
            // PopperProps={{
            //   placement: "bottom-start",
            //   modifiers: [
            //     {
            //       name: "flip",
            //       enabled: false, // ⭐ 이게 핵심
            //     },
            //   ],
            // }}
            id="allergy"
            multiple //여러 값 저장
            // id="multiple-limit-tags"
            options={allergyList} //뽑아올 옵션
            getOptionLabel={(option) => option.allergyName || option.name || ""} //옵션이름(안쪽에 등록될 이름)
            // defaultValue={[top100Films[13], top100Films[12], top100Films[11]]}디폴트 값
            // getOptionDisabled={(option) =>
            //   allergyList.map((all) => {
            //     option === all.allergyName;-> 숨김 처리(밑값 때문에 안씀) 참고로 true false 반환 필요
            //   })
            // }
            isOptionEqualToValue={(option, value) =>
              option.allergyId === value.allergyId
            } //(옵션값,비교용 값 )=> 옵션과 비교항목이 같은지 비교
            // option과 value의 number가 같으면 같은 항목으로 판단함
            // filterSelectedOptions가 이 기준으로 이미 선택된 옵션을 목록에서 숨김
            value={
              // allergyList?.filter(
              //   (
              //     option, // ✅ allergyList 기준으로 필터
              //   ) =>
              //     menueDetail.allergies?.some(
              //       (a) => a.allergyId === option.allergyId,
              //     ),
              // ) ?? []
              menueDetail.allergies
            } //입력되는 값을 원하면 TextField에 넣어야 함(여긴 선택된 값의 배열)
            onChange={(event, newValue) => {
              //   const mapped = newValue.map((selected) => {
              //     // 기존에 있던 데이터 찾기
              //     const existing = menueDetail.allergies.find(
              //       (a) => a.allergyId === selected.allergyId,
              //     );

              //     if (existing) {
              //       // ✅ 기존 데이터 → product_allergy_id 유지
              //       return existing;
              //     } else {
              //       // ✅ 새로 선택된 데이터 → PK null
              //       return {
              //         productAllergyId: null,
              //         allergyId: selected.allergyId,
              //         allergyName: selected.name,
              //       };
              //     }
              //   });

              //   setMenueDetail({
              //     ...menueDetail,
              //     allergies: mapped,
              //   });
              setMenueDetail((prev) => {
                const mapped = newValue.map((selected) => {
                  const existing = prev.allergies?.find(
                    (a) => a.allergyId === selected.allergyId,
                  );

                  if (existing) {
                    return existing; // ✅ PK 유지
                  } else {
                    return {
                      productAllergyId: null,
                      allergyId: selected.allergyId,
                      allergyName: selected.name || selected.allergyName,
                    };
                  }
                });

                return {
                  ...prev,
                  allergies: mapped,
                };
              });
            }}
            filterSelectedOptions //선택된 내용의 옵션을 안보이게 처리
            renderInput={(params) => (
              <TextField
                {...params}
                label="Allergy"
                placeholder="Allergy name"
              /> //input이랑 비슷
            )}
            sx={{
              width: "800px",
              "& .MuiInputBase-root": {
                minHeight: "60px",
              },
              "& .MuiInputBase-input": {
                color: "var(--pickle)",
              },
              "& .MuiChip-root": {
                backgroundColor: "var(--patty)",
              },
              "& .MuiChip-label": {
                color: "var(--ivory)",
              },
              "& .MuiOutlinedInput-root": {
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--ivory)", // 기본
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--ivory)", // hover
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--pickle)", // focus
                },
              },
            }} //너비등의 설정(css)
          />
        </div>
        <div className={styles.admin_menue_detail_img}>
          <input
            disabled={updateInfo}
            type="file"
            accept=".jpg,.png" //jpg,png만 받겠다는 것.다만 이상하게 우회 가능해서 back도 한번 더 처리 />
            onChange={handleFileChange}
          />
          <img
            src={
              menueDetail.imageUrl === "default.png"
                ? defaultImg
                : imageUrl
                  ? imageUrl
                  : menueDetail.imageUrl
            }
            alt={`${menueDetail.name ?? "메뉴"} 이미지`}
          />
        </div>
        <div>
          <button
            onClick={() => {
              setUpdateInfo(false);
              console.log(menueDetail);
            }}
          >
            수정활성화(상태포함)
          </button>
          <button
            disabled={updateInfo ? true : false}
            onClick={() => {
              if (menueDetail.allergies.length === 0) {
                alert("일러지 정보를 선택해주세요");
                return;
              }
              const hasEmpty = requiredFields.some((key) => {
                //.some()조건을 만족하는 게 하나라도 있으면 true
                const value = menueDetail[key];
                return value === "" || value === null || value === 0;
              });
              if (hasEmpty) {
                alert("입력 내용이 불와전합니다.다시 확인해주세요");
                return;
              }
              const data = new FormData();
              if (itsFile) {
                data.append("file", itsFile);
              }
              data.append("menueDetail", JSON.stringify(menueDetail));
              Swal.fire({
                icon: "question",
                text: "메뉴를 수정하시겠습니까?",
                showCancelButton: true,
                cancelButtonText: "수정 취소",
                showConfirmButton: true,
                confirmButtonText: "등록하기",
              }).then((result) => {
                if (result.isConfirmed) {
                  axios
                    .patch(
                      `${import.meta.env.VITE_BACKSERVER}/admin/updateMenue`,
                      data,
                    )
                    .then((res) => {
                      console.log(res.data);
                      if (res.data === 1) {
                        setUpdateInfo(true);
                        setFixPage(!fixPage);
                        if (imageUrl) {
                          URL.revokeObjectURL(imageUrl);
                        }
                        Swal.fire({
                          icon: "success",
                          title: "수정성공",
                        });
                      } else {
                        Swal.fire({
                          icon: "error",
                          title: "수정실패",
                          text: "예기치 못한 문제 발생",
                        });
                      }
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                }
              });

              console.log(menueDetail);
            }}
          >
            수정확인
          </button>
          <button
            disabled={updateInfo ? true : false}
            onClick={() => {
              Swal.fire({
                icon: "question",
                text: "정말로 수정을 취소하시겠습니까?",
                showCancelButton: true,
                cancelButtonText: "계속수정",
                confirmButtonText: "원본복귀",
              }).then((result) => {
                if (result.isConfirmed) {
                  setUpdateInfo(true);
                  setMenueDetail({ ...menueInfo });
                  setItsFile(null);
                  if (imageUrl) {
                    URL.revokeObjectURL(imageUrl);
                  }
                  setImageUrl(null);
                }
              });
            }}
          >
            수정취소
          </button>
        </div>
      </div>
    )
  );
};
export default AdminMenueDetail;
