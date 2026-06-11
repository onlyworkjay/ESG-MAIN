import { useNavigate, useParams } from "react-router-dom";
import useAuthStore from "../authstore/useAuthStore";
import ComposeFrm from "../components/compose/ComposeFrm";
import styles from "./GramModifyPage.module.css";
import Swal from "sweetalert2";
import axios from "axios";
import { useEffect, useState } from "react";
import warningImage from "../assets/warning.png";
import successImage from "../assets/success.png";

const GramModifyPage = () => {
  const navigate = useNavigate();
  const { userId } = useAuthStore();
  const { gramNo } = useParams();

  const [compose, setCompose] = useState(null);
  const [files, setFiles] = useState([]);
  const [deleteFileList, setDeleteFileList] = useState([]);

  useEffect(() => {
    if (!userId) {
      Swal.fire({
        title: "로그인 필요",
        text: "글 수정 시 로그인이 필요합니다.",
        imageUrl: warningImage,
        imageWidth: 120,
        imageHeight: 120,
        imageAlt: "물음표 아이콘",
        confirmButtonText: "확인",
        confirmButtonColor: "var(--bun)",
        background: "var(--patty)",
        color: "var(--ivory)",
      }).then(() => {
        navigate(-1);
      });
      return;
    }

    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/grams/${gramNo}`)
      .then((res) => {
        setCompose({
          title: res.data.title,
          content: res.data.content,
          s3keys: res.data.images ?? [],
        });
      })
      .catch((err) => {
        console.error(err);
        navigate("/404");
      });
  }, [userId, gramNo]);

  if (!userId) {
    return (
      <div style={{ backgroundColor: "var(--ivory)", height: "100vh" }}></div>
    );
  }

  const modifyCompose = () => {
    if (compose.title === "" || compose.content === "") {
      Swal.fire({
        text: "제목이랑 내용이 있어야 수정 가능합니다.",
        imageUrl: warningImage,
        imageWidth: 120,
        imageHeight: 120,
        imageAlt: "경고 아이콘",
        confirmButtonText: "확인",
        confirmButtonColor: "var(--bun)",
        background: "var(--patty)",
        color: "var(--ivory)",
      });
      return;
    }

    const form = new FormData();
    form.append("title", compose.title);
    form.append("content", compose.content);

    files.forEach((file) => {
      form.append("files", file);
    });

    deleteFileList.forEach((s3Key) => {
      form.append("deleteS3Keys", s3Key);
    });

    axios
      .put(`${import.meta.env.VITE_BACKSERVER}/grams/${gramNo}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        Swal.fire({
          title: "수정 완료!",
          text: "글 수정이 완료되었어요.",
          imageUrl: successImage,
          imageWidth: 120,
          imageHeight: 120,
          imageAlt: "글 수정 완료 아이콘",
          confirmButtonText: "수정한 글 보기",
          confirmButtonColor: "var(--bun)",
          background: "var(--patty)",
          color: "var(--ivory)",
        }).then(() => {
          navigate(`/esg/gram/view/${gramNo}`, { replace: true });
        });
      })
      .catch((err) => {
        const errorMessage =
          err.response?.data?.message ||
          "서버 통신 중 알 수 없는 오류가 발생했습니다.";
        Swal.fire({
          title: "오류발생",
          text: errorMessage,
          imageUrl: warningImage,
          imageWidth: 120,
          imageHeight: 120,
          imageAlt: "글수정 오류 아이콘",
          confirmButtonText: "확인",
          confirmButtonColor: "var(--bun)",
          background: "var(--patty)",
          color: "var(--ivory)",
        });
      });
  };

  if (!compose) {
    return (
      <div className={styles.loading_wrap}>
        <p>기존 게시글 데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.page_title}>후기 수정</h2>

      <ComposeFrm
        compose={compose}
        setCompose={setCompose}
        files={files}
        setFiles={setFiles}
        deleteFileList={deleteFileList}
        setDeleteFileList={setDeleteFileList}
      />

      {/* 버튼 - ComposeFrm 아래 중앙 배치 */}
      <div className={styles.btn_wrap}>
        <button className={styles.btn_submit} onClick={modifyCompose}>
          수정하기
        </button>
        <button className={styles.btn_cancel} onClick={() => navigate(-1)}>
          취소하기
        </button>
      </div>
    </div>
  );
};

export default GramModifyPage;
