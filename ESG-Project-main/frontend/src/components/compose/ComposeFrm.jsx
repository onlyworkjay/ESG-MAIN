import Swal from "sweetalert2";
import useAuthStore from "../../authstore/useAuthStore";
import { useNavigate } from "react-router-dom";
import styles from "./ComposeFrm.module.css";
import DeleteIcon from "@mui/icons-material/Delete";

import checkImage from "../../assets/check.png";
import infoImage from "../../assets/info.png";
import questionImage from "../../assets/question.png";
import warningImage from "../../assets/warning.png";
import successImage from "../../assets/success.png";

const TITLE_MAX = 50;
const CONTENT_MAX = 500;

// 후기 및 게시판 페이지에서 작성과 수정용 컴포넌트
const ComposeFrm = ({
  compose,
  setCompose,
  files,
  setFiles,
  deleteFileList,
  setDeleteFileList,
}) => {
  const navigate = useNavigate();
  const { userId } = useAuthStore();

  const currentS3Count = compose?.s3keys?.length || 0;

  // 파일 추가 함수
  const addFiles = (fileList) => {
    const imageFiles = fileList.filter((file) =>
      file.type.startsWith("image/"),
    );

    if (imageFiles.length !== fileList.length) {
      Swal.fire({ icon: "warning", text: "이미지 파일만 업로드 가능합니다." });
    }

    if (currentS3Count + files.length + imageFiles.length > 5) {
      Swal.fire({
        text: "이미지는 최대 5장까지 업로드 가능합니다.",
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

    const newFiles = [...files, ...imageFiles];
    setFiles(newFiles);
  };

  // 수정 시 추가한 파일 삭제
  const deleteFile = (file) => {
    const newFiles = files.filter((item) => item !== file);
    setFiles(newFiles);
  };

  // 수정 시 기존 S3 파일 삭제
  const addDeleteFileList = (fileUrl) => {
    const newS3keys = compose.s3keys.filter((item) => item !== fileUrl);
    setCompose({ ...compose, s3keys: newS3keys });

    const s3Key = fileUrl.split(".amazonaws.com/")[1];

    if (setDeleteFileList) {
      setDeleteFileList([...deleteFileList, s3Key]);
    }
  };

  const inputCompose = (e) => {
    const { name, value } = e.target;

    // 제목 500자 초과 시 swal
    if (name === "title" && value.length > TITLE_MAX) {
      Swal.fire({
        text: `제목은 최대 ${TITLE_MAX}자까지 입력 가능합니다.`,
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

    // 내용 500자 초과 시 swal
    if (name === "content" && value.length > CONTENT_MAX) {
      Swal.fire({
        text: `내용은 최대 ${CONTENT_MAX}자까지 입력 가능합니다.`,
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

    setCompose({ ...compose, [name]: value });
  };

  return (
    <div className={styles.all}>
      {/* 제목 */}
      <label htmlFor="composeTitle">제목</label>
      <div className={styles.input_wrap}>
        <input
          type="text"
          name="title"
          id="composeTitle"
          value={compose.title}
          onChange={inputCompose}
          maxLength={TITLE_MAX}
          placeholder="제목을 입력해주세요 (최대 50자 입력 가능)"
        />
        {/* 제목 글자 수 - input 안 오른쪽 */}
        <span
          className={styles.input_counter}
          style={{
            color:
              compose.title.length >= TITLE_MAX
                ? "var(--tomato)"
                : "var(--green)", // #aaa → var(--green)
          }}
        >
          {compose.title.length} / {TITLE_MAX}
        </span>
      </div>

      {/* 내용 */}
      <label htmlFor="composeContent">내용</label>
      <div className={styles.textarea_wrap}>
        <textarea
          name="content"
          id="composeContent"
          value={compose.content}
          onChange={inputCompose}
          maxLength={CONTENT_MAX}
          placeholder="내용을 입력해주세요 (최대 500자 입력 가능)"
        />
        {/* 내용 글자 수 - textarea 안 오른쪽 하단 */}
        <span
          className={styles.textarea_counter}
          style={{
            color:
              compose.content.length >= CONTENT_MAX
                ? "var(--tomato)"
                : "var(--green)", // #aaa → var(--green)
          }}
        >
          {compose.content.length} / {CONTENT_MAX}
        </span>
      </div>

      {/* 파일첨부필드 */}
      <div>
        <label htmlFor="fileAddBtn" className={styles.file_label}>
          파일추가
        </label>
        <input
          type="file"
          id="fileAddBtn"
          multiple
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const fileList = Array.from(e.target.files);
            addFiles(fileList);
            e.target.value = "";
          }}
        />

        {/* 파일목록 */}
        <div className={styles.file_list_wrap}>
          {compose.s3keys &&
            compose.s3keys.map((url, index) => {
              const displayFileName = url.substring(url.lastIndexOf("/") + 1);
              return (
                <FileItem
                  key={"s3-item-" + index}
                  imgSrc={url}
                  fileName={displayFileName}
                  onDelete={() => addDeleteFileList(url)}
                />
              );
            })}

          {files.map((file, index) => {
            const previewUrl = URL.createObjectURL(file);
            return (
              <FileItem
                key={"new-file-item-" + index}
                imgSrc={previewUrl}
                fileName={file.name}
                onDelete={() => deleteFile(file)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

const FileItem = ({ imgSrc, fileName, onDelete }) => {
  return (
    <ul
      className={styles.file_item_ul}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "15px",
        listStyle: "none",
        padding: "10px",
        border: "1px solid #eee",
        borderRadius: "5px",
        marginBottom: "10px",
      }}
    >
      <li>
        <img
          src={imgSrc}
          alt={fileName}
          style={{
            width: "100px",
            height: "100px",
            objectFit: "cover",
            borderRadius: "4px",
          }}
        />
      </li>
      <li
        style={{
          flex: 1,
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        {fileName}
      </li>
      <li>
        <DeleteIcon
          style={{ cursor: "pointer", color: "var(--tomato)" }}
          onClick={onDelete}
        />
      </li>
    </ul>
  );
};

export default ComposeFrm;
