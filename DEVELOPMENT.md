# 개발 인계

## 제품 목표

책을 대신 읽어주는 도구가 아니라 성경 본문에서 관련 교리를 찾고, 책에서 확인한 근거를 설교·성경공부 노트로 모으는 연구 데스크.

## 다음 구현 순서

2026-10-07 최종 사용자 결정: 원문·자체 색인을 먼저 구축하고, 사용자가 선택한 범위만 직접 번역하여 저장·재사용한다. 전체 선번역은 기본 작업에서 제외한다.

1. 제2판(1906–1911)을 우선 기준 후보로 삼아 네 권의 판차·쪽수·완전성과 디지털 이용조건을 확인한다.
2. 원본 이미지와 OCR을 연결하고 문단·각주 및 원어 인용을 대조한다. 판본과 인쇄 쪽수·스캔 쪽수를 분리한다.
3. 원문에서 자체 주제·성경 색인을 만든다. 실제 성경 인용과 편집자의 신학적 연결을 구분하고 근거 문단을 붙인다.
4. 5–10개 원문 문단으로 요청 시 번역 및 저장 흐름을 시범 검증한다. 사용자 선택 전 전권 번역을 실행하지 않는다.
5. 사용자 검색 → 관련 원문 위치 선택 → 해당 범위의 유효한 저장본 조회 → 없을 때만 번역 요청 → 결과 저장의 흐름을 구현한다.
6. AI 초안은 ‘AI 번역 · 미검수’로 읽을 수 있게 하되 승인본과 명확히 구분한다. 검수 완료본이 있으면 우선 제공한다.
7. 원문·용어·한국어 검수는 사용된 구간부터 진행한다. 예시 데이터와 기존 메모·북마크는 구별하여 보존한다.
8. 이후 검증된 원문·번역을 근거로 연구 해설과 설교 저장소 연동을 확장한다.

## 필요한 부분만 번역하는 읽기 경험 (구현 요구사항)

- 검색 결과에는 권·절·페이지·연결 근거와 자료 상태를 표시한다.
- 원문과 번역을 나란히 확인하고 ‘앞 문단’, ‘다음 문단’, ‘이 절 전체’로 읽기 범위를 넓힌다.
- 문장 한 줄만 잘라 오해를 유발하지 않도록 논의 단위와 관련 각주를 포함한다. 길이가 한도를 넘으면 구간으로 나누되 생략한 사실을 숨기지 않는다.
- 원문 번역, AI의 쉬운 설명, 사용자 연구 메모는 별도 영역으로 구분한다.
- 원문 미확보, OCR 확인 필요, 번역 가능, 번역 중, 미검수 저장본, 검수 완료, 실패 상태를 구별한다.
- 원문이나 실제 AI 연결이 없는 경우 생성 기능을 비활성화하고 이유를 표시한다. 예시를 실제 번역처럼 제시하지 않는다.
- 실패 시 성공한 기존 번역을 보존하고 재시도할 수 있게 한다. 반복 클릭과 동시 요청으로 중복 작업이 발생하지 않게 한다.
- 원문 이미지·페이지 출처를 항상 다시 확인할 수 있게 한다.

## 번역 저장·재사용 기준 (설계, 미구현)

캐시 식별자는 판본, 정렬된 문단 범위, 원문 및 각주 내용 해시, 대상 언어, 번역 정책·용어집 버전을 포함한다. 앞뒤 문맥을 입력한 경우 그 범위와 버전도 기록한다. 모델·프롬프트 버전, 생성 시각, 처리량은 이력에 남긴다.

동일한 유효 원문에 대한 검수 완료본을 우선하고, 없으면 저장된 미검수본을 제공한다. 단지 모델 버전이 바뀌었다는 이유로 검수 완료본을 자동 폐기하지 않는다. 원문 정정 시 기존 결과를 재검토 상태로 보존하고 최신 원문 번역과 혼동하지 않게 한다. 강제 재번역은 명시적 동작으로 분리한다.

공유 저장에는 원문 번역만 포함하고 개인 설교 메모·연구 내용은 섞지 않는다. 개인 메모는 번역 요청에 기본 포함하지 않는다. 호출 횟수·실제 토큰 사용량·실패·저장본 재사용을 기록하여 비용을 측정한다. 요청별 범위와 일일 예산 제한을 제공하고 한도에 도달하면 새 번역을 중단한다. 현재 유료 처리나 API 연결을 설정했다는 뜻은 아니다.

## 출처 조사 기록 (2026-10-07)

| 후보 | 확인한 정보 | 채택 상태 |
| --- | --- | --- |
| Project Neocalvinism 서지 | 제2판 각 권 발행연도 1906 / 1908 / 1910 / 1911. 초판 및 후속 판과 구별됨 | 서지 참고. 실제 사용할 파일은 미확정 |
| DBNL | 초판 1895–1901 네 권의 스캔 안내. 해당 자료에 저작권 확인 필요 표시가 있음 | 대조 후보. 수록 내용별 검토 전 재배포 승인 아님 |
| Delpher | 제2판 1권·4권의 검색 결과에서 VU 소장 스캔 후보와 권리 미확정 표시 확인 | 후보만 확인. 직접 페이지 열기가 실패해 파일·전체 약관 검토 미완료 |

확인 링크:
- https://sources.neocalvinism.org/bavinck/?tp=books
- https://www.dbnl.org/tekst/bavi002gere00_01/
- https://www.dbnl.org/tekst/bavi002gere01_01/
- https://www.dbnl.org/overdbnl/copyright.php
- https://www.bibliotheek.nl/catalogus/titel.391516183.html/gereformeerde-dogmatiek/
- https://www.delpher.nl/nl/boeken/view?identifier=MMUBVU05%3A000000743%3A00609
- https://www.delpher.nl/nl/boeken/view?identifier=MMUBVU05%3A000000819%3A00132

DBNL 조건은 저작권이 있는 자료의 재이용과 대량 다운로드를 제한하며, 전체 컬렉션의 데이터베이스권을 별도 설명한다. 이것이 바빙크 원저 전체의 권리가 남아 있다는 뜻도, 해당 스캔을 무조건 자유롭게 배포할 수 있다는 뜻도 아니다. 사용할 개별 자료와 실제 이용 방식에 적용되는 조건을 확인한다. 현재 원문 파일 수집·번역·검수는 아직 수행하지 않았다.

## 번역·검수 운영

문단별로 원문 이미지 위치, 원문 전사, 한국어 초안, 검수 수정, 승인본을 따로 보관한다. 상태는 원문 등록 → OCR 대조 완료 → 번역 초안 → 원문·신학 검수 → 한국어 교정 → 승인으로 진행한다. 검수자·일시·수정 사유를 남긴다. 원문 변경 시 해당 번역과 연결 색인을 재검토 대상으로 돌린다.

- 미확인 문자를 임의로 보완하지 말고 불확실 표시를 남긴다.
- 바빙크의 진술, 바빙크가 인용한 타인의 견해, 편집자의 설명을 구별한다.
- 직역 초안과 읽기 좋은 검수 번역을 연결하되 요약문은 별도 유형으로 둔다.
- 하나님의 명칭은 하나님·여호와를 기본으로 하되 원문의 명칭과 인용 맥락을 따른다. 그리스도·메시아는 문맥에 따라 구별한다.
- 성경 구절을 싣는 경우 절을 축약하지 않는다. 바빙크의 부분 인용은 부분 인용임을 표시하고, 별도 성경 보기에서는 해당 절 전문을 제공한다. 성경 번역본의 이용조건도 별도 확인한다.
- 자체 색인은 현대 번역판의 색인 전체를 옮기지 않고 원문에서 직접 작성한다.

첫 검증 묶음의 완료 조건: 선택한 5–10개 문단 전부에 이미지 대조·번역 검수·정확한 원문 위치가 있고, 추출한 성경 참조 전부가 검증되며, 불확실한 항목은 승인 상태가 아니어야 한다.

## 추가 데이터 모델 (설계안, 미구현)

- source_assets: id, edition_id, provider, source_url, terms_url, accessed_at, original_work_status, digital_reuse_status, rights_evidence, checksum
- source_segments: id, source_asset_id, volume, section_label, printed_page, scan_page, paragraph_order, transcription, transcription_status, version
- translations: id, segment_id, source_version, language, draft_text, reviewed_text, status, translator_type, model_version
- reviews: id, translation_id, reviewer, reviewed_at, review_kind, decision, notes
- glossary: id, source_term, preferred_korean, context_note, status
- index_evidence: id, term_id, segment_id, evidence_span, reference_kind, provenance, verification_status

원저 상태와 디지털 재이용 상태는 독립적으로 관리한다. 이용 검토가 pending인 자료는 재배포 승인으로 표시하지 않는다. 원문 이미지 쪽수와 인쇄된 쪽수를 구분한다. 검수자 확인 없이 reviewer 값을 만들지 않는다.

## 권장 데이터 모델 (DB 미구현)

- editions: id, language, publisher, translator, year, edition_number, rights_note
- volumes: id, work_id, number, title
- sections: id, volume_id, parent_id, title, sort_order
- locators: id, edition_id, section_id, page_start, page_end
- terms: id, type (subject/person/scripture/document), label, aliases
- links: id, term_id, section_id, locator_id, provenance, relation_type, evidence, verification_status
- scripture_ranges: id, book_id, chapter_start, verse_start, chapter_end, verse_end
- related_terms: from_id, to_id, relation_type, provenance
- notes: id, owner_id, scripture_range_id, observation, theology, application, outline, created_at, updated_at
- note_sources: note_id, link_id, user_comment

provenance는 original_index / editor / ai로 나누고 verification_status는 pending / verified / rejected로 나눕니다. 출처 생성 주체와 신학적 관련성은 서로 다른 속성입니다. 페이지는 판본 없이는 저장하지 않습니다. 성경은 정규화한 책·장·절 범위로 매칭합니다. 성경 본문을 싣는 경우 절을 축약하지 않습니다.

## AI 조건

검증된 근거 검색 → 해당 근거만 입력 → 답변의 문장별 근거 연결 → 근거의 원문과 판본 위치 확인. AI 추론 관계는 원본 색인과 명확히 구분합니다. API 키는 서버 환경 변수로만 관리합니다. 현재 프런트엔드에는 키나 AI 호출이 없습니다.

## UX 후속

실데이터가 생긴 뒤 페이지 역검색을 활성화합니다. 현재는 메모에 직접 판본·쪽수를 기록합니다. 교리 지도 선은 인과나 삼위일체 위계를 뜻하지 않습니다. 범위 미지원 본문은 직접 노트 작성으로 이어집니다.
