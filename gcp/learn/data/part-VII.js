/**
 * part-VII.js — Part VII "Cloud Run 배포 · 운영" 4개 Section 데이터
 */
window.GCPLearn = window.GCPLearn || {};
window.GCPLearn.sections = window.GCPLearn.sections || {};

window.GCPLearn.sections['VII-1-1'] = {
  id: 'VII-1-1', title: 'Cloud Logging으로 로그 확인하기',
  part: 'VII', partTitle: 'Cloud Run 배포 · 운영', chapter: '1', chapterTitle: '모니터링',
  difficulty: '★★★', prerequisites: 'IV-1-1',
  objective: '이 Section을 마치면 Cloud Logging에서 Cloud Run 로그를 조회하고, gcloud CLI로 필터링할 수 있다.',
  paragraphs: [
    '레스토랑 주방을 생각해보자. 요리사가 주문을 받고, 어떤 재료를 썼고, 언제 서빙했는지 주방 일지에 기록해두면 나중에 문제가 생겼을 때 원인을 추적할 수 있다. Cloud Run이 처리하는 요청도 마찬가지다.',
    'Cloud Logging은 GCP의 중앙 로그 수집·저장 서비스다. Cloud Run 외에도 GCP 서비스 대부분이 Cloud Logging으로 로그를 보낸다. 로그를 JSON 형식으로 출력하면 Logs Explorer가 severity 필드를 자동으로 파싱해 INFO, WARNING, ERROR를 색으로 구분해 보여준다.',
    '실무에서는 에러가 발생했을 때 Logs Explorer에서 severity=ERROR 필터를 걸어 원인을 빠르게 추적한다.',
    'Cloud Logging은 로그를 모으는 창구다. 로그가 쌓이면 다음 단계는 수치 변화를 추적하는 모니터링이다.',
  ],
  codeBlocks: [
    { title: 'Cloud Logging 로그 조회', language: 'bash',
      code: '# 최근 Cloud Run 로그 10건 조회\ngcloud logging read "resource.type=cloud_run_revision" \\\n  --limit 10 \\\n  --format="table(timestamp, severity, textPayload)"\n\n# 에러 로그만 필터링\ngcloud logging read \\\n  "resource.type=cloud_run_revision AND severity=ERROR" \\\n  --limit 20' },
  ],
  keywords: ['Cloud Logging', 'Logs Explorer', 'resource.type=cloud_run_revision', 'severity', 'JSON 로그 형식'],
  prevSection: 'VI-1-3', nextSection: 'VII-1-2',
};

window.GCPLearn.sections['VII-1-2'] = {
  id: 'VII-1-2', title: 'Cloud Monitoring — 알림과 대시보드',
  part: 'VII', partTitle: 'Cloud Run 배포 · 운영', chapter: '1', chapterTitle: '모니터링',
  difficulty: '★★★', prerequisites: 'VII-1-1',
  objective: '이 Section을 마치면 Cloud Monitoring으로 메트릭을 대시보드로 만들고 알림 정책을 설정할 수 있다.',
  paragraphs: [
    '병원 중환자실에는 심박수·혈압·산소포화도를 실시간으로 보여주는 모니터가 있다. Cloud Monitoring이 하는 일이 바로 이것이다. Cloud Run 서비스의 요청 수, 응답 시간, 에러율을 실시간으로 수집하고 시각화한다.',
    'Cloud Run은 별도 설정 없이 네 가지 메트릭을 자동으로 전송한다. 요청 수, 지연 시간, 인스턴스 수, 에러율이다. 알림 정책(Alerting Policy)으로 에러율이 5%를 초과하면 Slack으로 알림을 보낼 수 있다.',
    '실무에서 알림 기준은 p99(상위 1% 느린 응답) 기준으로 설정하는 것이 더 실용적이다. 평균이 안정적이어도 일부 사용자가 극단적으로 느린 응답을 받을 수 있기 때문이다.',
    'Cloud Monitoring은 Logging과 한 쌍이다. 메트릭 알림을 받았을 때 Logs Explorer에서 원인 로그를 찾는 흐름이 기본 운영 패턴이다.',
  ],
  keywords: ['Cloud Monitoring', '메트릭(Metric)', '알림 정책(Alerting Policy)', '대시보드(Dashboard)', '지연 시간(Latency)'],
  prevSection: 'VII-1-1', nextSection: 'VII-1-3',
};

window.GCPLearn.sections['VII-1-3'] = {
  id: 'VII-1-3', title: '트래픽 분산과 점진적 배포 (Traffic Splitting)',
  part: 'VII', partTitle: 'Cloud Run 배포 · 운영', chapter: '1', chapterTitle: '모니터링',
  difficulty: '★★★', prerequisites: 'IV-1-3',
  objective: '이 Section을 마치면 Cloud Run의 트래픽 분산 기능으로 카나리 배포를 수행할 수 있다.',
  paragraphs: [
    '신약을 검증할 때 처음부터 모든 환자에게 투약하지 않는다. 소수의 자원자에게 먼저 투여하고 부작용이 없는지 확인한 뒤 점진적으로 범위를 넓힌다. 트래픽 분산(Traffic Splitting)은 새 버전에 트래픽의 일부만 먼저 보내 위험을 줄이는 방식이다.',
    'Cloud Run에서는 각 배포를 리비전(Revision)으로 관리한다. 새 버전에 10%만 보내고 나머지 90%는 기존 버전이 처리하도록 설정한다. 이 방식을 카나리 배포(Canary Deployment)라고 부른다.',
    '카나리 배포의 또 다른 장점은 롤백(Rollback)이 빠르다는 점이다. 에러가 급증하면 이전 리비전으로 100%를 다시 돌리면 된다. 재배포 없이 트래픽 비율 조정만으로 롤백이 완료된다.',
  ],
  codeBlocks: [
    { title: '트래픽 분산 및 전환', language: 'bash',
      code: '# 새 배포 후 10% 트래픽만 새 리비전으로\ngcloud run services update-traffic my-api \\\n  --to-revisions=my-api-v2=10,my-api-v1=90 \\\n  --region=asia-northeast3\n\n# 문제 없으면 100% 전환\ngcloud run services update-traffic my-api \\\n  --to-latest \\\n  --region=asia-northeast3' },
  ],
  keywords: ['트래픽 분산(Traffic Splitting)', '카나리 배포(Canary Deployment)', '리비전(Revision)', '점진적 배포', '롤백(Rollback)'],
  prevSection: 'VII-1-2', nextSection: 'VII-2-1',
};

window.GCPLearn.sections['VII-2-1'] = {
  id: 'VII-2-1', title: '비용 최적화 — Cloud Run 설정 튜닝',
  part: 'VII', partTitle: 'Cloud Run 배포 · 운영', chapter: '2', chapterTitle: '비용 최적화',
  difficulty: '★★★', prerequisites: 'IV-1-3, VII-1-2',
  objective: '이 Section을 마치면 Cloud Run 요청 수·CPU·메모리 설정을 조정해 불필요한 비용을 줄일 수 있다.',
  paragraphs: [
    '음식점에서 낮 영업이 끝나고 저녁 장사 전 3시간 동안 주방을 통째로 비워두면 전기와 인건비가 낭비된다. Cloud Run의 요금은 요청 수 × CPU 사용 시간 × 메모리 사용량으로 계산된다.',
    '비용을 줄이는 핵심 설정은 세 가지다. Scale to Zero(--min-instances 0), 메모리 설정 최적화, CPU 할당 방식(--cpu-throttling) 이다.',
    '야간에는 트래픽이 없는 어드민 서비스는 Scale to Zero + 128MiB + cpu-throttling을 적용하고, 응답 속도가 중요한 공개 API는 --min-instances 1을 유지하되 메모리를 실사용량에 맞게 조정하는 식이다.',
    'Cloud Run 서비스를 배포하고, 로그와 메트릭으로 운영 현황을 파악하며, 비용 설정을 튜닝하는 것까지 익혔다면 GCP로 서비스를 배포하고 운영하는 기본기는 충분히 갖춰진 것이다.',
  ],
  keywords: ['비용 최적화(Cost Optimization)', 'Scale to Zero', '--min-instances', '--cpu-throttling', '메모리 설정'],
  prevSection: 'VII-1-3', nextSection: 'VIII-1-1',
};
