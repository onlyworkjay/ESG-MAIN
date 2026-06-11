{
  /* 담당자 : 장지혁 */
}

import { useLocation } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import styles from "./GramWritePage.module.css";
import axios from "axios";
import Swal from "sweetalert2";
import useAuthStore from "../authstore/useAuthStore";
import ComposeFrm from "../components/compose/ComposeFrm";
import ClearIcon from "@mui/icons-material/Clear";

const FileItem = ({ file, deleteFile }) => {
  /* 파일 객체면 미리보기 URL 생성, 기존 파일이면 서버 경로 사용 */
  const previewUrl =
    file instanceof File ? URL.createObjectURL(file) : file.gramFileName;
  return (
    <ul className={styles.file_item}>
      {/* file.name || file.gramFileName 수정할 때 파일이름 출력 */}
      <li>
        <img
          src={previewUrl}
          alt={file.name || file.gramFileName}
          className={styles.file_preview}
        />
      </li>
      <li className={styles.file_name}>{file.name || file.marketFileName}</li>
      <li>
        <ClearIcon
          className={styles.file_delete}
          onClick={() => deleteFile(file)}
        />
      </li>
    </ul>
  );
};

const GramWritePage = () => {
  const { choiceId: paramChoiceId } = useParams();
  const { userId, token, choiceId: storeChoiceId } = useAuthStore();
  const rawChoiceId = paramChoiceId ?? storeChoiceId;
  const choiceId = rawChoiceId == null ? null : Number(rawChoiceId);
  const loginUserId = userId == null ? null : Number(userId);
  const location = useLocation();

  const navigate = useNavigate();

  const [gram, setGram] = useState({
    title: "",
    content: "",
  });

  /* 파일 관리용 스테이트 */
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addFiles = (fileList) => {
    const imageFiles = fileList.filter((file) =>
      file.type.startsWith("image/"),
    );

    /* gif 제외 */
    const noGifFiles = imageFiles.filter((file) => file.type !== "image/gif");
    if (noGifFiles.length !== imageFiles.length) {
      Swal.fire({
        icon: "warning",
        title: "GIF 파일은 업로드할 수 없습니다.",
      });
    }

    if (imageFiles.length !== fileList.length) {
      Swal.fire({
        icon: "warning",
        title: "이미지 파일만 업로드 가능합니다.",
      });
    }

    /* 최대 이미지 개수(5장) 설정 */
    if (files.length + noGifFiles.length > 5) {
      Swal.fire({
        icon: "warning",
        title: "이미지는 최대 5장까지 업로드 가능합니다.",
      });
      return;
    }

    const newFiles = [...files, ...noGifFiles];
    setFiles(newFiles);
  };

  /* 파일 삭제용 함수*/
  const deleteFile = (file) => {
    const newFiles = files.filter((item) => {
      return item !== file;
    });
    setFiles(newFiles);
  };

  /* 제목 함수 */
  const inputGramTitle = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    if (value.length > 50) {
      Swal.fire({
        icon: "warning",
        title: "제목은 50자까지 작성 가능합니다.",
      });
      return;
    }
    setGram({ ...gram, [name]: value });
  };

  /* 내용 함수 */
  const inputGramContent = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    if (value.length > 500) {
      Swal.fire({
        icon: "warning",
        title: "내용은 최대 500자까지 작성 가능합니다.",
      });
      return;
    }
    setGram({ ...gram, [name]: value });
  };

  return (
    <section className={styles.gram_write_wrap}>
      <h3>후기 작성</h3>
      {/* 제목 필드 */}
      <div className={styles.gram_input_wrap}>
        <label htmlFor="gramTitle">제목</label>
        <div className={styles.title_input_box}>
          <input
            placeholder="제목을 입력해주세요 (최대 50자 입력 가능)"
            type="text"
            name="title"
            id="gramTitle"
            value={gram.title}
            onChange={inputGramTitle}
          />
          <span
            className={`${styles.title_count} ${
              gram.title.length >= 50 ? styles.limit : ""
            }`}
          >
            {gram.title.length} / 50
          </span>
        </div>
      </div>

      {/* 내용 필드 */}
      <div className={styles.gram_input_wrap}>
        <label htmlFor="gramContent">내용</label>
        <div className={styles.content_input_box}>
          <textarea
            placeholder="내용을 입력해주세요 (최대 500자 입력 가능)"
            name="content"
            id="gramContent"
            value={gram.content}
            onChange={inputGramContent}
          />
          <span
            className={styles.content_count}
            style={{
              color:
                gram.content.length >= 500 ? "var(--tomato)" : "var(--green)",
            }}
          >
            {gram.content.length} / 500
          </span>
        </div>
      </div>

      {/* 파일첨부 필드 */}
      <div className={styles.gram_file_wrap}>
        <label
          htmlFor="files"
          className={styles.file_btn}
          title="이미지는 최대 5장까지 올릴 수 있습니다."
        >
          파일추가
        </label>

        <input
          type="file"
          id="files"
          multiple
          accept="image/jpeg, image/png, image/webp"
          style={{ display: "none" }}
          onClick={(e) => {
            e.target.value = null; // 같은 파일 다시 선택 가능
          }}
          onChange={(e) => {
            const fileList = Array.from(e.target.files);
            addFiles(fileList);
          }}
        />

        <div className={styles.file_wrap}>
          {gram.fileList &&
            gram.fileList.map((file, index) => {
              return (
                <FileItem
                  key={"old-file-item-" + index}
                  file={file}
                  deleteFile={deleteFile}
                />
              );
            })}
          {files.map((file, index) => {
            return (
              <FileItem
                key={"file-item-" + index}
                file={file}
                deleteFile={deleteFile}
              />
            );
          })}
        </div>
      </div>

      {/* 버튼 필드 */}
      <div className={styles.gram_btn_wrap}>
        <button
          className={styles.regist_btn}
          disabled={isSubmitting}
          onClick={() => {
            const title = gram.title.trim();
            const content = gram.content.trim();

            if (!loginUserId) {
              Swal.fire({
                icon: "warning",
                title: "로그인 후 이용해주세요.",
              });
              return;
            }

            if (!choiceId || Number.isNaN(choiceId)) {
              Swal.fire({
                icon: "warning",
                title: "선택 기록을 찾을 수 없습니다.",
                text: "비교하기에서 메뉴를 다시 선택한 뒤 후기를 작성해주세요.",
              });
              return;
            }

            if (title === "" || content === "") {
              Swal.fire({
                icon: "warning",
                title: "제목과 내용을 적어주세요.",
              });
              return;
            }

            const form = new FormData();
            form.append("title", title);
            form.append("content", content);
            form.append("userId", String(loginUserId));
            form.append("choiceId", String(choiceId));

            files.forEach((file) => form.append("files", file));

            const headers = {};

            if (token) {
              headers.Authorization = token;
            }

            setIsSubmitting(true);

            axios
              .post(`${import.meta.env.VITE_BACKSERVER}/grams`, form, {
                headers,
              })
              .then((res) => {
                if (res.data > 0) {
                  const redirectPath =
                    location.state?.redirectAfterWrite ?? "/esg/gram";

                  Swal.fire({
                    title: "등록되었습니다.",
                    icon: "success",
                  }).then(() => {
                    navigate(redirectPath);
                  });
                }
              })
              .catch((err) => {
                const message =
                  typeof err.response?.data === "string"
                    ? err.response.data
                    : "후기 작성 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";

                Swal.fire({
                  icon: "warning",
                  title: "후기 작성 실패",
                  text: message,
                });
              })
              .finally(() => {
                setIsSubmitting(false);
              });
          }}
        >
          {isSubmitting ? "등록 중" : "등록"}
        </button>

        <button
          className={styles.cancel_btn}
          onClick={() => {
            Swal.fire({
              title: "작성을 취소하시겠어요?",
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "네",
              cancelButtonText: "아니오",
            }).then((result) => {
              if (result.isConfirmed) {
                navigate("/esg/gram");
              }
            });
          }}
        >
          취소
        </button>
      </div>
    </section>
  );
};

export default GramWritePage;
