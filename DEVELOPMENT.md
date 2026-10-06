# 개발 인계

## 제품 목표

책을 대신 읽어주는 도구가 아니라 성경 본문에서 관련 교리를 찾고, 책에서 확인한 근거를 설교·성경공부 노트로 모으는 연구 데스크.

## 다음 구현 순서

1. 사용할 한국어판의 출판사·역자·발행연도·판차 확인.
2. 목차와 색인 제공 범위 확인 후 작은 검증 데이터셋 구축.
3. 편집 예시를 실자료로 교체하며 각 연결에 검증 근거 기록.
4. 필요한 경우 사용자별 저장 API 및 인증 추가. 현재 브라우저 자료를 가져오는 마이그레이션 제공.
5. 검증 자료가 충분해진 뒤 근거 검색 기반 AI 답변 추가. 근거 없는 질문은 자료 부족으로 처리.
6. 설교 저장소와 연결은 독립된 연동 API로 구현.

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
