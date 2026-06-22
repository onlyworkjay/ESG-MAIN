<KH정보교육원 두 번째 프로젝트>

Final Project PDF: [📄 파이널 프로젝트 발표자료](./ESG_파이널프로젝트.pdf)

프로젝트 기간: 2026.5.11 ~ 2026.6.9

((이 프로젝트에는 원본 주소가 없습니다. 원본 주소에는 AWS 관련 키, 정보들이 노출되어 있어서 ZIP 파일 다운 받고 각자 깃 저장소에 등록했습니다.))

프로젝트 명: ESG(Eat Stat Gram)

프로젝트 목표: ESG는 사용자가 햄버거 메뉴를 검색하고 가격, 영양정보, 후기 정보를 비교하여 더 쉽게, 더 좋은 메뉴를 선택할 수 있도록 돕는 서비스입니다.<br>
사용자는 브랜드명 또는 메뉴명을 기준으로 메뉴 정보를 조회하고, 여러 메뉴를 비교한 뒤 ‘이걸로 정했어!’ 기능으로 자신 의 선택을 기록할 수 있습니다.<br>
선택 이후에는 후기를 작성하여 다른 사용자와 경험을 공유할 수 있습니다.

주요 기능 및 주요 상세<br>
1) 회원 가입 및 로그인, 로그아웃<br>
2) 회원 정보 수정 (프로필 이미지, 회원 탈퇴 등)<br>
3) 회원 등급 (일반 회원, 관리자)<br>
4) 마이페이지 (회원정보, 최근 선택 메뉴, 나의 게시글, 내가 작성한 후기, 제보/신고 내역, 즐겨찾기)<br>
5) 관리자 전용 주소창 (로그인 시 관리자 전용 대시보드 출력)<br>
6) 메뉴 탐색 (브랜드, 메뉴명 제공)<br>
7) 메뉴 탐색에서 즐겨찾기 제공<br>
8) 전체 브랜드/메뉴 중 랜덤 추첨을 통해 하나 출력<br>
9) 비교하기 페이지에서 비회원은 2개, 회원은 3개를 택할 수 있으며 서로 정보를 보고 1개 선택<br>
10) choiceID를 갖고 후기 작성<br>
11) 후기 사진 출력<br>
12) 자유로운 주제로 게시판에서 게시글 작성

# 🥗 Meal Plan - 식단 기록 사이트

개인 포트폴리오 프로젝트 | 1인 개발

---

## 🛠 기술 스택

| 분류 | 기술 |
|------|------|
| **Frontend** | React, JSX, CSS |
| **Backend** | Spring Boot, JPA |
| **Database** | MySQL |
| **Cloud** | AWS S3 (이미지 저장) |
| **버전 관리** | Git |
| **IDE** | IntelliJ |

---

## 📋 기능 목록

| 페이지 | 세부 기능 | 기능 설명 | 로그인 여부 |
|--------|-----------|-----------|:-----------:|
| **로그인 및 회원가입 및 아이디·비밀번호 찾기** | 로그인 | 아이디와 비밀번호 입력 후 로그인 → JWT 토큰 발급 → 메인페이지 이동 | X |
| | 회원가입 | 이메일·아이디·닉네임·비밀번호 입력 → 유효성 검사 → 회원 등록 (이메일·아이디·닉네임 중복 불가) | X |
| | 아이디·비밀번호 찾기 | 닉네임+이메일 입력 시 이메일로 인증번호 6자리 전송 (유효시간 3분) / 인증 성공 시 아이디 또는 새 비밀번호 변경 제공 | X |
| **메인 페이지** | 오늘의 피드 | 당일 작성된 피드를 카드형으로 표시 (기본값 최신순), 페이지네이션 10개 / 한 줄당 2개씩 배치, 세로 최대 5줄 / 사진 2장 이상 시 첫 번째 등록 사진이 썸네일 | X |
| | 키워드 검색 | 제목/내용 키워드 입력 시 해당 피드만 필터링하여 출력 | X |
| **피드 페이지** | 전체 피드 | 전체 피드 출력 (메인페이지는 당일 피드만 출력) | X |
| | 기록하기 버튼 | 피드는 하루 최대 3번 업로드 가능 / 업로드 제한 초과 시 SWAL 경고 출력 | O |
| | 사진 업로드 | 사진 없으면 피드 등록 불가 / 최대 4장, JPG·JPEG·PNG·WEBP만 허용, 장당 최대 10MB / AWS S3 저장 | O |
| | 칼로리 입력 | 사진 첨부 후 칼로리 수기 입력 (kcal, 숫자 중 정수만 허용) | O |
| | 제목/내용 입력 | 제목 필수 (최대 50자), 내용 선택 (최대 1,000자) | O |
| **피드 상세 페이지** | 상세보기 | 사진 슬라이드 뷰어, 칼로리·작성일(시분 포함)·제목·내용 표시 | X |
| | 수정 | 작성자 본인만 수정 가능 / 제목·내용·칼로리·사진 추가 및 삭제 | O |
| | 삭제 | 작성자 본인만 삭제 가능 / 삭제 시 S3 이미지도 함께 제거 | O |
| **날짜별 조회 페이지** | 캘린더 UI | 달력 제공 / 나의 피드만 반영 / 기록이 있는 날짜에 점(dot) 표시 | X |
| | 날짜 클릭 | 특정 날짜 클릭 시 해당일 피드만 필터링하여 표시 | X |
| **마이 페이지** | 내 정보 관리 | 프로필 사진 변경·기본 이미지 설정, 닉네임·이메일·비밀번호 변경, 회원 탈퇴, 로그아웃 / 탈퇴 시 DB에 데이터 남기지 않음 (Hard Delete) | O |
| | 내 피드 탭 | 본인이 작성한 피드 출력 | O |
| **통계 페이지** | 체중 변화 그래프 | 날짜별 체중 입력값을 꺾은선 그래프로 시각화 (Recharts 사용) / 같은 날 여러 건 입력 시 마지막 값 기준 | O |
| | 사진 슬라이드 뷰어 | 날짜별 업로드된 사진을 슬라이드로 넘겨보기 / 사진 클릭 시 MODAL로 원본 사진 크기 출력 | O |
| | 체중 입력 | 날짜별 체중(kg) 수기 입력 / 소수점 둘째 자리까지 표시 | O |
| **ERD CLOUD** | ERD CLOUD 테이블 | ERD CLOUD 사이트에서 테이블 설계 | - |

---

## 📡 API 명세

### 👤 회원 (User)

| Method | URL | 설명 | 인증 필요 |
|--------|-----|------|:---------:|
| POST | /users/join | 회원가입 | X |
| GET | /users/check-id?loginId= | 아이디 중복 확인 | X |
| GET | /users/check-nickname?nickname= | 닉네임 중복 확인 | X |
| GET | /users/check-email?email= | 이메일 중복 확인 | X |
| POST | /users/login | 로그인 (JWT 토큰 발급) | X |
| POST | /users/refresh | 토큰 재발급 (세션 연장) | O |
| POST | /users/find-id | 아이디 찾기 (닉네임 + 이메일 확인) | X |
| POST | /users/reset-password | 비밀번호 재설정 | X |
| POST | /users/profile | 내 정보 수정 (닉네임·이메일·프로필 사진) | O |
| POST | /users/password | 비밀번호 변경 | O |
| POST | /users/withdraw | 회원 탈퇴 (Hard Delete) | O |

### 📧 이메일 인증 (Email)

| Method | URL | 설명 | 인증 필요 |
|--------|-----|------|:---------:|
| POST | /users/email-verification | 인증번호 전송 (유효시간 3분) | X |
| POST | /users/email-verification/confirm | 인증번호 확인 | X |

### 🍽 피드 (Write)

| Method | URL | 설명 | 인증 필요 |
|--------|-----|------|:---------:|
| POST | /writes | 피드 등록 (사진 포함, S3 업로드) | O |
| GET | /writes | 전체 피드 목록 조회 | X |
| GET | /writes/my | 내가 작성한 피드 목록 조회 | O |
| GET | /writes/{writeId} | 피드 상세 조회 | X |
| POST | /writes/{writeId} | 피드 수정 (제목·내용·칼로리·사진) | O |
| DELETE | /writes/{writeId} | 피드 삭제 (S3 이미지 함께 삭제) | O |

### 📊 통계 (Stat)

| Method | URL | 설명 | 인증 필요 |
|--------|-----|------|:---------:|
| POST | /stats | 체중 입력 | O |
| GET | /stats/my | 내 체중 변화 기록 전체 조회 (그래프용) | O |


ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

핵심 코드

<<Gram페이지에서 작성 버튼 눌렀을 때>>
const handleWrite = async () => {
  if (!userId) {
    Swal.fire({ title: "로그인을 해야 사용할 수 있는 기능입니다." });
    return;
  }

  const { value: selected } = await Swal.fire({
    title: "후기 작성 전에 이동할 페이지를 선택하세요",
    html: `
      <div style="display:flex; gap:16px; justify-content:center;">
        <label id="label-stat">
          <input type="radio" name="redirect" value="stat" style="display:none"/>
          <span>📊</span>
          <span>비교하기</span>
        </label>
        <label id="label-mypage">
          <input type="radio" name="redirect" value="mypage" style="display:none"/>
          <span>👤</span>
          <span>마이페이지</span>
        </label>
      </div>
    `,
    preConfirm: () => {
      const checked = document.querySelector('input[name="redirect"]:checked');
      if (!checked) { Swal.showValidationMessage("하나를 선택해주세요!"); return false; }
      return checked.value;
    },
    confirmButtonText: "이동하기",
    showCancelButton: true,
  });

  if (!selected) return;
  if (selected === "stat") navigate("/esg/stat");
  else navigate("/esg/mypage");
};


<<Stat페이지에서 메뉴 최대 3개 선택(회원 기준으로 했음)>>
const MAX_COMPARE = 3; // 회원 기준

// 메뉴 추가 (최대 3개 제한)
const handleAddMenu = (menu) => {
  if (isAlreadyAdded(menu.id)) {
    showWarning("이미 추가된 메뉴입니다.");
    return;
  }
  if (compareList.length >= MAX_COMPARE) {
    showWarning("최대 3개까지 비교할 수 있습니다.");
    return;
  }
  addCompareMenu(menu);
};

// 메뉴 선택 확정 → choices POST → choice 페이지로 이동
const handleConfirmSelectedMenu = async () => {
  if (!selectedMenu || isSavingChoice) return;

  try {
    setIsSavingChoice(true);

    const response = await axios.post(
      `${import.meta.env.VITE_BACKSERVER}/choices`,
      {
        userId,
        selectedProductId: selectedMenu.id,
        items: compareList.map((menu, index) => ({
          productId: menu.id,
          displayOrder: index + 1,
        })),
      }
    );

    const { choiceId, choiceGroupId } = response.data;
    setChoiceId(choiceId);
    setSelectedMenu(null);

    navigate(`/choice/${choiceId}`, {
      state: {
        choiceId,
        choiceGroupId,
        isMember: true,
        menus: compareList,
        selectedProductId: selectedMenu.id,
      },
    });
  } catch (error) {
    await showWarning("선택 저장 중 문제가 발생했습니다.");
  } finally {
    setIsSavingChoice(false);
  }
};

<<Choice 페이지에서 choiceId 값 얻고 후기 작성하러 가기 버튼 클릭>>
// choice 페이지에서 choiceId 획득 후 GramWrite로 이동
const handleWriteReview = () => {
  if (!isMember || !userId) {
    toast("🍔 로그인 후 작성 가능합니다. 🍔");
    return;
  }
  // choiceId = 영수증 역할 (후기 작성 자격 증명)
  navigate(`/esg/gram/write/${choiceId}`);
};

<<Gram작성 페이지로 이동하고 후기 작성>>
const { choiceId: paramChoiceId } = useParams();
const { userId, token, choiceId: storeChoiceId } = useAuthStore();

// URL 파라미터 또는 store에서 choiceId 획득
const choiceId = Number(paramChoiceId ?? storeChoiceId);

const handleSubmit = () => {
  if (!loginUserId) {
    Swal.fire({ title: "로그인 후 이용해주세요." });
    return;
  }
  // choiceId 없으면 작성 불가 (영수증 없는 리뷰 방지)
  if (!choiceId || Number.isNaN(choiceId)) {
    Swal.fire({
      title: "선택 기록을 찾을 수 없습니다.",
      text: "비교하기에서 메뉴를 다시 선택한 뒤 후기를 작성해주세요.",
    });
    return;
  }

  const form = new FormData();
  form.append("title", gram.title.trim());
  form.append("content", gram.content.trim());
  form.append("userId", String(loginUserId));
  form.append("choiceId", String(choiceId)); // 핵심: 선택 기록 연결
  files.forEach((file) => form.append("files", file));

  axios
    .post(`${import.meta.env.VITE_BACKSERVER}/grams`, form, {
      headers: { Authorization: token },
    })
    .then(() => {
      Swal.fire({ title: "등록되었습니다.", icon: "success" })
        .then(() => navigate("/esg/gram"));
    });
};

ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

주요 기능을 설명하자면 Gram(후기) 페이지에서 작성 버튼을 누르면 두 가지 페이지의 선택지가 주어지는데 한 곳은 비교하기(Stat)페이지, 한 곳은 마이페이지입니다.<br>
비교하기 페이지로 이동하면 최대 3개의 메뉴를 선택할 수 있으며 메뉴를 선택하면 메뉴의 상세정보가 표시됩니다. <br>
고르고 “이걸로 선택” 버튼을 누르면 choice 페이지로 이동하며 choiceId 값을 얻습니다.<br>
(choiceId라는 거는 메뉴를 선택하고 나오는 아이디인데 예시를 들자면 우리가 실제 후기를 쓸 때 영수증이나 결제 내역이 있어야 후기가 쓸 수 있는 것처럼 구현했습니다.<br>
즉, 이 값(choiceId)이 없으면 후기를 작성할 수 없으며 Gram 페이지에서 작성 버튼만 누른다고 단순히 후기를 바로 쓸 수 있지 못 하게 중간 단계를 거쳐야 후기를 쓸 수 있게 구현했습니다.)<br>
choiceId를 얻고 후기 작성하러 가기 버튼을 누르고 후기 작성 페이지에서 파일 최대 5장까지 업로드를 할 수 있으며 오늘 내가 고른 메뉴의 후기를 작성할 수 있습니다.<br>
선택지 한 곳에 마이페이지 있는 이유는 choiceId를 얻고 나서 후기를 바로 쓰지 않고 싶을 때가 있습니다.<br>
그래서 마이페이지에 “최근 선택 메뉴”탭에 저장되어 있으며 이 탭에 기록이 남기 때문에 쓰고 싶을 때 원하는 대로 쓸 수 있습니다.

요약 순서:<br>
1) Gram 페이지(후기 목록 페이지)<br>
2) Stat 페이지(비교 페이지)<br>
3) Choice 페이지(메뉴 선택하고 choiceId를 얻음(주소창에 choiceId 표시됨))<br>
4) Gram 작성 페이지에서 후기 작성 가능

