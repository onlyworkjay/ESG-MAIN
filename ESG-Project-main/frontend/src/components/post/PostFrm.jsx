import Swal from "sweetalert2";
import useAuthStore from "../../authstore/useAuthStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import styles from "./PostFrm.module.css";

//게시판 작성/수정용 컴포넌트
const PostFrm = ({
  post,
  setPost,
  files,
  setFiles,
  deleteFileList,
  setDeleteFileList,
}) => {
  const navigate = useNavigate();
  const { userId, role } = useAuthStore();

  const currentS3Count = post?.s3keys?.length || 0;

  // 파일 추가 함수
  const addFiles = (fileList) => {
    const imageFiles = fileList.filter((file) =>
      file.type.startsWith("image/"),
    );

    if (imageFiles.length !== fileList.length) {
      Swal.fire({ icon: "warning", text: "이미지 파일만 업로드 가능합니다." });
    }

    if (currentS3Count + files.length + imageFiles.length > 3) {
      Swal.fire({
        icon: "warning",
        text: "이미지는 최대 3장까지 업로드 가능합니다.",
      });
      return;
    }

    const newFiles = [...files, ...imageFiles];
    setFiles(newFiles);
  };

  // 수정시 추가한 파일 삭제
  const deleteFile = (file) => {
    const newFiles = files.filter((item) => item !== file);
    setFiles(newFiles);
  };

  // 수정시 기존 S3 파일 삭제
  const addDeleteFileList = (fileUrl) => {
    const newS3keys = post.s3keys.filter((item) => item !== fileUrl);
    setPost({ ...post, s3keys: newS3keys });

    const s3Key = fileUrl.split(".amazonaws.com/")[1];

    if (setDeleteFileList) {
      setDeleteFileList([...deleteFileList, s3Key]);
    }
  };

  const inputPost = (e) => {
    const { name, value } = e.target;
    setPost({ ...post, [name]: value });
  };

  return (
    <div className={styles.form}>
      {/* 제목 필드 */}
      <label htmlFor="postTitle" className={styles.label}>
        제목
      </label>
      <input
        className={styles.input}
        type="text"
        name="title"
        id="postTitle"
        placeholder="게시글 제목을 입력하세요"
        value={post.title}
        onChange={inputPost}
      />

      {role && (role.trim() === "admin" || role.trim() === "master") && (
        <div
          className={styles.noticeToggle}
          onClick={() => {
            setPost({
              ...post,
              isNotice: post.isNotice === 1 ? 0 : 1,
            });
          }}
        >
          <input
            type="checkbox"
            id="isNoticeCheckbox"
            name="isNotice"
            checked={post.isNotice === 1}
            onClick={(e) => e.stopPropagation()} // 버블링으로 인한 더블 토글 버그 방지
            onChange={(e) => {
              setPost({
                ...post,
                isNotice: e.target.checked ? 1 : 0,
              });
            }}
            className={styles.checkbox}
          />
          <label
            htmlFor="isNoticeCheckbox"
            onClick={(e) => e.stopPropagation()} // 라벨 클릭 시 인풋 자동 트리거 중복 버그 차단
            className={styles.noticeLabel}
          >
            게시글을 공지사항으로 등록합니다.
          </label>
        </div>
      )}
      {/*내용필드 */}
      <label htmlFor="postContent" className={styles.label}>
        내용
      </label>
      <textarea
        className={styles.textarea}
        name="content"
        id="postContent"
        placeholder="내용을 입력하세요"
        value={post.content}
        onChange={inputPost}
      />

      {/* 파일첨부필드 */}
      <div className={styles.fileSection}>
        <label
          htmlFor="fileAddBtn"
          className={styles.fileButton}
        >
          <span className="material-symbols-outlined">add_photo_alternate</span>
          이미지 추가
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
        <div className={styles.fileList}>
          {/* 기존 서버 S3 이미지 목록 (수정페이지 진입 시 노출) */}
          {post.s3keys &&
            post.s3keys.map((url, index) => {
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

          {/* 새로 추가한 파일 목록 */}
          {files.map((file, index) => {
            // 브라우저 메모리에 가상 업로드하여 임시 URL 주소 생성 (미리보기용)
            const previewUrl = URL.createObjectURL(file);
            return (
              <FileItem
                key={"new-file-item-" + index}
                imgSrc={previewUrl} // 로컬 가상 URL 전달
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
    <ul className={styles.fileItem}>
      <li>
        <img
          src={imgSrc}
          alt={fileName}
          className={styles.filePreview}
        />
      </li>
      <li className={styles.fileName}>
        {fileName}
      </li>
      <li>
        <DeleteIcon
          className={styles.deleteIcon}
          onClick={onDelete}
        />
      </li>
    </ul>
  );
};

export default PostFrm;
