import { useNavigate, useParams } from "react-router-dom";
import useAuthStore from "../authstore/useAuthStore";
import PostFrm from "../components/post/PostFrm";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import checkImage from "../assets/check.png";
import infoImage from "../assets/info.png";
import questionImage from "../assets/question.png";
import warningImage from "../assets/warning.png";
import successImage from "../assets/success.png";
import axios from "axios";

//게시글 수정 페이지 담당자:한진호
const PostModifyPage = () => {
  const navigate = useNavigate();
  const { userId, isReady, token } = useAuthStore();
  const { postId } = useParams();

  const [post, setPost] = useState(null);
  const [files, setFiles] = useState([]);
  const [deleteFileList, setDeleteFileList] = useState([]);

  useEffect(() => {
    // 로그인 여부 체크
    if (!userId) {
      Swal.fire({
        title: "로그인필요",
        text: "글 수정시 로그인이 필요합니다.",
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

    // 기존 게시글 및 파일 목록 조회
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/posts/${postId}`)
      .then((res) => {
        if (res.data.result === true) {
          setPost(res.data.data);
        } else {
          navigate("/404", { replace: true });
        }
      })
      .catch((err) => {
        console.error(err.message);
      });
  }, [userId, postId]);

  if (!userId) {
    return (
      //화면가림
      <div style={{ backgroundColor: "var(--ivory)", height: "100vh" }}></div>
    );
  }

  // 수정함수
  const modifyPost = () => {
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

    // 폼 데이터 생성
    const form = new FormData();
    form.append("title", post.title);
    form.append("content", post.content);
    form.append("isNotice", post.isNotice);

    // 새로 추가한 파일 담기
    files.forEach((file) => {
      form.append("files", file);
    });

    // 삭제할 S3 Key 목록 담기
    deleteFileList.forEach((s3Key) => {
      form.append("deleteS3Keys", s3Key); //
    });

    axios
      .put(`${import.meta.env.VITE_BACKSERVER}/posts/${postId}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.result === true) {
          Swal.fire({
            title: "수정완료",
            text: "글 수정이 완료되었어요.",
            imageUrl: successImage,
            imageWidth: 120, // 이미지 가로 크기 (픽셀 단위)
            imageHeight: 120, // 이미지 세로 크기 (픽셀 단위)
            imageAlt: "글수정완료 아이콘", //웹접근성을 위한 alt 텍스트
            confirmButtonText: "수정한 글 보기",
            confirmButtonColor: "var(--bun)",
            background: "var(--patty)",
            color: "var(--ivory)",
          }).then(() => {
            navigate(`/esg/post/view/${postId}`, { replace: true });
          });
        } else {
          Swal.fire({
            title: "오류발생",
            text: `${res.data.message}`,
            imageUrl: warningImage,
            imageWidth: 120, // 이미지 가로 크기 (픽셀 단위)
            imageHeight: 120, // 이미지 세로 크기 (픽셀 단위)
            imageAlt: "글수정오류 아이콘", //웹접근성을 위한 alt 텍스트
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

  if (!post) {
    return (
      <div>
        <p>기존 게시글 데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
      <h2>게시글 수정</h2>

      <PostFrm
        post={post}
        setPost={setPost}
        files={files}
        setFiles={setFiles}
        deleteFileList={deleteFileList}
        setDeleteFileList={setDeleteFileList}
      />

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={modifyPost}
          style={{
            padding: "8px 16px",
            backgroundColor: "var(--green)",
            color: "var(--ivory)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          수정
        </button>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "8px 16px",
            backgroundColor: "var(--bun)",
            color: "var(--patty)",
            border: "1px solid var(--patty)",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
          }}
        >
          취소
        </button>
      </div>
    </div>
  );
};

export default PostModifyPage;
