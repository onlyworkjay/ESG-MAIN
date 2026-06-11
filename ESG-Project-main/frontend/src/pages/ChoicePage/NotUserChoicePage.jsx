import { useMemo } from "react";
import { useLocation } from "react-router-dom";

import useCompareStore from "../../features/compare/store/useCompareStore";
import ChoiceResultView from "./ChoiceResultView";

const NotUserChoicePage = () => {
  const location = useLocation();

  const compareList = useCompareStore((state) => state.compareList);

  const items = useMemo(() => {
    return location.state?.menus?.length ? location.state.menus : compareList;
  }, [compareList, location.state]);

  const selectedProductId = location.state?.selectedProductId;

  // 비회원 선택 완료 화면 담당자에게 넘겨줄 데이터 묶음입니다.
  // 비회원은 DB 저장이 없으므로 choiceId와 choiceGroupId는 null입니다.
  const choiceResultData = {
    choiceId: null,
    choiceGroupId: null,
    isMember: false,
    selectedProductId,
    items,
  };

  return (
    <ChoiceResultView
      choiceData={choiceResultData}
    />
  );
};

export default NotUserChoicePage;
