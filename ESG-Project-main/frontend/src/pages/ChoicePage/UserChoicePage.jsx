import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";

import useAuthStore from "../../authstore/useAuthStore";
import ChoiceResultView from "./ChoiceResultView";

const UserChoicePage = () => {
  const { choiceId } = useParams();
  const location = useLocation();

  const setChoiceId = useAuthStore((state) => state.setChoiceId);

  const fallbackItems = useMemo(() => location.state?.menus ?? [], [location]);
  const fallbackSelectedProductId = location.state?.selectedProductId;
  const fallbackChoiceGroupId = location.state?.choiceGroupId ?? null;

  const [items, setItems] = useState(fallbackItems);
  const [selectedProductId, setSelectedProductId] = useState(
    fallbackSelectedProductId,
  );
  const [choiceGroupId, setChoiceGroupId] = useState(fallbackChoiceGroupId);
  const [loading, setLoading] = useState(!fallbackItems.length);
  const [error, setError] = useState("");

  useEffect(() => {
    setChoiceId(Number(choiceId));

    axios
      .get(`${import.meta.env.VITE_BACKSERVER}/choices/${choiceId}`)
      .then((res) => {
        setItems(res.data.items ?? []);
        setSelectedProductId(res.data.selectedProductId);
        setChoiceGroupId(res.data.choiceGroupId);
        setError("");
      })
      .catch((err) => {
        console.error("선택 결과 조회 실패:", err);
        setError("저장된 선택 결과를 불러오지 못했습니다.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [choiceId, setChoiceId]);

  // 선택 완료 화면 담당자에게 넘겨줄 데이터 묶음입니다.
  // UI는 ChoiceResultView에서 자유롭게 바꾸고, 이 데이터 구조만 받아서 사용하면 됩니다.
  const choiceResultData = {
    choiceId: Number(choiceId),
    choiceGroupId,
    isMember: true,
    selectedProductId,
    items,
  };

  return (
    <ChoiceResultView
      choiceData={choiceResultData}
      loading={loading}
      error={error}
    />
  );
};

export default UserChoicePage;
