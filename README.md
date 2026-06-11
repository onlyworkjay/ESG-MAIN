<KH정보교육원 두 번째 프로젝트>

Final Project PDF: [📄 파이널 프로젝트 발표자료](./ESG_파이널프로젝트.pdf)

Final Project (2026.5.11 ~ 2026.6.9)

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

