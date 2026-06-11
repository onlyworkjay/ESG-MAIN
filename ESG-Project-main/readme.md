### 김경호 화이팅!!



폰트 : G마켓 산스 TTF



폰트 사용법  module.css 적용시

.title{

&#x09;font-family: bold

}



&#x09;\*bold :  두꺼움

&#x09;\*medium : 중간

&#x09;\*light: 기본 (font\_famaily 작성하지 않을시 기본값으로 적용 app.css)



border-radius 사용법

.title{

&#x09;border-radius : var(--radius-lg)

}



&#x09;\*radius-lg : 8px

&#x09;\*radius-md : 12px

&#x09;\*radius-sm : 20px



:root {

&#x20; --bun: #e7b56a; /\*토스트번\*/

&#x20; --green: #8bc34a; /\*양상추\*/

&#x20; --tomato: #ff5a4f; /\*토마토\*/

&#x20; --patty: #4a2e24; /\*패티\*/

&#x20; --background: #2a2522; /\*텍스트\*/

&#x20; --ivory: #fff8ec; /\*배경\*/

&#x20; --pickle: #7ed6a5; /\*피클\*/



&#x20; --radius-sm: 8px;

&#x20; --radius-md: 12px;

&#x20; --radius-lg: 20px;

}



/\*공통\*/

\* {

&#x20; margin: 0;

&#x20; padding: 0;

&#x20; box-sizing: border-box;

&#x20; font-family: light;

}

/\*BODY 초기화\*/

body {

&#x20; background-color: var(--background);

&#x20; color: var(--ivory);

&#x20; line-height: 1.4; /\*줄간격\*/

&#x20; -webkit-tap-highlight-color: transparent; /\*모바일 파란배경 제거\*/

}

/\* 리스트 스타일 제거 \*/

ul,

ol {

&#x20; list-style: none;

}

/\* 이미지 반응형 \*/

img {

&#x20; max-width: 100%;

&#x20; display: block;

}

/\* 링크 초기화 \*/

a {

&#x20; color: inherit;

&#x20; text-decoration: none;

}

/\*버튼 초기화\*/

button {

&#x20; border: none;

&#x20; background: none;

&#x20; cursor: pointer;

&#x20; font: inherit;

}

/\*INPUT 초기화\*/

input,

textarea,

select {

&#x20; font: inherit;

&#x20; outline: none;

&#x20; border: none;

}



BACKEND\_구조 및 규칙



각자 기능에 맞는 클래스를 만들어서 사용



메소드 작성시 //주석으로 작성자와 기능을 삽입

예시)

//김경호 - 로그인

public void helloWolrd (){

&#x09;

}



com.project.esg

├── global

│   ├── config

│   │   └── WebConfig.java

│   ├── security

│   │   ├── SpringSecurityConfig.java

│   │   ├── JwtAuthFilter.java

│   │   └── JwtUtils.java

│   └── util

│       ├── EmailSender.java

│       └── FileUtils.java

│

├── user

│   ├── controller

│   ├── service

│   ├── dao

│   └── vo

│

├── product

│   ├── controller

│   ├── service

│   ├── dao

│   └── vo

│

├── choice

│   ├── controller

│   ├── service

│   ├── dao

│   └── vo

│

├── gram

│   ├── controller

│   ├── service

│   ├── dao

│   └── vo

│

├── post

│   ├── controller

│   ├── service

│   ├── dao

│   └── vo

│

├── comment

│   ├── controller

│   ├── service

│   ├── dao

│   └── vo

│

├── report

│   ├── controller

│   ├── service

│   ├── dao

│   └── vo

│

├── favorite

│   ├── controller

│   ├── service

│   ├── dao

│   └── vo

│

├── like

│   ├── controller

│   ├── service

│   ├── dao

│   └── vo

│

├── suggestion

│   ├── controller

│   ├── service

│   ├── dao

│   └── vo

│

└── admin

&#x20;   ├── controller

&#x20;   ├── service

&#x20;   ├── dao

&#x20;   └── vo



mapper.xml 은  ChoiceMapper.xml 을 복사후 파스칼 규칙(첫글자 모두 대문자)으로 이름 변경

namespace 자신의 인터페이스(dao)의 경로를 작성 후 사용



src/main/resources/mapper

├── UserMapper.xml

├── ProductMapper.xml

├── ChoiceMapper.xml

├── GramMapper.xml

├── PostMapper.xml

├── CommentMapper.xml

├── ReportMapper.xml

├── FavoriteMapper.xml

├── LikeMapper.xml

├── SuggestionMapper.xml

└── AdminMapper.xml

