import axios from "axios";
import { useEffect, useState } from "react";
import Pagination from "../ui/Pagination";
import { useNavigate } from "react-router-dom";
import styles from "./AdminMenueList.module.css";

const AdminMenueList = () => {
  /* 상태 한글 변환 */
  const statusLabel = (s) =>
    s === "active" ? "판매중" : s === "discontinued" ? "단종" : "숨김";

  /* 날짜 포맷 */
  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("sv-SE") : "-");

  const navigate = useNavigate();
  //검색명 저장
  const [inputSearchMenue, setInputSearchMenue] = useState("");

  const [totalPage, setTotalPage] = useState();
  // const [searchMenue, setSearchMenue] = useState("");
  // //검색명 필터
  // const [searchFilter, setSearchFilter] = useState(1);
  // //나머지 설정 필터
  // const [statusFilter, setStatusFilter] = useState("all");
  // const [brandFilter, setBrandFilter] = useState(0);
  // const [allergyFilter, setAllergyFilter] = useState(0);
  // const [createdFilter, setCreatedFilter] = useState("createdDesc");

  const [allergyList, setAllergyList] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [searchParams, setSearchParams] = useState({
    // 검색
    searchMenue: "",
    searchFilter: 1, // 1: 메뉴명 / 2: 브랜드명

    // 필터
    status: "all",
    brandId: 0,

    // 정렬
    createdAt: "createdDesc",
    page: 0,
  });
  const [menueList, setMenueList] = useState([]);
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/admin/getBrand`)
      .then((res) => {
        // console.log(res.data);
        setBrandList([...res.data]);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/admin/getAllergy`)
      .then((res) => {
        setAllergyList([...res.data]);
        // console.log(res.data);
      })
      .catch((err) => {
        console.error(err.message);
      });
  }, []);

  //메뉴 가져오는 요청
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/admin/getMenueList`, {
        params: searchParams, //시발 이제는 get으로 객체 못보내는 것 정도는 기억해야지 이 시발 놈아
      })
      .then((res) => {
        setInputSearchMenue("");
        console.log(res.data);
        setTotalPage(res.data.totalPage);
        setMenueList([...res.data.menues]);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [searchParams]);
  return (
    <div>
      {/* ── 제목 ── */}
      {/* <h2 className={styles.title}>메뉴 목록</h2> */}

      {/* ── 검색 · 필터 툴바 ── */}
      <div className={styles.toolbar}>
        <form
          className={styles.searchForm}
          onSubmit={(e) => {
            e.preventDefault();
            setSearchParams({ ...searchParams, searchMenue: inputSearchMenue });
          }}
        >
          <input
            className={styles.searchInput}
            placeholder="메뉴명 검색"
            value={inputSearchMenue}
            onChange={(e) => setInputSearchMenue(e.target.value)}
          />
          <button className={styles.searchBtn} type="submit">
            검색
          </button>
        </form>

        <div>
          <select
            className={styles.selectBox}
            onChange={(e) =>
              setSearchParams({ ...searchParams, brandId: e.target.value })
            }
          >
            <option value={0}>모든 브랜드</option>
            {brandList.map((brand) => (
              <option key={brand.brandName} value={brand.brandId}>
                {brand.brandName}
              </option>
            ))}
          </select>

          <select
            className={styles.selectBox}
            onChange={(e) =>
              setSearchParams({ ...searchParams, status: e.target.value })
            }
          >
            <option value={"all"}>모든 상태</option>
            <option value={"active"}>판매중</option>
            <option value={"discontinued"}>단종</option>
            <option value={"hidden"}>숨김</option>
          </select>

          <select
            className={styles.selectBox}
            onChange={(e) =>
              setSearchParams({ ...searchParams, createdAt: e.target.value })
            }
          >
            <option value={"createdDesc"}>최신 등록순</option>
            <option value={"createdAsc"}>등록 날짜순</option>
          </select>
        </div>
      </div>

      {/* ── 리스트 ── */}
      <div className={styles.listWrapper}>
        {/* 헤더 */}
        <div className={styles.headerRow}>
          <span>ID</span>
          <span>메뉴명</span>
          <span>상태</span>
          <span>브랜드</span>
          <span>등록일</span>
        </div>

        {/* 데이터 행 */}
        {menueList.length === 0 ? (
          <p className={styles.emptyMsg}>검색 결과가 없습니다.</p>
        ) : (
          menueList.map((menue, index) => (
            <div
              key={menue.name + index}
              className={styles.dataRow}
              onClick={() => navigate(`../list/${menue.productId}`)}
            >
              <p>{menue.productId}</p>
              <p>{menue.name}</p>
              <p>
                <em
                  className={styles.statusBadge}
                  data-stat-badge={menue.status}
                >
                  {statusLabel(menue.status)}
                </em>
              </p>
              <p>{menue.brandName}</p>
              <p>{formatDate(menue.createdAt)}</p>
            </div>
          ))
        )}
      </div>

      {/* ── 페이지네이션 ── */}
      <div className={styles.paginationWrapper}>
        <Pagination
          page={searchParams.page}
          setPage={(page) => setSearchParams({ ...searchParams, page })}
          totalPage={totalPage}
          naviSize={5}
        />
      </div>
    </div>
  );
};
export default AdminMenueList;
