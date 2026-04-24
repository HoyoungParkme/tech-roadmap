/**
 * sidebar.js
 * 경로: visualizations/sidebar.js
 * 목적: 모든 시각화 페이지에 왼쪽 사이드바 목차를 추가하는 공유 스크립트
 * 주요 기능: Part I~IX 전체 목차 트리, 현재 Part 하이라이트, 섹션 클릭 시 탭 전환
 * 의존성: Tailwind CSS CDN (각 페이지에서 로드됨)
 */
(function () {
  // 전체 목차 데이터
  const TOC = [
    { part: 'I', title: '왜 버전 관리인가', color: 'orange', file: 'part-1.html',
      sections: ['I-1-1 파일 이름으로 버전 관리', 'I-1-2 세 가지 약속', 'I-1-3 분산 저장소', 'I-2-1 Git과 GitHub'] },
    { part: 'II', title: 'VCS 지도', color: 'indigo', file: 'part-2.html',
      sections: ['II-1-1 주요 VCS', 'II-1-2 왜 Git이 표준', 'II-2-1 GitHub vs GitLab vs Bitbucket'] },
    { part: 'III', title: '깃 첫 걸음', color: 'emerald', file: 'part-3.html',
      sections: ['III-0-1 GUI 클라이언트', 'III-0-2 Windows 설치', 'III-0-3 macOS/Linux 설치',
        'III-1-1 설치와 초기 설정', 'III-1-2 git init', 'III-1-3 첫 커밋',
        'III-2-1 status와 diff', 'III-2-2 restore와 reset', 'III-3-1 .gitignore', 'III-3-2 git remote', 'III-4-1 GUI 실습'] },
    { part: 'IV', title: '브랜치·머지·리베이스', color: 'purple', file: 'part-4.html',
      sections: ['IV-1-1 변경사항의 여행', 'IV-1-2 브랜치란', 'IV-1-3 브랜치 전략',
        'IV-2-1 머지 방식', 'IV-2-2 충돌 해결', 'IV-3-1 리베이스', 'IV-3-2 체리픽', 'IV-4-1 GUI 브랜치·머지'] },
    { part: 'V', title: 'PR·리뷰·Issue', color: 'blue', file: 'part-5.html',
      sections: ['V-1-1 PR의 역할', 'V-1-2 좋은 PR 작성법', 'V-2-1 코드 리뷰', 'V-2-2 GitHub Issue', 'V-3-1 Branch Protection'] },
    { part: 'VI', title: '실전 팀 워크플로우', color: 'teal', file: 'part-6.html',
      sections: ['VI-1-1 Fork & PR', 'VI-1-2 Squash Merge', 'VI-2-1 Conventional Commits', 'VI-2-2 Git Stash',
        'VI-3-1 트러블슈팅', 'VI-4-1 git add -p', 'VI-4-2 git clean'] },
    { part: 'VII', title: 'CI/CD — GitHub Actions', color: 'rose', file: 'part-7.html',
      sections: ['VII-1-1 GitHub Actions란', 'VII-1-2 첫 Workflow', 'VII-2-1 마켓플레이스',
        'VII-2-2 GitHub Secrets', 'VII-3-1 자동 배포', 'VII-3-2 파이프라인 설계'] },
    { part: 'VIII', title: '태그·릴리즈·분석·디버깅', color: 'amber', file: 'part-8.html',
      sections: ['VIII-1-1 태그와 릴리즈', 'VIII-1-2 GitHub Releases', 'VIII-2-1 git log 고급', 'VIII-2-2 git blame', 'VIII-2-3 git bisect'] },
    { part: 'IX', title: '보안·GitHub 서비스·고급 도구', color: 'cyan', file: 'part-9.html',
      sections: ['IX-1-1 SSH 키', 'IX-1-2 GPG 서명', 'IX-2-1 GitHub Pages', 'IX-2-2 README.md',
        'IX-3-1 GitHub CLI', 'IX-3-2 Git Hook', 'IX-3-3 git worktree'] },
  ];

  // 현재 파일명으로 현재 Part 식별
  const currentFile = location.pathname.split('/').pop();
  const currentPartIdx = TOC.findIndex(p => p.file === currentFile);

  // 색상 매핑 (Tailwind 동적 클래스 대신 인라인 스타일)
  const COLOR_MAP = {
    orange: { bg: '#fff7ed', border: '#f97316', text: '#c2410c', accent: '#ea580c' },
    indigo: { bg: '#eef2ff', border: '#6366f1', text: '#4338ca', accent: '#4f46e5' },
    emerald: { bg: '#ecfdf5', border: '#10b981', text: '#047857', accent: '#059669' },
    purple: { bg: '#faf5ff', border: '#a855f7', text: '#7e22ce', accent: '#9333ea' },
    blue: { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8', accent: '#2563eb' },
    teal: { bg: '#f0fdfa', border: '#14b8a6', text: '#0f766e', accent: '#0d9488' },
    rose: { bg: '#fff1f2', border: '#f43f5e', text: '#be123c', accent: '#e11d48' },
    amber: { bg: '#fffbeb', border: '#f59e0b', text: '#b45309', accent: '#d97706' },
    cyan: { bg: '#ecfeff', border: '#06b6d4', text: '#0e7490', accent: '#0891b2' },
  };

  // 사이드바 열림/닫힘 상태
  let isOpen = true;

  // 사이드바 HTML 생성
  function buildSidebar() {
    const sidebar = document.createElement('div');
    sidebar.id = 'toc-sidebar';
    sidebar.style.cssText = `
      position: fixed; top: 0; left: 0; height: 100vh; width: 280px;
      background: #fff; border-right: 1px solid #e2e8f0; z-index: 9999;
      overflow-y: auto; transition: transform 0.3s ease;
      box-shadow: 2px 0 8px rgba(0,0,0,0.05); font-family: system-ui, -apple-system, sans-serif;
    `;

    // 헤더
    let html = `
      <div style="padding: 16px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <a href="../index.html" style="text-decoration: none; display: flex; align-items: center; gap: 8px;">
          <div style="width: 28px; height: 28px; background: #16a34a; color: #fff; border-radius: 50%;
            display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px;">G</div>
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">Git & GitHub 가이드</span>
        </a>
        <button id="toc-close-btn" style="background: none; border: none; cursor: pointer; font-size: 18px; color: #94a3b8; padding: 4px;"
          aria-label="사이드바 닫기">&times;</button>
      </div>
    `;

    // 목차 트리
    html += '<div style="padding: 8px 0;">';
    TOC.forEach((part, pIdx) => {
      const isCurrent = pIdx === currentPartIdx;
      const c = COLOR_MAP[part.color];
      const isExpanded = isCurrent;

      html += `
        <div class="toc-part" data-part-idx="${pIdx}">
          <div class="toc-part-header" data-part-idx="${pIdx}" style="
            padding: 8px 16px; cursor: pointer; display: flex; align-items: center; gap: 8px;
            font-size: 12px; font-weight: 600; transition: background 0.15s;
            ${isCurrent ? `background: ${c.bg}; border-left: 3px solid ${c.border}; color: ${c.text};` : 'border-left: 3px solid transparent; color: #64748b;'}
          ">
            <span style="
              width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
              font-size: 9px; font-weight: 800; color: #fff; flex-shrink: 0;
              background: ${isCurrent ? c.accent : '#cbd5e1'};
            ">${part.part}</span>
            <span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${part.title}</span>
            <span class="toc-arrow" style="font-size: 10px; transition: transform 0.2s; ${isExpanded ? 'transform: rotate(90deg);' : ''}"
            >&#9654;</span>
          </div>
          <div class="toc-sections" style="display: ${isExpanded ? 'block' : 'none'}; padding: 2px 0 6px 0;">
      `;

      part.sections.forEach((sec, sIdx) => {
        const secLabel = sec.split(' ')[0]; // "III-0-1"
        const secTitle = sec.substring(secLabel.length + 1); // "GUI 클라이언트"
        const isCurrentFile = pIdx === currentPartIdx;

        html += `
            <a href="${isCurrentFile ? '#' : part.file}" class="toc-section-link" data-part-idx="${pIdx}" data-section-idx="${sIdx}"
              style="
                display: block; padding: 4px 16px 4px 50px; font-size: 11px; text-decoration: none;
                color: ${isCurrentFile ? c.text : '#94a3b8'}; transition: background 0.15s; cursor: pointer;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
              "
              onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'"
            >
              <span style="font-weight: 600; margin-right: 4px; font-size: 10px; opacity: 0.7;">${secLabel}</span>
              ${secTitle}
            </a>
        `;
      });

      html += '</div></div>';
    });
    html += '</div>';

    sidebar.innerHTML = html;
    document.body.appendChild(sidebar);

    // 토글 버튼 (사이드바 닫혀있을 때)
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'toc-toggle-btn';
    toggleBtn.innerHTML = '☰';
    toggleBtn.setAttribute('aria-label', '목차 열기');
    toggleBtn.style.cssText = `
      position: fixed; top: 12px; left: 12px; z-index: 10000; width: 36px; height: 36px;
      background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;
      font-size: 18px; display: none; align-items: center; justify-content: center;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1); color: #475569;
    `;
    document.body.appendChild(toggleBtn);

    // 메인 콘텐츠 밀기
    const root = document.getElementById('root');
    if (root) {
      root.style.transition = 'margin-left 0.3s ease';
      root.style.marginLeft = '280px';
    }

    // 이벤트 바인딩
    bindEvents(sidebar, toggleBtn);
  }

  function bindEvents(sidebar, toggleBtn) {
    // 닫기 버튼
    document.getElementById('toc-close-btn').addEventListener('click', () => toggleSidebar(false, sidebar, toggleBtn));
    toggleBtn.addEventListener('click', () => toggleSidebar(true, sidebar, toggleBtn));

    // Part 헤더 클릭 → 섹션 접기/펼치기
    sidebar.querySelectorAll('.toc-part-header').forEach(header => {
      header.addEventListener('click', () => {
        const sections = header.nextElementSibling;
        const arrow = header.querySelector('.toc-arrow');
        if (sections.style.display === 'none') {
          sections.style.display = 'block';
          arrow.style.transform = 'rotate(90deg)';
        } else {
          sections.style.display = 'none';
          arrow.style.transform = 'rotate(0deg)';
        }
      });
    });

    // 섹션 링크 클릭 → 현재 페이지면 탭 전환
    sidebar.querySelectorAll('.toc-section-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const pIdx = parseInt(link.dataset.partIdx);
        const sIdx = parseInt(link.dataset.sectionIdx);

        if (pIdx === currentPartIdx) {
          e.preventDefault();
          // 현재 페이지의 탭 전환 — 탭 버튼 클릭으로 트리거
          const tabBtns = document.querySelectorAll('[aria-label*="섹션으로 이동"]');
          if (tabBtns[sIdx]) {
            tabBtns[sIdx].click();
          }
          // 모바일에서 사이드바 닫기
          if (window.innerWidth < 1024) {
            toggleSidebar(false, sidebar, toggleBtn);
          }
        }
        // 다른 페이지면 기본 링크 동작 (href로 이동)
      });
    });

    // 반응형: 모바일에서 자동 숨김
    function checkMobile() {
      if (window.innerWidth < 1024) {
        toggleSidebar(false, sidebar, toggleBtn);
      } else {
        toggleSidebar(true, sidebar, toggleBtn);
      }
    }
    window.addEventListener('resize', checkMobile);

    // 초기 체크
    if (window.innerWidth < 1024) {
      toggleSidebar(false, sidebar, toggleBtn);
    }
  }

  function toggleSidebar(open, sidebar, toggleBtn) {
    isOpen = open;
    const root = document.getElementById('root');
    if (open) {
      sidebar.style.transform = 'translateX(0)';
      toggleBtn.style.display = 'none';
      if (root && window.innerWidth >= 1024) root.style.marginLeft = '280px';
    } else {
      sidebar.style.transform = 'translateX(-100%)';
      toggleBtn.style.display = 'flex';
      if (root) root.style.marginLeft = '0';
    }
  }

  // DOM 로드 후 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildSidebar);
  } else {
    buildSidebar();
  }
})();
