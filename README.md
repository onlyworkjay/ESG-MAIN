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

# 🍔 ESG - 햄버거 메뉴 비교 및 커뮤니티 사이트

팀 프로젝트 | 다인 개발

---

## 🛠 기술 스택

| 분류 | 기술 |
|------|------|
| **Frontend** | React, JSX, CSS Modules, Vite |
| **Backend** | Spring Boot, MyBatis, Spring Security |
| **Database** | MySQL |
| **Cloud** | AWS S3 (이미지 저장) |
| **인증** | JWT (jjwt) |
| **기타** | Lombok, Thumbnailator (이미지 압축) |
| **버전 관리** | Git |

---

## 📋 기능 목록

| 분류 | 기능 | 설명 | 로그인 여부 |
|------|------|------|:-----------:|
| **회원** | 회원가입 | 아이디·닉네임·비밀번호·이메일(선택) 입력 후 가입 / 이메일·아이디·닉네임 중복 불가 | X |
| | 로그인 | 아이디·비밀번호 입력 후 JWT 토큰 발급 / 정지 계정 로그인 차단 | X |
| | 관리자 로그인 | 별도 관리자 전용 로그인 페이지 (/showmethemoney) | X |
| | 아이디 찾기 | 닉네임·이메일 일치 확인 후 이메일로 아이디 전송 | X |
| | 비밀번호 찾기 | 아이디·이메일 일치 확인 후 임시 비밀번호 이메일 전송 | X |
| | 토큰 재발급 | 토큰 만료 5분 전 자동 재발급 (세션 연장) | O |
| | 회원 탈퇴 | 아이디 기준 회원 삭제 | O |
| **마이페이지** | 프로필 이미지 변경 | 이미지 업로드 및 기본 이미지 초기화 | O |
| | 닉네임·이메일 수정 | 닉네임 중복 검사 후 수정 / 이메일 수정 | O |
| | 내 게시글 조회 | 본인이 작성한 게시글 목록 조회 | O |
| | 즐겨찾기한 회원 목록 | 즐겨찾기한 회원 목록 조회 | O |
| **메뉴 탐색 (Eat)** | 메뉴 목록 조회 | 브랜드별·조건별 필터링 및 페이지네이션 | X |
| | 메뉴 상세 조회 | 개별 메뉴 상세 정보 조회 | X |
| | 브랜드 목록 조회 | 카테고리용 브랜드 목록 조회 | X |
| | 메뉴 제보하기 | 회원이 메뉴 정보 오류 제보 등록 | O |
| | 내 제보 내역 | 마이페이지에서 본인 제보 내역 조회 | O |
| **메뉴 선택 (Choice)** | 전체 상품 조회 | 비교·랜덤 추첨용 전체 활성 상품 목록 조회 | X |
| | 메뉴 선택 저장 | 비교 후 최종 선택한 메뉴 저장 및 choiceId 발급 | O |
| | 일일 선택 횟수 확인 | 하루 선택 가능 횟수 확인 | O |
| | 최근 선택 조회 | 마이페이지에서 최근 선택 이력 조회 | O |
| | 선택 결과 조회 | choiceId로 선택 그룹 전체 조회 | X |
| **후기 (Gram)** | 후기 목록 조회 | 전체 후기 게시글 목록 (필터·페이지네이션) | X |
| | 내 후기 조회 | 본인이 작성한 후기 목록 조회 | O |
| | 후기 등록 | 이미지 포함 후기 작성 (choiceId 보유자만 가능) | O |
| | 후기 상세 조회 | 후기 단건 조회 (조회수 포함) | X |
| | 후기 수정 | 본인 후기 수정 (이미지 추가·삭제 포함) | O |
| | 후기 삭제 | 본인 후기 삭제 | O |
| | 좋아요 토글 | 후기 좋아요 등록·취소 | O |
| | 좋아요 상태 조회 | 특정 후기의 좋아요 상태 조회 | X |
| | 후기 신고 | 후기 신고 등록 | O |
| | 댓글 조회·등록·수정·삭제 | 후기별 댓글 및 대댓글 CRUD | O |
| **게시판 (Post)** | 게시글 목록 조회 | 검색·필터·페이지네이션 | X |
| | 게시글 등록 | 이미지 포함 게시글 작성 | O |
| | 게시글 상세 조회 | 게시글 단건 조회 | X |
| | 게시글 수정 | 본인 게시글 수정 (이미지 추가·삭제 포함) | O |
| | 게시글 삭제 | 본인 게시글 삭제 | O |
| | 좋아요 등록·취소 | 게시글 좋아요 토글 | O |
| | 게시글 신고 | 신고 등록·조회·취소 | O |
| **프로필** | 프로필 조회 | 특정 회원 프로필 조회 | X |
| | 회원 즐겨찾기 등록·삭제 | 다른 회원 즐겨찾기 | O |
| | 회원 신고 | 회원 신고 등록·조회·삭제 | O |
| **즐겨찾기 메뉴 (Favorite)** | 즐겨찾기 목록 | 내 즐겨찾기 메뉴 목록 조회 | O |
| | 즐겨찾기 여부 확인 | 특정 메뉴 즐겨찾기 여부 확인 | O |
| | 즐겨찾기 등록·취소 | 메뉴 즐겨찾기 추가·삭제 | O |
| **대시보드** | 메인 통계 | 사용자 집계 숫자 조회 | X |
| | 인기 비교 조합 | 오늘의 인기 비교 조합 목록 조회 | X |
| **관리자 (Admin)** | 회원 목록 조회 | 검색·필터·정렬 포함 회원 목록 조회 | O |
| | 회원 상세 조회 | 개별 회원 상세 정보 조회 | O |
| | 회원 정지 | 회원 정지 처리 | O |
| | 메뉴 등록·수정 | 관리자 메뉴 등록 및 수정 (이미지 포함) | O |
| | 메뉴 목록·상세 조회 | 관리자용 메뉴 목록 및 상세 조회 | O |
| | 신고 목록 조회 | 상태별 신고 목록 조회 | O |
| | 게시글·후기 숨김 처리 | 신고된 게시글·후기 숨김 | O |
| | 신고 반려 처리 | 신고 반려 처리 | O |
| | 메뉴 신고 처리 | 메뉴 신고 승인·반려 | O |
| | 관리자 대시보드 | 관리자용 통계 대시보드 조회 | O |
| **마스터 (Master)** | 브랜드 등록·수정·삭제 | 브랜드 관리 | O |
| | 관리자 계정 생성 | 관리자 계정 생성 | O |
| | 관리자 목록 조회 | 전체 관리자 목록 조회 | O |
| | 관리자 정지·복구 | 관리자 계정 정지 및 복구 | O |
| | 이메일·닉네임 중복 확인 | 관리자 생성 시 중복 검사 | O |
| **이메일 인증** | 인증번호 전송 | 회원가입·아이디 찾기용 이메일 인증번호 발송 | X |
| **랭킹·인기 메뉴** | 주간 사용자 랭킹 | 최근 7일 사용자 랭킹 조회 | X |
| | 주간 인기 메뉴 | 최근 7일 인기 메뉴 조회 | X |

---

## 📡 API 명세

### 👤 회원 (User)

| Method | URL | 설명 | 인증 필요 |
|--------|-----|------|:---------:|
| POST | /users/join | 회원가입 | X |
| GET | /users/check-id?loginId= | 아이디 중복 확인 | X |
| POST | /users/login | 로그인 (JWT 발급) | X |
| POST | /users/adminlogin | 관리자 로그인 | X |
| POST | /users/find-id | 아이디 찾기 (이메일 전송) | X |
| POST | /users/find-pw | 비밀번호 찾기 (임시 비밀번호 이메일 전송) | X |
| POST | /users/refresh | 토큰 재발급 | O |
| POST | /users/profile-image | 프로필 이미지 변경 | O |
| PATCH | /users/profile-image/default | 기본 프로필 이미지로 초기화 | O |
| PATCH | /users/email | 이메일 수정 | O |
| PATCH | /users/nickname | 닉네임 수정 | O |
| GET | /users/my-posts | 내 게시글 목록 조회 | O |
| GET | /users/profile/favorite | 즐겨찾기한 회원 목록 조회 | O |
| DELETE | /users/delete?loginId= | 회원 탈퇴 | O |
| GET | /users/ranking | 주간 사용자 랭킹 | X |
| GET | /users/popular-menus | 주간 인기 메뉴 | X |

### 🔐 인증 (Auth)

| Method | URL | 설명 | 인증 필요 |
|--------|-----|------|:---------:|
| GET | /auth/me | 현재 로그인 사용자 정보 조회 | O |

### 📧 이메일 인증 (Mail)

| Method | URL | 설명 | 인증 필요 |
|--------|-----|------|:---------:|
| POST | /users/email-verification | 이메일 인증번호 발송 | X |

### 🍔 메뉴 탐색 (Eat)

| Method | URL | 설명 | 인증 필요 |
|--------|-----|------|:---------:|
| GET | /eats | 메뉴 목록 조회 (필터·페이지네이션) | X |
| GET | /eats/{productId} | 메뉴 상세 조회 | X |
| GET | /eats/brands | 브랜드 목록 조회 | X |
| POST | /eats/suggestions | 메뉴 제보 등록 | O |
| GET | /eats/suggestions?userId= | 내 제보 내역 조회 | O |

### 🎯 메뉴 선택 (Choice)

| Method | URL | 설명 | 인증 필요 |
|--------|-----|------|:---------:|
| GET | /api/product-items | 전체 상품 목록 조회 | X |
| POST | /choices | 메뉴 선택 저장 | O |
| GET | /choices/users/{userId}/daily-status | 일일 선택 횟수 확인 | O |
| GET | /choices/users/{userId}/latest | 최근 선택 이력 조회 | O |
| GET | /choices/{choiceId} | 선택 결과 조회 | X |

### 📝 후기 (Gram)

| Method | URL | 설명 | 인증 필요 |
|--------|-----|------|:---------:|
| GET | /grams | 후기 목록 조회 | X |
| GET | /grams/my-grams | 내 후기 목록 조회 | O |
| POST | /grams | 후기 등록 (이미지 포함) | O |
| GET | /grams/{gramNo} | 후기 상세 조회 | X |
| PUT | /grams/{gramNo} | 후기 수정 | O |
| DELETE | /grams/{gramNo} | 후기 삭제 | O |
| POST | /grams/{gramId}/like | 좋아요 토글 | O |
| GET | /grams/{gramId}/like | 좋아요 상태 조회 | X |
| POST | /grams/{gramId}/report | 후기 신고 | O |
| GET | /grams/reports/user/{userId} | 내 신고 내역 조회 | O |
| GET | /grams/{gramId}/comments | 댓글 목록 조회 | X |
| POST | /grams/{gramId}/comments | 댓글 등록 | O |
| PUT | /grams/{gramId}/comments/{commentNo} | 댓글 수정 | O |
| DELETE | /grams/{gramId}/comments/{commentNo} | 댓글 삭제 | O |
| GET | /grams/check/{choiceId}?userId= | 후기 작성 가능 여부 확인 | O |
| GET | /grams/choices/{choiceId}/written?userId= | 후기 작성 여부 확인 | O |

### 📰 게시판 (Post)

| Method | URL | 설명 | 인증 필요 |
|--------|-----|------|:---------:|
| GET | /posts | 게시글 목록 조회 | X |
| POST | /posts | 게시글 등록 (이미지 포함) | O |
| GET | /posts/{postId} | 게시글 상세 조회 | X |
| PUT | /posts/{postId} | 게시글 수정 | O |
| DELETE | /posts/{postId} | 게시글 삭제 | O |
| POST | /posts/{postId}/likes | 좋아요 등록 | O |
| DELETE | /posts/{postId}/likes | 좋아요 취소 | O |
| POST | /posts/{postId}/reports | 게시글 신고 | O |
| GET | /posts/{postId}/reports | 신고 조회 | O |
| DELETE | /posts/{postId}/reports | 신고 취소 | O |

### 👤 프로필 (Profile)

| Method | URL | 설명 | 인증 필요 |
|--------|-----|------|:---------:|
| GET | /profile/{targetId} | 회원 프로필 조회 | X |
| POST | /profile/favorite/{targetId} | 회원 즐겨찾기 등록 | O |
| DELETE | /profile/favorite/{targetId} | 회원 즐겨찾기 삭제 | O |
| GET | /profile/report/{targetId} | 회원 신고 조회 | O |
| POST | /profile/report/{targetId} | 회원 신고 등록 | O |
| DELETE | /profile/report/{targetId}/{reportId} | 회원 신고 삭제 | O |

### ⭐ 즐겨찾기 메뉴 (Favorite)

| Method | URL | 설명 | 인증 필요 |
|--------|-----|------|:---------:|
| GET | /favorites?userId= | 즐겨찾기 목록 조회 | O |
| GET | /favorites/check/{productId}?userId= | 즐겨찾기 여부 확인 | O |
| POST | /favorites | 즐겨찾기 등록 | O |
| DELETE | /favorites/{productId}?userId= | 즐겨찾기 취소 | O |

### 📊 대시보드 (Dashboard)

| Method | URL | 설명 | 인증 필요 |
|--------|-----|------|:---------:|
| GET | /dashboard/main | 메인 통계 조회 | X |
| GET | /dashboard/popular-comparison-combos | 인기 비교 조합 조회 | X |

### 🔧 관리자 (Admin)

| Method | URL | 설명 | 인증 필요 |
|--------|-----|------|:---------:|
| GET | /admin/getAllergy | 알레르기 목록 조회 | O |
| GET | /admin/getBrand | 브랜드 목록 조회 | O |
| POST | /admin/insertMenue | 메뉴 등록 (이미지 포함) | O |
| GET | /admin/getMenueList | 메뉴 목록 조회 | O |
| GET | /admin/getMenueDetail?productId= | 메뉴 상세 조회 | O |
| PATCH | /admin/updateMenue | 메뉴 수정 | O |
| GET | /admin/selectUsers | 회원 목록 조회 (검색·필터·정렬) | O |
| GET | /admin/getMemberDetail?userId= | 회원 상세 조회 | O |
| PATCH | /admin/groundUser | 회원 정지 처리 | O |
| GET | /admin/getReportList?page=&status= | 신고 목록 조회 | O |
| PATCH | /admin/hidePost | 게시글 숨김 처리 | O |
| PATCH | /admin/hideGram | 후기 숨김 처리 | O |
| PATCH | /admin/denyReport | 신고 반려 처리 | O |
| GET | /admin/dashboard | 관리자 대시보드 조회 | O |
| GET | /admin/getMenueReports?page=&status= | 메뉴 신고 목록 조회 | O |
| PATCH | /admin/menueReportResolved | 메뉴 신고 승인 | O |
| PATCH | /admin/menueReportRejected | 메뉴 신고 반려 | O |

### 👑 마스터 (Master)

| Method | URL | 설명 | 인증 필요 |
|--------|-----|------|:---------:|
| POST | /master/createAdmin | 브랜드 등록 | O |
| GET | /master/getBrandList | 브랜드 목록 조회 | O |
| DELETE | /master/deleteBrand?brandName= | 브랜드 삭제 | O |
| PATCH | /master/patchBrand | 브랜드 수정 | O |
| POST | /master/youHadMeAtHello/{loginId} | 마스터 비밀번호 확인 | O |
| GET | /master/checkId?loginId= | 관리자 아이디 중복 확인 | O |
| POST | /master/insertAdmin | 관리자 계정 생성 | O |
| GET | /master/selectAdmins | 관리자 목록 조회 | O |
| PATCH | /master/suspend?loginId=&suspensionReason= | 관리자 정지 | O |
| PATCH | /master/restoreStatus?loginId= | 관리자 정지 복구 | O |
| POST | /master/emailDupCheck?email= | 이메일 중복 확인 | O |
| POST | /master/nicknameDupCheck?nickname= | 닉네임 중복 확인 | O |


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

