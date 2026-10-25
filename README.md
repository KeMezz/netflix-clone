# Netflix Clone

다양한 영화나 TV 시리즈 정보를 열람할 수 있는 리액트 기반 웹앱니다. 대부분 디자인은 넷플릭스를 클론하여 가져왔습니다.

## 사용된 기술

- React JS (w/ CRA)
- TypeScript
- React Router Dom
- Recoil
- Framer Motion
- React Hook Form
- Styled Components
- React Query

## TMDB 키 입력과 정적 배포

공유 TMDB 키를 번들에 넣지 않습니다. 데스크톱(너비 1200px 초과)에서 본인의 v3 API 키를 입력해야 TMDB API를 호출합니다. 키 입력 전에도 기존 Google Fonts와 Font Awesome CDN 리소스 요청은 발생합니다.

키는 API 모듈의 메모리에 보관하고 localStorage, sessionStorage, 쿠키에 저장하지 않습니다. React 상태와 query key에는 키 대신 세대 번호를 사용합니다. 키 교체·끄기는 관련 query를 취소하고 캐시를 제거한 다음 모듈과 React 상태를 갱신합니다. fetch에 AbortSignal을 전달하므로 진행 중인 요청도 취소하며, 화면 이동으로 마지막 query 구독이 해제되어도 요청이 취소됩니다. 입력 폼은 기존 키를 미리 채우지 않고 적용 후 비웁니다.

앱 unmount와 `pagehide`에서도 정리합니다. `pagehide`는 bfcache(브라우저가 뒤로가기를 위해 페이지를 메모리에 보관하는 기능) 진입도 포함합니다. 이벤트가 실행되지 않는 브라우저 강제 종료까지 정리 코드 실행을 보장하지 않으며, JavaScript 문자열의 GC 시점이나 즉시 완전 파기도 보장하지 않습니다. 브라우저·확장 프로그램·비밀번호 관리자 동작은 앱이 통제할 수 없습니다. 키는 DevTools와 TMDB로 보내는 요청에서 볼 수 있습니다. 취소 전에 서버에 도착한 요청은 되돌릴 수 없습니다. 정적 번들에 `REACT_APP_*` 환경변수로 키를 넣어도 값이 인라인되어 누구나 추출할 수 있습니다.

401/403을 포함한 4xx 오류는 자동 재시도하지 않습니다. 네트워크 오류와 5xx는 요청당 500ms 후 한 번만 재시도하고 실패 항목과 복구 버튼을 표시합니다. 키가 입력되었다는 표시는 유효성 검증을 뜻하지 않습니다. 성공한 홈·TV·검색 섹션은 부분 오류가 있어도 표시합니다. 검색은 기존 동작을 개선하여 영화가 0건이어도 TV 결과가 있으면 표시하며, 두 종류가 모두 0건일 때만 결과 없음으로 표시합니다.

[TMDB 인증 문서](https://developer.themoviedb.org/docs/authentication-application)는 계정 설정에서 발급하는 API 키와 Read Access Token이 같은 접근 수준을 제공한다고 설명합니다. 확인한 [API 약관](https://www.themoviedb.org/api-terms-of-use), [인증](https://developer.themoviedb.org/docs/authentication-application), [시작 안내](https://developer.themoviedb.org/docs/getting-started), [FAQ](https://developer.themoviedb.org/docs/faq), [요청 제한](https://developer.themoviedb.org/docs/rate-limiting) 5개 문서에서는 앞선 PR 설명의 키 기밀·공유 금지·모든 트래픽의 계정 소유자 책임 주장을 뒷받침하는 명시 규정을 찾지 못했습니다. 다른 문서나 별도 계약에도 없다는 결론은 아닙니다. 이 변경은 계정에 연결된 API 자격증명을 공개 배포하지 않기 위한 보수적인 조치입니다. 공식 문서의 출처 표시·로고·비보증 고지와 상업 이용 계약 조건은 별도로 확인해야 합니다.

구 키는 Git 이력뿐 아니라 `origin/main` 소스와 기존 `origin/gh-pages` 번들 및 sourcemap에도 남아 있습니다. 소유자가 구 키를 폐기하고 필요한 경우 재발급해야 합니다. 이 PR을 merge해도 Pages는 바뀌지 않습니다. 기존 배포에서 키를 제거하려면 소유자가 검토 후 별도로 재배포해야 합니다. 이 PR 작업에서는 배포나 키 폐기를 수행하지 않습니다.

## 개발과 검증

Yarn 1과 `yarn.lock`을 사용합니다. 지원 중인 Node 22 또는 24에서 다음을 실행합니다.

```sh
yarn install --frozen-lockfile
CI=true yarn test --watchAll=false
CI=true yarn build
```

테스트는 합성 키와 fetch mock만 사용합니다. 실제 TMDB나 analytics로 요청하지 않습니다. GitHub Pages의 기존 deep-link 404 문제는 별도로 남아 있습니다.
