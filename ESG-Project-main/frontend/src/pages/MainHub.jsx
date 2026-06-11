import { Route, Routes } from "react-router-dom";
import Layout from "../components/common/Layout";
import EatPage from "./EatPage";
import StatPage from "./StatPage";
import MainPage from "./MainPage";
import RandomPage from "./RandomPage";
import PostPage from "./PostPage";
import PostViewPage from "./PostViewPage";
import PostWritePage from "./PostWritePage";
import PostModifyPage from "./PostModifyPage";
import GramPage from "./GramPage";
import GramViewPage from "./GramViewPage";
import GramWritePage from "../pages/GramWritePage";
import GramModifyPage from "./GramModifyPage";

const MainHub = () => {
  return (
    <>
      {/* 인트로페이지에서 입장 이후 메인페이지와 다른페이지를 분기할 허브입니다.*/}
      {/* Header가 들어갈자리 */}
      {/* ⚠️ 작업시 주의하세요.*/}
      <Layout>
        <Routes>
          <Route path="/" element={<MainPage />} />
          {/* ⬆️ 메인페이지*/}
          <Route path="eat" element={<EatPage />} />
          {/* ⬆️ 탐색페이지*/}
          <Route path="stat" element={<StatPage />} />
          {/* ⬆️ 비교페이지*/}
          <Route path="gram" element={<GramPage />} />
          <Route path="gram/:productId" element={<GramPage />} />
          {/* ⬆️ 후기페이지*/}
          <Route path="random" element={<RandomPage />} />
          {/* ⬆️ 랜덤페이지 */}
          <Route path="post" element={<PostPage />} />
          {/* ⬆️ 게시판페이지*/}
          <Route path="post/write" element={<PostWritePage />} />
          {/* ⬆️ 게시판페이지-글작성페이지*/}
          <Route path="post/modify/:postId" element={<PostModifyPage />} />
          {/* ⬆️ 게시판페이지-글수정페이지*/}
          <Route path="post/view/:postId" element={<PostViewPage />} />
          {/* ⬆️ 게시판페이지-상세보기페이지*/}

          <Route path="gram/write/:choiceId" element={<GramWritePage />} />
          {/* ⬆️ 후기 작성 페이지입니다. */}
          <Route path="gram/view/:gramId" element={<GramViewPage />} />
          {/* ⬆️ 후기 상세보기 페이지입니다. */}
          <Route path="gram/modify/:gramNo" element={<GramModifyPage />} />
          {/* ⬆️ 후기 수정 페이지입니다. */}
        </Routes>
      </Layout>
      {/*Footer가 들어갈자리 */}
    </>
  );
};
export default MainHub;
