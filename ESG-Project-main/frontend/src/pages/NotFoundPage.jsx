import { useNavigate } from "react-router-dom";
import notfoundImage from "../assets/404.png";
const NotFoundPage = () => {
  const navigate = useNavigate();
  const moveMainPage = () => {
    navigate("/esg");
  };
  const movePrevPage = () => {
    navigate(-1);
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "var(--ivory)",
        padding: "20px",
        fontFamily: "'Noto Sans KR', sans-serif",
      }}
    >
      {/* 이미지 영역 */}
      <img
        src={notfoundImage}
        alt="요청한 페이지를 찾을 수 없습니다."
        style={{
          maxWidth: "400px",
          width: "100%",
          height: "auto",
          marginBottom: "20px",
        }}
      />

      {/* 안내 텍스트 영역 */}
      <h2
        style={{
          fontSize: "24px",
          fontWeight: "700",
          color: "var(--patty)",
          marginBottom: "10px",
        }}
      >
        요청하신 페이지를 찾을 수 없습니다.
      </h2>
      <p
        style={{
          fontSize: "15px",
          color: "var(--background)",
          marginBottom: "30px",
          textAlign: "center",
          lineHeight: "1.5",
        }}
      >
        방문하시려는 페이지의 주소가 잘못 입력되었거나,
        <br />
        페이지가 삭제 혹은 변경되어 이동하실 수 없습니다.
      </p>

      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={movePrevPage}
          style={{
            padding: "12px 24px",
            fontSize: "15px",
            fontWeight: "600",
            color: "var(--patty)",
            backgroundColor: "var(--bun)",
            border: "1px solid var(--patty)",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
          }}
          onMouseOver={(e) => {
            // 💡 마우스를 올리면 안쪽 부드러운 아이보리 빵 속살이 드러나는 느낌
            e.currentTarget.style.backgroundColor = "var(--ivory)";
            e.currentTarget.style.color = "var(--patty)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "var(--bun)";
            e.currentTarget.style.color = "var(--patty)";
          }}
        >
          이전 페이지로
        </button>

        <button
          onClick={moveMainPage}
          style={{
            padding: "12px 24px",
            fontSize: "15px",
            fontWeight: "600",
            color: "var(--ivory)",
            backgroundColor: "var(--green)",
            border: "1px solid var(--patty)",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "var(--pickle)";
            e.currentTarget.style.color = "var(--patty)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "var(--green)";
            e.currentTarget.style.color = "var(--ivory)";
          }}
        >
          메인 페이지로
        </button>
      </div>
    </div>
  );
};
export default NotFoundPage;
