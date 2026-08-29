# 이스포츠 연구실 홈페이지

한신대학교 이스포츠 연구실 소개 페이지입니다. 빌드 도구 없이 HTML/CSS/JS 파일만으로 동작합니다.

---

## 1. 폴더 구조

```
lab-site/
├─ index.html                 홈 (감성 문구 + 소개글 + 공지사항)
├─ history.html               역사·연혁
├─ research.html              학술 활동
├─ outreach.html              대외 활동
├─ members.html               랩 구성원
├─ qna.html                   Q&A
├─ assets/
│  ├─ css/style.css           색·서체·여백
│  ├─ js/data.js       ★      내용 전부 — 평소 수정은 여기만
│  ├─ js/app.js               데이터를 화면으로 그리는 코드
│  └─ images/                 구성원 사진, 활동 사진
├─ .vscode/                   VS Code 설정 (자동 새로고침 등)
└─ .github/workflows/         GitHub Pages 자동 배포
```

**상단바와 푸터는 HTML 파일에 적혀 있지 않습니다.** `data.js` 의 `NAV` 를 읽어 `app.js` 가 모든 페이지에 자동으로 넣습니다. 메뉴를 추가하거나 이름을 바꾸실 때 파일 6개를 열 필요 없이 `NAV` 한 곳만 고치시면 됩니다.

---

## 2. 시작하기

### 열기

VS Code에서 **File → Open Folder**로 `lab-site` 폴더를 엽니다. 파일 하나가 아니라 폴더를 여셔야 설정이 적용됩니다.

### 확장 설치

폴더를 열면 오른쪽 아래에 "이 작업 영역에 권장 확장이 있습니다" 알림이 뜹니다. **Install All**을 누르세요. 안 뜨면 확장 탭에서 `Live Server`를 직접 설치합니다.

### 실행

`index.html`을 연 상태에서 **오른쪽 아래 `Go Live` 버튼 클릭** 또는 파일에 우클릭 → `Open with Live Server`.

브라우저가 `http://127.0.0.1:5500`으로 열립니다. 이제 파일을 저장할 때마다 화면이 자동으로 새로고침됩니다.

> Live Server 없이 `index.html`을 더블클릭해도 잘 열립니다. 다만 자동 새로고침은 안 되고, 매번 F5를 눌러야 합니다.

---

## 3. 내용 수정하기

`assets/js/data.js` 하나만 열면 됩니다.

| 고칠 내용 | 찾을 위치 |
| --- | --- |
| 연구실 이름·주소·이메일 | `const SITE` |
| 상단 메뉴 이름·순서 | `const NAV` |
| 첫 화면 큰 문구·소개글 | `const INTRO` |
| 연구 갈래 3칸 | `const AREAS` |
| 공지사항 | `const NOTICES` |
| 하위 페이지 제목·설명 | `const PAGES` |
| 연혁 | `const HISTORY` |
| 논문·학회 발표·수상 | `const PUBLICATIONS` |
| 뉴스 기사 | `const NEWS` |
| 교내 활동 | `const CAMPUS` |
| 교외 활동 | `const EXTERNAL` |
| 교수님 정보 | `const FACULTY` |
| 학생 정보 | `const STUDENTS` |
| 자주 묻는 질문 | `const FAQ` |

**항목 추가 방법** — 기존 `{ ... }` 한 덩어리를 통째로 복사해 쉼표 뒤에 붙여넣고 내용만 바꿉니다. 마지막 항목 뒤에는 쉼표를 붙이지 않습니다.

**날짜 형식** — 대외 활동의 `date`는 반드시 `"2026-05-20"` 형태로 적습니다. 최신순 정렬에 쓰이므로 순서는 신경 쓰지 않아도 됩니다.

**사진 넣기** — 파일을 `assets/images/`에 넣고 `photo:"assets/images/hong.jpg"`처럼 적습니다. 세로가 긴 3:4 비율이 가장 예쁘게 나오고, 한 장당 500KB 이하를 권합니다. 비워 두면 이름 첫 글자 타일이 대신 표시됩니다.

### 화면이 하얗게 나온다면

`data.js`에서 쉼표나 중괄호를 빠뜨린 경우입니다. 브라우저에서 **F12 → Console** 탭을 보면 몇 번째 줄이 문제인지 알려줍니다.

---

## 4. 색상 바꾸기

`assets/css/style.css` 맨 위 `:root` 안의 값만 바꾸면 전체 톤이 한 번에 바뀝니다.

```css
--ink:    #0F1626;   /* 상단바·푸터 배경 */
--paper:  #E7EAF0;   /* 페이지 배경 */
--accent: #2540F2;   /* 링크·활성 상태 */
--hot:    #FF5C38;   /* 최신·수상 표시 */
```

---

## 5. 인터넷에 공개하기

GitHub 저장소를 만들고 아래를 VS Code 터미널(``Ctrl+` ``)에 붙여넣습니다. `아이디`와 `저장소이름`만 본인 것으로 바꾸세요.

```bash
git init
git branch -M main
git add .
git commit -m "연구실 홈페이지 첫 배포"
git remote add origin https://github.com/아이디/저장소이름.git
git push -u origin main
```

푸시한 뒤 GitHub 저장소에서 **Settings → Pages → Source**를 `GitHub Actions`로 지정합니다. 1~2분 뒤 아래 주소로 접속됩니다.

```
https://아이디.github.io/저장소이름/
```

이후에는 내용을 고치고 아래 세 줄만 실행하면 자동으로 반영됩니다.

```bash
git add .
git commit -m "2026년 하계 학회 발표 추가"
git push
```

VS Code 왼쪽 **Source Control(가지 모양) 아이콘**을 쓰면 터미널 없이 클릭만으로도 같은 작업이 됩니다. 메시지 입력 → `Commit` → `Sync Changes`.
