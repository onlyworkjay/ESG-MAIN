import { Link } from "react-router-dom";
import styles from "./PostCard.module.css";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

// 게시글 목록보기 목록 컴포넌트
// 작성자:한진호
const PostCard = ({ post, isNotice }) => {
  const hasLiked =
    post.isLike === true ||
    post.isLike === 1 ||
    post.is_like === true ||
    post.is_like === 1 ||
    post.like === true ||
    post.like === 1;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return dateStr.split("T")[0] || dateStr;
  };

  return (
    <Link
      to={`/esg/post/view/${post.postId}`}
      className={[
        styles.cardLink,
        isNotice ? styles.notice : "",
        hasLiked ? styles.likedCard : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <article className={styles.card}>
        <div className={styles.titleRow}>
          {isNotice && (
            <span className={styles.noticeBadge}>
              <span className="material-symbols-outlined">campaign</span>
              공지
            </span>
          )}
          <h3>{post.title}</h3>
        </div>

        <div className={styles.metaRow}>
          <div className={styles.metaGroup}>
            <span>
              <span className="material-symbols-outlined">person</span>
              {post.writer}
            </span>
            <span>
              <span className="material-symbols-outlined">calendar_month</span>
              {formatDate(post.createdAt)}
            </span>
          </div>

          <div className={styles.metricGroup}>
            <span>
              <span className="material-symbols-outlined">visibility</span>
              {post.viewCount}
            </span>
            {/* 좋아요 및 좋아요 여부 필드 */}
            <span className={hasLiked ? styles.liked : undefined}>
              {hasLiked ? (
                <FavoriteIcon className={styles.likeIcon} />
              ) : (
                <FavoriteBorderIcon className={styles.likeIcon} />
              )}
              {post.likeCount}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default PostCard;
