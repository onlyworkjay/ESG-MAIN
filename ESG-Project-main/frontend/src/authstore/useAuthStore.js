import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Swal from "sweetalert2";
import useCompareStore from "../features/compare/store/useCompareStore";

import axios from "axios";

// 자동로그아웃을 위한 순서 설정 1-1 자동로그아웃 설정 하기 위한 변수 타입값 설정
let alertTimer, logoutTimer;

const useAuthStore = create(
  persist(
    (set, get) => ({
      userId: null,
      loginId: null,
      nickname: null,
      email: null,
      role: null,
      endTime: null,
      profileImg: null,
      token: null,
      isReady: false,
      createdAt: null,
      choiceId: null,

      // 1-2 타이머 정지 함수 설정
      stopLoginTimer: () => {
        if (alertTimer) clearTimeout(alertTimer);
        if (logoutTimer) clearTimeout(logoutTimer);
      },

      login: ({
        userId,
        loginId,
        nickname,
        email,
        role,
        endTime,
        profileImg,
        token,
        createdAt,
      }) => {
        set({
          userId,
          loginId,
          nickname,
          email,
          role,
          endTime,
          profileImg,
          token,
          createdAt,
          choiceId: null,
        });

        //1-3 타이머 예약 실행 -> 로그인을 하여 토큰을 받아온 시점에서 시간 계산
        get().startLoginTimer(endTime);
      },

      //1-4 토큰 연장 업데이트 함수
      updateToken: (newToken, newEndTime) => {
        //1-5기존 타이머를 먼저 멈추게 함 -> 새로운 토큰을 받아오기전 먼저 기존 타이머 로직을 멈추게 함
        get().stopLoginTimer();

        set({
          token: newToken,
          endTime: newEndTime,
        });

        //1-6 받아온 새로운 토큰을 헤더에 넣기
        axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        //1-7 새 만료시간으로 타이머 다시 가동 (무한 연장 가능)
        get().startLoginTimer(newEndTime);
      },

      // [추가된 로직] 사용자가 직접 버튼을 눌러 진행하는 수동 로그아웃 (컨펌창 표시)
      confirmLogout: async () => {
        const result = await Swal.fire({
          title: "로그아웃을 하시겠습니까",
          text: "지금 나가시면 서비스를 이용할 때 여러 제약이 걸릴 수 있습니다.",
          icon: "warning",
          confirmButtonText: "네",
          confirmButtonColor: "red",
          showCancelButton: true,
          cancelButtonText: "아니오",
          cancelButtonColor: "green",
        });

        //로그아웃을 하지 않는 경우
        if (!result.isConfirmed) {
          return;
        }

        // 컨펌 완료 시 실제 로그아웃 로직 수행
        await get().logout();
      },

      // 로그아웃 (실제 상태 초기화 및 서버 통신 - 수동/자동 공통 수행)
      logout: async () => {
        useCompareStore.getState().clearCompareList();

        //1-8 로그아웃 시에도 타이머 정지
        get().stopLoginTimer();
        //1-9 상태 클리어전에 현재 loginId확보 - 모든 로그아웃 경로 (수동 /타이머만료/)에서 로그 찍히게 하기 위해서
        const currentId = get().loginId;
        if (currentId) {
          await axios
            .post(
              `${import.meta.env.VITE_BACKSERVER}/users/logout/${currentId}`,
            )
            .catch(() => {}); //1-10 토큰 만료등 실패해도 무시
        }

        //1-11 다시 초기값으로 되돌리기
        set({
          userId: null,
          loginId: null,
          nickname: null,
          email: null,
          role: null,
          endTime: null,
          profileImg: null,
          token: null,
          isReady: true,
          createdAt: null,
          choiceId: null,
        });

        //1-12axios 기본 인증 헤더도 제거함
        delete axios.defaults.headers.common["Authorization"];
        //1-13 로컬 저장소에 남아 있는 auth-key도 제거
        localStorage.removeItem("auth-key");
      },

      //1-14 토큰 연장 시간 계산 함수
      startLoginTimer: (endTime) => {
        if (!endTime) return;
        //중복 실행 방지를 위해 이전 타이머 제거

        get().stopLoginTimer();

        //1-15 연장 시간 계산
        const targetEndTime = Number(endTime); //endTime이 문자열로 올 수 있으므로 숫자로 변환
        const currentTime = new Date().getTime();
        const remainingTime = endTime - currentTime;

        console.log(
          "체크된 endTime =",
          targetEndTime,
          "타입:",
          typeof targetEndTime,
        );
        console.log("현재시간 =", currentTime);
        console.log("남은시간 =", remainingTime);

        //55분 시점에 팝업 실행 예약 (만료 5분전)
        //테스트용 : 1분
        const alertTime = 5 * 60 * 1000;

        //remainingTime이 5분보다 크다면, 5분 전에 팝업 실행
        if (remainingTime > alertTime) {
          const timeToAlert = remainingTime - alertTime;

          //alertTimer를 정의(번호표 보관)
          alertTimer = setTimeout(() => {
            //사용자 편의를 위해 알람 설정 및 예약
            //->get().token -> 토큰이 아직 현재 사용 중인지 확인 -> 존재한다면 5분 남기고 알림창 뜨게 하기
            if (get().token) {
              Swal.fire({
                title: "로그인 연장",
                text: "로그아웃까지 5분 남았습니다. 연장하시겠습니까?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "연장할래요!",
                cancelButtonText: "아니오",
                confirmButtonColor: "#5b7252",
                cancelButtonColor: "red",
              }).then((result) => {
                if (result.isConfirmed) {
                  //연장버튼 누를 떄만 비동기 통신 발생
                  axios
                    .post(`${import.meta.env.VITE_BACKSERVER}/users/refresh`, {
                      loginId: get().loginId,
                    })
                    .then((res) => {
                      //성공 시 로직
                      get().updateToken(res.data.token, res.data.endTime);

                      Swal.fire({
                        title: "연장 완료",
                        text: "연장은 완료된 상태입니다.",
                        icon: "success",
                      });
                    })
                    .catch(() => {
                      get().logout();
                    });
                }
              });
            }
          }, timeToAlert); //setTimeOut을 닫기 위치 수정
        }

        //만료시 자동 로그 아웃(기존 유지)
        if (remainingTime > 0) {
          //logoutTimer라는 변수에 담아주기 (번호표 보관)
          logoutTimer = setTimeout(async () => {
            //이미 로그아웃된 상태라면 실행 방지
            if (get().token) {
              // 자동 로그아웃 시점에 기존 연장 질문 창이 열려있다면 닫아줌
              Swal.close();

              // 컨펌창 없이 즉시 상태 초기화 및 로그아웃 프로세스 진행
              await get().logout();

              Swal.fire({
                title: "로그인 시간이 지났습니다",
                text: "세션이 만료되어 자동 로그아웃 되었습니다.",
                icon: "warning",
              });
            }
          }, remainingTime);
        } else {
          //이미 만료된 경우 즉시 로그아웃 처리
          get().logout();
        }
      },

      //-> 이미지는 자주 수정되는데 수정될 때마다 기존 로그인 로직에서 전체도 다같이 바뀜
      //-> 따라서 부분 수정하는 경우에는 이렇게 따로 빼서 이 영역만 가능하게 함

      //isReady는 로그인 상태가 초기화되는 것을 방지하기 위한 설정.
      // 로그인 상태가 유지되는 동안 isReady는 true로 설정되고, 새로고침 시 초기화되어 false로 설정됨.
      // 이를 통해 로그인 상태가 유지되는 동안 isReady는 true로 설정되고,
      //  새로고침 시 초기화되어 false로 설정됨.
      //localStorage에서 데이터를 불러오는데 시간이 살짝 걸림. -> 근데 실제로는 로그인 되어있음
      //로그인 상태인데도 로그 아웃처럼 보이는 버그 발생.
      //따라서 isReady를  사용함. -> 즉 버퍼링으로 인한 피해 최소화

      setReady: (ready) => {
        set({
          isReady: ready,
        });
      },
      setProfileImg: (profileImg) => {
        set({ profileImg });
      },

      setNickname: (nickname) => {
        set({ nickname });
      },

      setEmail: (email) => {
        set({ email });
      },

      // 후기 작성 페이지에서 현재 선택 기록을 참조할 수 있도록 choiceId를 저장합니다.
      setChoiceId: (choiceId) => {
        set({ choiceId });
      },
    }),
    //새로고침해도 로그인 상태 유지하게 해주는 기능
    {
      name: "auth-key",
      storage: createJSONStorage(() => localStorage),

      //새로고침해도 저장할 데이터를 선택
      //->6개 데이터중 5개만 저장하고 계속 저장하고 isReady는 새로고침시 초기화하기위한 설정
      //partialize를 설정하지 않으면 모든 정보를 브라우저에 계속 저장.

      //기존 방식은 return을 사용했지만
      //화살표 함수에서 객체를 바로 반환하는 (state) => ({ ... }) 사용
      //onRehydrateStorage: () => (state) => 이 로직이 실행가능
      //==>
      partialize: (state) => {
        return {
          userId: state.userId,
          loginId: state.loginId,
          nickname: state.nickname,
          email: state.email,
          role: state.role,
          endTime: state.endTime,
          profileImg: state.profileImg,
          token: state.token,
          createdAt: state.createdAt,
          choiceId: state.choiceId,
        };
      },

      //2-1 새로고침시  persist가 데이터를 복구하 후 실행되는 함수
      //partialize 괄호 밖, persist 설정 객체 안에 위치해야 한다.
      // 이로직의 특징==>
      // 로그인시에도 타이머가 돌고, 새로고침을 하더라도 onRehydrateStorage가
      //남은 시간을 계산해 다시 타이머를 맞추는 역할.
      onRehydrateStorage: () => (state) => {
        //데이터가 아예 없는 첫방문때도 이 콜백이 실행되며,
        //그때 state 인자는 undefined가 될 수 있음
        if (!state) {
          console.log("로컬 스토리지에 데이터가 없습니다.");
          return;
        }

        //디버깅용
        console.log("로컬 스토리지에서 데이터를 불러왔습니다.", state);

        //1.데이터 복구가 완료된 후, isReady를 true로 설정
        //만약 isReady가 없다면, 사용자는 새로고침할 때마다 로그인이 되어 있음에도 불구하고 아주 짧은 순간(0.01초) 동안 "로그인 버튼"이 보였다가
        // 갑자기 "로그아웃 버튼"으로 바뀌는 깜빡임 현상이 발생
        //왜냐하면 리엑트의 속도와 로컬스토리지에서 데이터를 읽어오는 과정과 차이가 있기 떄문
        state.setReady(true);

        if (state.token) {
          //새로고침 후 토큰이 있다면 axios 헤더 재설정 및 타이머 재가동
          axios.defaults.headers.common["Authorization"] =
            `Bearer ${state.token}`;
          //타이머 재설정
          state.startLoginTimer(state.endTime);
        }
      },
    },
  ),
);

export default useAuthStore;
