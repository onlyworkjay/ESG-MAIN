import axios from "axios";
import { useState } from "react";
import Swal from "sweetalert2";
import useAuthStore from "../../authstore/useAuthStore";
import styles from "./MasterCmp.module.css";

/** Master > "관리자 생성" 메뉴 화면 */
const CreateAdmin = () => {
  const [idMsg, setIdMsg] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [idCheckPassed, setIdCheckPassed] = useState(null);
  const [masterPw, setMasterPw] = useState("");
  const [masterPwSuccess, setMasterPwSuccess] = useState(false);
  const [nicknameCheck, setNicknameCheck] = useState(null);
  const [emailCheck, setEmailCheck] = useState(null);
  const [adminInfo, setAdminInfo] = useState({
    loginId: "",
    password: "",
    nickname: "",
    email: "",
  });
  const { loginId } = useAuthStore();
  const [doubleCheckPw, setDoubleCheckPw] = useState("");

  const validatePw = (pw) => {
    const englishCount = (pw.match(/[a-zA-Z]/g) || []).length;
    const numberCount = (pw.match(/[0-9]/g) || []).length;

    if (pw.length === 0) return "";

    if (pw.length < 6) {
      return "비밀번호는 6자 이상 입력해야 합니다.";
    }

    if (!/^[a-zA-Z0-9]*$/.test(pw)) {
      return "비밀번호는 영문과 숫자만 사용가능합니다.";
    }

    if (englishCount < 1 || numberCount < 1) {
      return "비밀번호는 영문과 숫자를 모두 포함해야 합니다.";
    }

    return "";
  };
  const validateId = (id) => {
    if (id.length === 0) return "";
    if (id.length < 4) return "4자 이상 입력해야 합니다.";
    if (id.length > 8) return "아이디의 길이는 8자 이하만 가능합니다.";
    if (!/^[a-zA-Z0-9]*$/.test(id)) {
      return "아이디는 영문 and 숫자만 사용가능해요.";
    }

    const englishCount = (id.match(/[a-zA-Z]/g) || []).length;
    const numberCount = (id.match(/[0-9]/g) || []).length;

    if (englishCount < 2 || numberCount < 2) {
      return "아이디는 영문 2개 이상, 숫자 2개 이상 포함해야 합니다.";
    }

    return "";
  };
  const createAdmin = async (e) => {
    e.preventDefault();
    if (adminInfo.loginId === "") {
      setIdMsg("아이디가 비어있습니다.");
      return;
    }
    if (!idCheckPassed) {
      setIdMsg("중복검증을 하시오");
      return;
    }
    if (adminInfo.password === "") {
      setPwMsg("비밀번호가 비어있습니다.");
      return;
    }
    if (adminInfo.password !== doubleCheckPw) {
      setPwMsg("비밀번호 확인 부분을 이행하시오");
      return;
    }
    const idError = validateId(adminInfo.loginId);
    if (idError !== "") {
      setIdMsg(idError);
      return;
    }
    const pwError = validatePw(adminInfo.password);
    if (pwError !== "") {
      setPwMsg(pwError);
      return;
    }
    if (adminInfo.nickname === "") {
      Swal.fire({
        icon: "warning",
        title: "nickname error",
        text: "닉네임은 필수로 등록 받아야 합니다.",
      });
      return;
    }
    if (nicknameCheck === null || !nicknameCheck) {
      Swal.fire({
        icon: "error",
        text: "닉네임 중복 체크를 진행하세요",
      });
      return;
    }
    if (adminInfo.email === "") {
      const emailResult = await Swal.fire({
        icon: "question",
        title: "이메일없음",
        text: "이메일을 입력하지 않있습니다.계속 진행할까요?",
        showCancelButton: true,
        cancelButtonText: "돌아가기",
        confirmButtonText: "계속하기",
      });
      if (!emailResult.isConfirmed) {
        return;
      }
    }
    if (adminInfo.email !== "" && adminInfo.email !== null) {
      if (emailCheck === null) {
        Swal.fire({
          icon: "error",
          text: "이메일 중복체크를 진행해주세요",
        });
        return;
      }

      if (emailCheck === false) {
        Swal.fire({
          icon: "error",
          text: "이미 사용중인 이메일입니다.",
        });
        return;
      }
    }
    if (!masterPwSuccess) {
      Swal.fire({
        icon: "error",
        text: "비밀번호 인증 미통과",
      });
      return;
    }
    Swal.fire({
      text: "관리자를 등록하시겠습니까?",
      icon: "question",
      showCancelButton: true,
      cancelButtonText: "취소",
      confirmButtonText: "계속",
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          loginId: adminInfo.loginId.trim(),
          password: adminInfo.password,
          nickname: adminInfo.nickname.trim(),
          email: adminInfo.email.trim() === "" ? null : adminInfo.email.trim(),
        };
        axios
          .post(
            `${import.meta.env.VITE_BACKSERVER}/master/insertAdmin`,
            payload,
          )
          .then((res) => {
            if (res.data === 1) {
              Swal.fire({
                icon: "success",
                text: "관리자 생성 성공",
              });
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  };
  return (
    <div className={styles.createAdmin_wrap}>
      <h2>관리자 생성</h2>
      <form className={styles.createAdmin_form} onSubmit={createAdmin}>
        <div>
          <label id="adminId">아이디</label>
          <input
            id="adminId"
            name="loginId"
            value={adminInfo.loginId}
            onChange={(e) => {
              const currentVal = e.target.value;
              setAdminInfo({ ...adminInfo, [e.target.name]: currentVal });
              setIdCheckPassed(null);
              setIdMsg(validateId(currentVal));
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (adminInfo.loginId === "") {
                return;
              }
              const idError = validateId(adminInfo.loginId);

              if (idError !== "") {
                setIdMsg(idError);
                return;
              }
              axios
                .get(
                  `${import.meta.env.VITE_BACKSERVER}/master/checkId?loginId=${adminInfo.loginId}`,
                )
                .then((res) => {
                  console.log(res.data);
                  setIdCheckPassed(res.data);
                })
                .catch((err) => {
                  console.log(err);
                });
            }}
          >
            아이디중복체크
          </button>
          <p>
            {idCheckPassed === null
              ? ""
              : idCheckPassed
                ? "중복체크 완료"
                : "중복된 아이디 존재"}
          </p>
          {/**추후 해결 필요 */}
        </div>
        <div>{idMsg !== "" ? <p>{idMsg}</p> : ""}</div>
        {/**평소에는 흐림 처리(opacity:0),height 25px */}
        <label id="adminPassword">비밀번호</label>
        <input
          type="password"
          id="adminPassWord"
          name="password"
          value={adminInfo.password}
          onChange={(e) => {
            const currentVal = e.target.value;
            setAdminInfo({ ...adminInfo, [e.target.name]: currentVal });
            setPwMsg(validatePw(currentVal));
            if (currentVal === "") {
              setDoubleCheckPw("");
            }
          }}
        />
        <div>{pwMsg !== "" ? <p>{pwMsg}</p> : ""}</div>
        {/**평소에는 흐림 처리 opacitu:0*height 25px */}
        <label id="doubleCheckPw">비밀번호 확인</label>
        <input
          disabled={adminInfo.password === "" ? true : false}
          type="password"
          id="doubleCheckPw"
          value={doubleCheckPw}
          onChange={(e) => {
            setDoubleCheckPw(e.target.value);
          }}
        />
        <div
          className={
            adminInfo.password === doubleCheckPw
              ? styles.correct_pw
              : styles.wrong_pw
          }
        >
          {adminInfo.password === ""
            ? ""
            : adminInfo.password === doubleCheckPw
              ? "비밀번호 일치"
              : "비밀번호 불일치"}
        </div>
        <div>
          <label id="adminNickName">별명</label>
          <input
            id="adminNickName"
            name="nickname"
            onChange={(e) => {
              setAdminInfo({ ...adminInfo, [e.target.name]: e.target.value });
              setNicknameCheck(null);
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              // e.preventDefault();
              if (adminInfo.nickname === "") {
                alert("별명을 입력해 주세요");
                return;
              }
              axios
                .post(
                  `${import.meta.env.VITE_BACKSERVER}/master/nicknameDupCheck?nickname=${adminInfo.nickname}`,
                )
                .then((res) => {
                  setNicknameCheck(res.data);
                })
                .catch((err) => {
                  console.log(err);
                });
            }}
          >
            별명중복확인
          </button>
          <p>
            {nicknameCheck === null
              ? ""
              : nicknameCheck
                ? "중복체크 완료"
                : "중복 별명 존재"}
          </p>
        </div>
        <div>
          <label id="adminEmail">이메일</label>
          <input
            id="adminEmail"
            name="email"
            onChange={(e) => {
              setAdminInfo({ ...adminInfo, [e.target.name]: e.target.value });
              setEmailCheck(null);
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              // e.preventDefault();
              if (adminInfo.email === "") {
                alert("이메일을 입력해 주세요");
                return;
              }
              axios
                .post(
                  `${import.meta.env.VITE_BACKSERVER}/master/emailDupCheck?email=${adminInfo.email}`,
                )
                .then((res) => {
                  setEmailCheck(res.data);
                })
                .catch((err) => {
                  console.log(err);
                });
            }}
          >
            이메일중복확인
          </button>
          <p>
            {emailCheck === null
              ? ""
              : emailCheck
                ? "중복체크 완료"
                : "중복이메일 존재"}
          </p>
        </div>
        <div>
          <label id="masterPw">현재 암호 확인</label>
          <input
            type="password"
            id="masterPw"
            value={masterPw}
            onChange={(e) => {
              setMasterPw(e.target.value);
              setMasterPwSuccess(false);
            }}
          ></input>
          <button
            type="button"
            onClick={(e) => {
              axios
                .post(
                  `${import.meta.env.VITE_BACKSERVER}/master/youHadMeAtHello/${loginId}`,
                  masterPw,
                  {
                    headers: {
                      "Content-Type": "text/plain",
                    },
                  },
                )

                .then((res) => {
                  console.log(res.data);
                  setMasterPwSuccess(res.data);
                  if (res.data) {
                    Swal.fire({
                      icon: "success",
                      text: "비밀번호 확인 성공",
                    });
                  } else {
                    Swal.fire({
                      icon: "error",
                      text: "비밀번호 검증 실패",
                    });
                  }
                })
                .catch((err) => {
                  console.log(err);
                });
            }}
          >
            암호 확인
          </button>
        </div>
        <button type="submit">관리자 등록</button>
      </form>
    </div>
  );
};
export default CreateAdmin;
