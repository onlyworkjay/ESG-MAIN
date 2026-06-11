import defaultBurgerImage from "../assets/burger/default.png";

const S3_IMAGE_BASE =
  "https://esg-project-site.s3.ap-northeast-2.amazonaws.com/";
const BACK_SERVER = import.meta.env.VITE_BACKSERVER ?? "";

const S3_KEY_PREFIXES = [
  "admin/",
  "burger/",
  "file/",
  "grams/",
  "images/",
  "posts/",
  "profile_images/",
];

const encodeS3Key = (key) =>
  key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

export const resolveMenuImageUrl = (imageUrl) => {
  const rawUrl = String(imageUrl ?? "").trim();

  if (
    !rawUrl ||
    rawUrl === "default.png" ||
    rawUrl.endsWith("/default.png") ||
    rawUrl.includes("default_image")
  ) {
    return defaultBurgerImage;
  }

  if (
    rawUrl.startsWith("http://") ||
    rawUrl.startsWith("https://") ||
    rawUrl.startsWith("data:") ||
    rawUrl.startsWith("blob:")
  ) {
    return rawUrl;
  }

  if (rawUrl.startsWith("//")) {
    return `https:${rawUrl}`;
  }

  const s3Key = rawUrl.replace(/^\/+/, "");

  if (S3_KEY_PREFIXES.some((prefix) => s3Key.startsWith(prefix))) {
    return `${S3_IMAGE_BASE}${encodeS3Key(s3Key)}`;
  }

  if (rawUrl.startsWith("/")) {
    return BACK_SERVER ? `${BACK_SERVER}${rawUrl}` : rawUrl;
  }

  return `${S3_IMAGE_BASE}${encodeS3Key(s3Key)}`;
};

export const handleMenuImageError = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = defaultBurgerImage;
};

export default defaultBurgerImage;
