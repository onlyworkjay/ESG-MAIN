// axios 서버를 매핑하고 에러를 처리하는 유틸입니다.
// 작성자 :한진호
import axios from "axios";
import { toast } from "react-hot-toast";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKSERVER,
  timeout: 5000, // 5초 동안 응답 없으면 타임아웃 컷
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },

  (err) => {
    console.error(err);

    let errorMessage = "요청 처리 중 오류가 발생했습니다.";

    if (err.response) {
      if (err.response.data && err.response.data.message) {
        errorMessage = `⚠️ ${err.response.data.message}`;
      } else {
        // HTTP 상태 코드별 공통 분기 방어
        switch (err.response.status) {
          case 401:
            errorMessage = "인증이 만료되었습니다. 다시 로그인해 주세요.";
            // 토큰 만료 시 로그인 페이지로 강제 워프시키는 로직을 여기에 심을 수도 있습니다!
            break;
          case 403:
            errorMessage = "해당 권한이 없습니다.";
            break;
          case 404:
            errorMessage = "존재하지 않는 페이지나 데이터입니다.";
            break;
          case 500:
            errorMessage =
              "서버 내부에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
            break;
          default:
            break;
        }
      }
    } else if (err.request) {
      errorMessage =
        "서버와 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.";
    }

    toast.dismiss();
    toast(errorMessage, {
      duration: 3000,
      position: "bottom-center",
      style: {
        border: "1px solid var(--bun)",
        padding: "12px 16px",
        background: "var(--patty)",
        color: "var(--ivory)",
        borderRadius: "8px",
      },
    });

    return Promise.reject(err);
  },
);

export default axiosInstance;
