import { useNavigate } from "react-router-dom";
import useAuthStore from "../authstore/useAuthStore";
import PostFrm from "../components/post/PostFrm";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import checkImage from "../assets/check.png";
import infoImage from "../assets/info.png";
import questionImage from "../assets/question.png";
import warningImage from "../assets/warning.png";
import successImage from "../assets/success.png";
import { toast } from "react-hot-toast";
import axios from "axios";
import styles from "./PostWritePage.module.css";
import EditIcon from "@mui/icons-material/Edit";

//게시글 작성 페이지 담당자:한진호
const PostWritePage = () => {
  const navigate = useNavigate();
  const { userId, isReady, token, role } = useAuthStore();

  const [post, setPost] = useState({
    title: "",
    content: "",
    isNotice: 0,
  });
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (!userId) {
      Swal.fire({
        title: "로그인필요",
        text: "글 작성시 로그인이 필요합니다.",
        imageUrl: questionImage,
        imageWidth: 120, // 이미지 가로 크기 (픽셀 단위)
        imageHeight: 120, // 이미지 세로 크기 (픽셀 단위)
        imageAlt: "물음표 아이콘", //웹접근성을 위한 alt 텍스트
        confirmButtonText: "확인",
        confirmButtonColor: "var(--bun)",
        background: "var(--patty)",
        color: "var(--ivory)",
      }).then(() => {
        navigate(-1);
      });

      return;
    }
  }, [userId]);

  if (!userId) {
    return (
      //화면가림
      <div className={styles.authGuard}></div>
    );
  }
  /* 글 등록 함수 */
  const registPost = () => {
    if (post.title === "") {
      toast.dismiss();
      toast("제목이 비어있어요.", {
        duration: 2000, // 2초 동안 노출
        position: "bottom-center", // 상단 중앙 배치
        style: {
          border: "1px solid var(--bun)",
          padding: "12px 16px",
          background: "var(--patty)",
          color: "var(--ivory)",
          borderRadius: "8px",
        },
      });
      return;
    }
    if (post.content === "") {
      toast.dismiss();
      toast("내용이 비어있어요.", {
        duration: 2000, // 2초 동안 노출
        position: "bottom-center", // 상단 중앙 배치
        style: {
          border: "1px solid var(--bun)",
          padding: "12px 16px",
          background: "var(--patty)",
          color: "var(--ivory)",
          borderRadius: "8px",
        },
      });
      return;
    }

    const form = new FormData();
    form.append("title", post.title);
    form.append("content", post.content);
    form.append("isNotice", post.isNotice);

    files.forEach((file) => {
      form.append("files", file);
    });

    /* 폼데이터 확인용
    
    for (let pair of form.entries()) {
      console.log(pair[0], pair[1]);
    }
    */
    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/posts`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        if (res.data.result === true) {
          Swal.fire({
            title: "작성완료",
            text: "글작성이 완료되었어요.",
            imageUrl: successImage,
            imageWidth: 120, // 이미지 가로 크기 (픽셀 단위)
            imageHeight: 120, // 이미지 세로 크기 (픽셀 단위)
            imageAlt: "글작성완료 아이콘", //웹접근성을 위한 alt 텍스트
            confirmButtonText: "작성한 글 보기",
            confirmButtonColor: "var(--bun)",
            background: "var(--patty)",
            color: "var(--ivory)",
          }).then(() => {
            navigate(`/esg/post/view/${res.data.data}`);
          });
        } else {
          Swal.fire({
            title: "오류발생",
            text: `${res.data.message}`,
            imageUrl: warningImage,
            imageWidth: 120, // 이미지 가로 크기 (픽셀 단위)
            imageHeight: 120, // 이미지 세로 크기 (픽셀 단위)
            imageAlt: "글작성오류 아이콘", //웹접근성을 위한 alt 텍스트
            confirmButtonText: "확인",
            confirmButtonColor: "var(--bun)",
            background: "var(--patty)",
            color: "var(--ivory)",
          }).then(() => {});
        }
      })
      .catch((err) => {
        console.error(err.message);
      });
  };
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span>Community Board</span>
        <h1>글 작성</h1>
        <p>메뉴 추천과 이용 경험을 게시판에 공유해보세요.</p>
      </section>

      <section className={styles.formPanel}>
        <PostFrm
          post={post}
          setPost={setPost}
          files={files}
          setFiles={setFiles}
        />
        <div className={styles.actionBar}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => navigate("/esg/post")}
          >
            취소
          </button>
          <button
            type="button"
            className={styles.submitButton}
            onClick={registPost}
          >
            <EditIcon className={styles.buttonIcon} />
            작성하기
          </button>
        </div>
      </section>
    </main>
  );
};

export default PostWritePage;
