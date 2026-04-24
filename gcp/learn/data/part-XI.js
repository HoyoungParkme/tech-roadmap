/**
 * part-XI.js — Part XI "데이터 분석 — BigQuery" 3개 Section 데이터
 */
window.GCPLearn=window.GCPLearn||{};window.GCPLearn.sections=window.GCPLearn.sections||{};

window.GCPLearn.sections['XI-1-1']={id:'XI-1-1',title:'BigQuery란? — 서버리스 데이터 웨어하우스',part:'XI',partTitle:'데이터 분석 — BigQuery',chapter:'1',chapterTitle:'BigQuery',difficulty:'★★☆',prerequisites:'I-1-3',
objective:'이 Section을 마치면 BigQuery의 아키텍처를 이해하고, 전통적 DB와의 차이를 설명할 수 있다.',
paragraphs:['Part II에서 GCP를 "데이터·AI·쿠버네티스의 본고장"이라고 소개했다. 그 "데이터" 영역을 대표하는 서비스가 바로 BigQuery다.','Cloud SQL은 OLTP에 특화된 DB다. 소수의 행을 빠르게 읽고 쓰는 작업이다. BigQuery는 OLAP에 특화되어 있다. 수천만 행 전체를 한꺼번에 훑는 분석 작업이 영역이다.','BigQuery가 빠른 이유는 컬럼형 스토리지(Columnar Storage) 구조 때문이다. 필요한 열만 골라 읽어 처리량이 비약적으로 줄어든다. 또한 서버리스로 쿼리 실행 시 수천 개 노드에 분산 처리한다.','BigQuery는 "SQL 한 줄로 수십 TB를 분석한다"는 경험을 처음 해보는 서비스다.'],
keywords:['BigQuery','데이터 웨어하우스(Data Warehouse)','OLAP','서버리스','컬럼형 스토리지'],prevSection:'X-2-2',nextSection:'XI-1-2'};

window.GCPLearn.sections['XI-1-2']={id:'XI-1-2',title:'BigQuery 사용하기 — 데이터 업로드와 SQL 쿼리',part:'XI',partTitle:'데이터 분석 — BigQuery',chapter:'1',chapterTitle:'BigQuery',difficulty:'★★★',prerequisites:'XI-1-1',
objective:'이 Section을 마치면 BigQuery에 데이터셋을 만들고, CSV를 업로드하고, SQL 쿼리로 분석할 수 있다.',
paragraphs:['데이터셋(Dataset)은 여러 테이블을 담는 폴더이고, 테이블(Table)은 그 폴더 안의 파일이다.','bq mk --dataset 명령으로 데이터셋을 만들고, bq load 명령으로 CSV 파일을 업로드한다. 스키마로 열 이름과 타입을 함께 지정한다.','데이터가 올라가면 표준 SQL로 쿼리를 실행한다. BigQuery는 OLAP 특성상 SELECT와 집계 함수가 주된 사용 패턴이다.'],
codeBlocks:[{title:'BigQuery SQL 쿼리',language:'sql',code:'SELECT\n  name,\n  COUNT(*) AS count\nFROM `my-project.my_dataset.my_table`\nGROUP BY name\nORDER BY count DESC\nLIMIT 10;'},
{title:'bq CLI 데이터 관리',language:'bash',code:'# 데이터셋 생성\nbq mk --dataset my-project:my_dataset\n\n# CSV 파일 업로드\nbq load --source_format=CSV \\\n  my_dataset.my_table ./data.csv \\\n  name:STRING,age:INTEGER,city:STRING'}],
keywords:['데이터셋(Dataset)','bq mk','bq load','표준 SQL','스키마 정의'],prevSection:'XI-1-1',nextSection:'XI-1-3'};

window.GCPLearn.sections['XI-1-3']={id:'XI-1-3',title:'Looker Studio로 데이터 시각화하기',part:'XI',partTitle:'데이터 분석 — BigQuery',chapter:'1',chapterTitle:'BigQuery',difficulty:'★★★',prerequisites:'XI-1-2',
objective:'이 Section을 마치면 BigQuery 테이블을 Looker Studio에 연결해 차트와 대시보드를 만들 수 있다.',
paragraphs:['SQL 쿼리 결과는 숫자와 텍스트가 빽빽한 테이블이다. 팀 전체가 빠르게 파악하려면 시각화가 필요하다.','Looker Studio(구 Google Data Studio)는 BigQuery 테이블을 데이터 소스로 연결해 차트와 대시보드를 만드는 무료 시각화 도구다. 코드 한 줄 없이 클릭만으로 차트를 생성한다.','완성된 대시보드는 링크로 공유할 수 있어 팀 보고서를 별도로 만들 필요가 없다. BigQuery 데이터가 갱신되면 대시보드도 자동으로 최신 데이터를 반영한다.'],
keywords:['Looker Studio','대시보드','데이터 소스 연결','차트','데이터 시각화'],prevSection:'XI-1-2',nextSection:'XII-1-1'};
