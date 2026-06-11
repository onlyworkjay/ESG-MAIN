import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

import { Bar, Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import styles from "./AdminInsertMenue.module.css";
import axios from "axios";
import defaultImg from "../../assets/default_image.png";
import Swal from "sweetalert2";
import useAuthStore from "../../authstore/useAuthStore";
import { NavLink } from "react-router-dom";

const AdminInsertMenue = () => {
  const [itsFile, setItsFile] = useState(null);
  const [pickImg, setPickImg] = useState(false);
  const [imageUrl, setImageUrl] = useState();
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
  const [count, setCount] = useState(false);
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const admin = "admin1";
  const { loginId, userId } = useAuthStore();
  const [menueInfo, setMenueInfo] = useState({
    categoryId: 1,
    brandId: 0,
    name: "",
    description: "",
    status: "active",
    price: "", //vo가 integer처리라 어차피  바뀌어서 ""빈문자열로 처리
    weight: "",
    kcal: "",
    protein: "",
    sodium: "",
    sugar: "",
    saturatedFat: "",
    caffeine: "",
    informerUserId: userId,
  }); //보내기 전에 검사할 목록
  const requiredFields = [
    "brandId",
    "name",
    "description",
    "price",
    "weight",
    "kcal",
    "protein",
    "sodium",
    "sugar",
    "saturatedFat", // "caffeine",
    "informerUserId",
  ];
  const handleNumberChange = (e) => {
    //이게 숫자 입력 칸 숫자만 들어가게 막아주는 로직(onchange안에 넣어서 e.target 작업도 처리)
    const { name, value } = e.target; //const name = e.target.name;
    // const value = e.target.value;(구조 분해 할당)
    if (!/^\d*$/.test(value)) {
      //정규표현식(공부 더 필요)
      return;
    }

    setMenueInfo({
      //(onchange 안에서 하던 작업)
      ...menueInfo,
      [name]: value,
    });
  };
  const [allergyList, setAllergyList] = useState([]);
  const [brandList, setBrandList] = useState([]);
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/admin/getBrand`)
      .then((res) => {
        console.log(res.data);
        setBrandList([...res.data]);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/admin/getAllergy`)
      .then((res) => {
        setAllergyList([...res.data]);
        setCount(true);
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    count && (
      <div className={styles.menue_wrap}>
        {/* <h2>메뉴등록</h2> */}

        <div className={styles.menue_category}>
          <h4>품목</h4>
          <select
            name="categoryId"
            value={menueInfo.categoryId}
            onChange={(e) => {
              setMenueInfo({
                ...menueInfo,
                [e.target.name]: Number(e.target.value),
              });
            }}
          >
            <option value={1}>버거</option>
            {/* <option value={2}>치킨</option>
            <option value={3}>피자</option> */}
          </select>

          <select
            name="brandId"
            value={menueInfo.brandId}
            onChange={(e) => {
              setMenueInfo({
                ...menueInfo,
                [e.target.name]: Number(e.target.value),
              });
            }}
          >
            {brandList.map((brand, index) => {
              return (
                <option value={brand.brandId} key={brand.brandName}>
                  {brand.brandName}
                </option>
              );
            })}
          </select>
        </div>

        <div className={styles.other_information}>
          <label htmlFor="name">상품이름</label>
          <input
            placeholder="이름"
            id="name"
            name="name"
            value={menueInfo.name}
            onChange={(e) => {
              setMenueInfo({ ...menueInfo, [e.target.name]: e.target.value });
            }}
          />

          <label htmlFor="explanation">상품설명</label>
          <textarea
            id="explanation"
            name="description"
            value={menueInfo.description}
            onChange={(e) => {
              // console.log(allergyList);
              setMenueInfo({ ...menueInfo, [e.target.name]: e.target.value });
            }}
          />

          <label htmlFor="price">상품가격</label>
          <input // type="number"
            // min="0"
            // step="1" //min이나 step 은 각각 음수 불가,정수단위라는 힌트 제공용 설정
            placeholder="단위: 원(숫자만)"
            id="price"
            name="price"
            value={menueInfo.price}
            onChange={handleNumberChange}
          />

          <label htmlFor="weight">상품중량</label>
          <input
            placeholder="단위: 고체-> gram, 액체->ml(숫자만)"
            id="weight"
            name="weight"
            value={menueInfo.weight}
            onChange={handleNumberChange}
          />

          <label htmlFor="kcal">상품열량</label>
          <input
            placeholder="단위: kcal(숫자만)"
            id="kcal"
            name="kcal"
            value={menueInfo.kcal}
            onChange={handleNumberChange}
          />

          <label htmlFor="protein">상품단백질</label>
          <input
            placeholder="단위: gram(숫자만)"
            id="protein"
            name="protein"
            value={menueInfo.protein}
            onChange={handleNumberChange}
          />

          <label htmlFor="natrium">나트륨</label>
          <input
            placeholder="단위: milligram(숫자만)"
            id="natrium"
            name="sodium"
            value={menueInfo.sodium}
            onChange={handleNumberChange}
          />

          <label htmlFor="sugar">당</label>
          <input
            placeholder="단위: gram(숫자만)"
            id="sugar"
            name="sugar"
            value={menueInfo.sugar}
            onChange={handleNumberChange}
          />

          <label htmlFor="fat">포화지방</label>
          <input
            placeholder="단위: gram(숫자만)"
            id="fat"
            name="saturatedFat"
            value={menueInfo.saturatedFat}
            onChange={handleNumberChange}
          />

          <label htmlFor="caffeine">카페인</label>
          <input
            placeholder="단위: gram(숫자만)"
            id="caffeine"
            name="caffeine"
            value={menueInfo.caffeine}
            onChange={handleNumberChange}
          />
        </div>

        <div>
          <label htmlFor="allergy">알러지</label>
          <Autocomplete
            disablePortal // PopperProps={{
            //   placement: "bottom-start",
            //   modifiers: [
            //     {
            //       name: "flip",
            //       enabled: false, // :star: 이게 핵심
            //     }
            //   ],
            // }}
            id="allergy"
            multiple //여러 값 저장
            // id="multiple-limit-tags"
            options={allergyList} //뽑아올 옵션
            getOptionLabel={(option) => option.name} //옵션이름
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
            value={selectedAllergies} //입력되는 값을 원하면 TextField에 넣어야 함(여긴 선택된 값의 배열)
            onChange={(event, newValue) => {
              setSelectedAllergies(newValue);
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
              width: "860px",
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
              //            input의 색상을 일부 변경하는 것
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

        <div>
          <input
            type="file"
            accept=".jpg,.png" //jpg,png만 받겠다는 것.다만 이상하게 우회 가능해서 back도 한번 더 처리
            onChange={handleFileChange}
          />
        </div>

        <div className={styles.insert_menue_img}>
          <img src={pickImg ? imageUrl : defaultImg} alt="Menu" />
        </div>

        <button
          className={styles.insert_menue_button}
          onClick={() => {
            if (!itsFile) {
              alert("파일을 선택해주세요.");
              return;
            } //0,비어있는 값 등을 검사(최신 값 기준의 검사를 위해 onClick안에 넣음)
            const hasEmpty = requiredFields.some((key) => {
              //.some()조건을 만족하는 게 하나라도 있으면 true
              const value = menueInfo[key];
              return value === "" || value === null || value === 0;
            });
            if (selectedAllergies.length === 0) {
              //일단 알러지 설정 필수로 짜 놓음(추후에 시간 있을시 변경예정)
              alert("알러지 정보를 선택해주세요.");
              return;
            }
            if (hasEmpty) {
              alert("입력 내용이 불완전합니다. 다시 확인해주세요");
              return;
            }
            const data = new FormData();
            data.append("file", itsFile);
            data.append("allergies", JSON.stringify(selectedAllergies));
            data.append("menueInfo", JSON.stringify(menueInfo));
            Swal.fire({
              icon: "question",
              text: "메뉴를 등록하시겠습니까?",
              showCancelButton: true,
              cancelButtonText: "아니요",
              showConfirmButton: true,
              confirmButtonText: "등록하기",
            }).then((result) => {
              if (result.isConfirmed) {
                axios
                  .post(
                    `${import.meta.env.VITE_BACKSERVER}/admin/insertMenue`,
                    data, // headers: {
                    //   "Content-Type": "multipart/form-data",
                    // }
                    // Axios가 FormData를 보면 자동으로 multipart/form-data; boundary=...를 붙여줍니다. 직접 넣으면 boundary가 빠져서 백엔드에서 파일을 못 읽는 경우가 있습니다.
                  )
                  .then((res) => {
                    console.log(res.data);
                    if (res.data === 1) {
                      Swal.fire({
                        icon: "success",
                        title: "메뉴등록 성공",
                        text: "메뉴가 등록되었습니다.",
                      });
                      setMenueInfo({
                        categoryId: 1,
                        brandId: 0,
                        name: "",
                        description: "",
                        status: "active",
                        price: "",
                        weight: "",
                        kcal: "",
                        protein: "",
                        sodium: "",
                        sugar: "",
                        saturatedFat: "",
                        caffeine: "",
                        informerUserId: userId,
                      });

                      setSelectedAllergies([]);
                      setItsFile(null); //input 옆의 파일명은 나중에 처리하겠습니다...

                      if (imageUrl) {
                        URL.revokeObjectURL(imageUrl);
                      }

                      setImageUrl(null);
                      setPickImg(false);
                    }
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }
            });
          }}
        >
          메뉴 등록
        </button>
      </div>
    )
  );
};

export default AdminInsertMenue;
