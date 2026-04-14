// 네이버 리뷰 기준 더미 데이터
// 실제 서비스에서는 크롤러가 수집한 데이터를 이 스키마로 정규화해 저장한다고 가정
//
// review 필드
// - id: 리뷰 고유 ID
// - nickname: 리뷰어 닉네임
// - rating: 별점 (1.0 ~ 5.0)
// - text: 리뷰 본문
// - date: 작성일 (YYYY-MM-DD)
// - visitHour: 방문 시각 (0 ~ 23)
// - photoHashes: 사진의 perceptual hash 목록 (동일 hash면 중복/홍보 이미지로 추정)
// - reviewerTotalReviews: 리뷰어가 전체 네이버에 작성한 리뷰 수 (너무 적거나 특정 업종 편중이면 의심)
// - reviewerRestaurantDiversity: 리뷰어가 리뷰한 서로 다른 음식점 수 (낮을수록 전문 리뷰어 의심)
// - visitCount: 해당 가게 누적 방문 수 (재방문 단골 판별)
// - isReceiptVerified: 영수증 인증 여부

const RESTAURANTS = [
  {
    id: 'r1',
    name: '할매손칼국수',
    category: '한식 · 칼국수',
    address: '서울 종로구 체부동',
    thumbnail: '🍜',
    reviews: [
      { id: 'v1', nickname: '종로직장인', rating: 4.5, text: '점심때 직장 동료들이랑 벌써 네 번째 방문이에요. 사골 육수가 진하고 면발이 쫄깃합니다. 겉절이도 매번 새로 무쳐주시는 느낌.', date: '2026-03-02', visitHour: 12, photoHashes: ['a1','a2'], reviewerTotalReviews: 47, reviewerRestaurantDiversity: 38, visitCount: 4, isReceiptVerified: true },
      { id: 'v2', nickname: '체부동주민', rating: 5.0, text: '20년 단골인데 사장님 바뀌고도 맛 유지 잘 하시네요. 손주까지 데리고 왔습니다.', date: '2026-02-14', visitHour: 13, photoHashes: ['a3'], reviewerTotalReviews: 112, reviewerRestaurantDiversity: 89, visitCount: 12, isReceiptVerified: true },
      { id: 'v3', nickname: '맛있는하루', rating: 4.0, text: '면 양이 생각보다 많아서 반만 먹었어요. 국물은 호불호 없이 무난합니다.', date: '2026-02-28', visitHour: 11, photoHashes: ['a4'], reviewerTotalReviews: 23, reviewerRestaurantDiversity: 21, visitCount: 1, isReceiptVerified: true },
      { id: 'v4', nickname: '서촌산책', rating: 4.5, text: '비 오는 날 따끈한 국물 먹으러 왔는데 웨이팅 15분 있었어요. 기다릴 가치 있음.', date: '2026-01-22', visitHour: 12, photoHashes: ['a5','a6'], reviewerTotalReviews: 88, reviewerRestaurantDiversity: 72, visitCount: 2, isReceiptVerified: true },
      { id: 'v5', nickname: '혼밥장인', rating: 4.0, text: '혼자 가도 눈치 없음. 바 테이블 있어서 좋아요.', date: '2026-01-05', visitHour: 14, photoHashes: ['a7'], reviewerTotalReviews: 156, reviewerRestaurantDiversity: 134, visitCount: 3, isReceiptVerified: true },
      { id: 'v6', nickname: '김과장', rating: 5.0, text: '회사 근처라 일주일에 한 번은 와요. 바지락 칼국수 추천합니다.', date: '2025-12-30', visitHour: 12, photoHashes: ['a8'], reviewerTotalReviews: 64, reviewerRestaurantDiversity: 51, visitCount: 8, isReceiptVerified: true },
      { id: 'v7', nickname: '입짧은여행자', rating: 3.5, text: '간은 조금 심심한 편. 매운 고추 다대기 받아서 먹으니 괜찮아졌어요.', date: '2025-12-11', visitHour: 13, photoHashes: ['a9'], reviewerTotalReviews: 201, reviewerRestaurantDiversity: 189, visitCount: 1, isReceiptVerified: true },
      { id: 'v8', nickname: '토요일점심', rating: 4.5, text: '주말 오픈런 추천. 12시 넘으면 줄 길어져요.', date: '2025-11-29', visitHour: 11, photoHashes: ['a10','a11'], reviewerTotalReviews: 34, reviewerRestaurantDiversity: 29, visitCount: 2, isReceiptVerified: true },
      { id: 'v9', nickname: '광화문백수', rating: 4.0, text: '가격 대비 양 많고 건강한 맛. 조미료 덜 쓴다는 느낌.', date: '2025-11-08', visitHour: 13, photoHashes: ['a12'], reviewerTotalReviews: 78, reviewerRestaurantDiversity: 66, visitCount: 5, isReceiptVerified: true },
      { id: 'v10', nickname: '체부맛지도', rating: 4.5, text: '겉절이 무한리필인데 시즌마다 맛이 살짝 달라요. 겨울엔 좀 더 달큰함.', date: '2025-10-18', visitHour: 12, photoHashes: ['a13'], reviewerTotalReviews: 142, reviewerRestaurantDiversity: 118, visitCount: 11, isReceiptVerified: true },
    ],
  },
  {
    id: 'r2',
    name: '인스타감성 브런치카페',
    category: '카페 · 브런치',
    address: '서울 성수동',
    thumbnail: '🥐',
    reviews: [
      { id: 'v11', nickname: '성수맛집요정', rating: 5.0, text: '❤️❤️ 인생 브런치 ❤️❤️ 플레이팅 미쳤어요!! 인스타 감성 폭발 💯 사장님 너무 친절하시고 또 방문하고 싶은 곳 ✨', date: '2026-03-28', visitHour: 11, photoHashes: ['b1','b2','b3','b4'], reviewerTotalReviews: 4, reviewerRestaurantDiversity: 4, visitCount: 1, isReceiptVerified: false },
      { id: 'v12', nickname: '맛스타그램러', rating: 5.0, text: '요즘 핫한 브런치카페 다녀왔어요! 비주얼 최고 맛도 최고 분위기도 최고 👍 꼭 가보세요 강추합니다!!', date: '2026-03-27', visitHour: 12, photoHashes: ['b1','b5'], reviewerTotalReviews: 6, reviewerRestaurantDiversity: 5, visitCount: 1, isReceiptVerified: false },
      { id: 'v13', nickname: '서울브런치투어', rating: 5.0, text: '인스타에서 보고 바로 왔어요~ 리얼 감성 카페💕 파스타도 맛있고 라떼도 찐이에요 🥹', date: '2026-03-26', visitHour: 13, photoHashes: ['b2','b6'], reviewerTotalReviews: 3, reviewerRestaurantDiversity: 3, visitCount: 1, isReceiptVerified: false },
      { id: 'v14', nickname: '먹스타감성', rating: 5.0, text: '완벽한 브런치 ✨ 친구랑 가서 2시간 수다떨고 왔네요. 다음엔 남친이랑 와야지 ❤️', date: '2026-03-25', visitHour: 12, photoHashes: ['b3','b7'], reviewerTotalReviews: 5, reviewerRestaurantDiversity: 4, visitCount: 1, isReceiptVerified: false },
      { id: 'v15', nickname: '성수핫플탐방', rating: 5.0, text: '요즘 핫한 곳 탐방 중 🥰 여기가 진짜 원픽!! 사진 찍을 곳도 많고 메뉴도 예뻐요', date: '2026-03-24', visitHour: 11, photoHashes: ['b1','b8'], reviewerTotalReviews: 7, reviewerRestaurantDiversity: 6, visitCount: 1, isReceiptVerified: false },
      { id: 'v16', nickname: '솔직한한끼', rating: 2.0, text: '사진빨이 전부. 팬케이크 눅눅했고 커피는 식어서 나왔어요. 가격도 너무 비싸요 2인 7만원대 나옴.', date: '2026-02-18', visitHour: 14, photoHashes: ['b9'], reviewerTotalReviews: 187, reviewerRestaurantDiversity: 172, visitCount: 1, isReceiptVerified: true },
      { id: 'v17', nickname: '현실리뷰', rating: 1.5, text: '웨이팅 1시간 하고 들어갔는데 그럴 가치 전혀 없음. 플레이팅만 예쁘고 맛은 평범 이하.', date: '2026-02-03', visitHour: 13, photoHashes: ['b10'], reviewerTotalReviews: 94, reviewerRestaurantDiversity: 81, visitCount: 1, isReceiptVerified: true },
      { id: 'v18', nickname: '감성충전소', rating: 5.0, text: '♥ 너무 예쁜 카페 ♥ 메뉴 하나하나 다 정성이에요 사장님 감각 최고 💐', date: '2026-03-22', visitHour: 11, photoHashes: ['b2','b11'], reviewerTotalReviews: 8, reviewerRestaurantDiversity: 7, visitCount: 1, isReceiptVerified: false },
      { id: 'v19', nickname: '맛집은과학', rating: 2.5, text: '분위기 빼면 남는 게 없음. 크로플 눅눅하고 샐러드 드레싱이 너무 짠데 양도 적어요.', date: '2026-01-14', visitHour: 15, photoHashes: ['b12'], reviewerTotalReviews: 233, reviewerRestaurantDiversity: 210, visitCount: 1, isReceiptVerified: true },
      { id: 'v20', nickname: '데일리맛집', rating: 5.0, text: '진짜 예쁜 카페 발견!! 친구랑 인생샷 건지고 왔어요 📸 메뉴도 예쁘고 맛도 좋아요~', date: '2026-03-21', visitHour: 12, photoHashes: ['b1','b3'], reviewerTotalReviews: 5, reviewerRestaurantDiversity: 5, visitCount: 1, isReceiptVerified: false },
    ],
  },
  {
    id: 'r3',
    name: '24시 골목분식',
    category: '분식',
    address: '서울 관악구 신림동',
    thumbnail: '🍢',
    reviews: [
      { id: 'v21', nickname: '야식러버', rating: 4.0, text: '새벽 2시에 떡볶이 먹으러 가는 성지. 국물떡볶이 진국입니다.', date: '2026-03-10', visitHour: 2, photoHashes: ['c1'], reviewerTotalReviews: 88, reviewerRestaurantDiversity: 71, visitCount: 6, isReceiptVerified: true },
      { id: 'v22', nickname: '신림토박이', rating: 4.5, text: '10년 넘게 단골. 순대 사장님이 직접 사오시는 거라 그런지 냄새 안 나요.', date: '2026-02-22', visitHour: 21, photoHashes: ['c2'], reviewerTotalReviews: 54, reviewerRestaurantDiversity: 42, visitCount: 34, isReceiptVerified: true },
      { id: 'v23', nickname: '자취생일기', rating: 3.5, text: '김밥이 살짝 짰어요. 튀김은 바삭하고 좋음.', date: '2026-03-05', visitHour: 19, photoHashes: ['c3'], reviewerTotalReviews: 31, reviewerRestaurantDiversity: 28, visitCount: 2, isReceiptVerified: true },
      { id: 'v24', nickname: '관악구식탐', rating: 4.5, text: '라볶이 + 튀김 조합 최고. 배달도 빨라요.', date: '2026-02-11', visitHour: 23, photoHashes: ['c4'], reviewerTotalReviews: 76, reviewerRestaurantDiversity: 61, visitCount: 9, isReceiptVerified: true },
      { id: 'v25', nickname: '대학원생의밤', rating: 4.0, text: '논문 쓰다가 새벽에 자주 가요. 쥔장님 얼굴 외우심. 오뎅 국물 무한 리필.', date: '2026-01-30', visitHour: 3, photoHashes: ['c5'], reviewerTotalReviews: 42, reviewerRestaurantDiversity: 35, visitCount: 18, isReceiptVerified: true },
      { id: 'v26', nickname: '떡볶이덕후', rating: 4.5, text: '기름떡볶이도 있는 집. 서울에 몇 없음. 단골 인증합니다.', date: '2026-01-12', visitHour: 20, photoHashes: ['c6','c7'], reviewerTotalReviews: 120, reviewerRestaurantDiversity: 98, visitCount: 22, isReceiptVerified: true },
      { id: 'v27', nickname: '운동후치팅', rating: 3.5, text: '양념이 좀 달아진 느낌. 예전이 더 매콤했던 것 같음.', date: '2025-12-18', visitHour: 22, photoHashes: ['c8'], reviewerTotalReviews: 63, reviewerRestaurantDiversity: 55, visitCount: 4, isReceiptVerified: true },
      { id: 'v28', nickname: '심야식당', rating: 4.0, text: '진짜 24시간. 명절에도 열어요. 사장님들 교대제라 항상 친절하진 않지만 맛은 유지됨.', date: '2025-11-25', visitHour: 4, photoHashes: ['c9'], reviewerTotalReviews: 95, reviewerRestaurantDiversity: 79, visitCount: 15, isReceiptVerified: true },
      { id: 'v29', nickname: '이모네단골', rating: 5.0, text: '이모가 이름 기억해주심. 음료 서비스 주심 ㅎㅎ', date: '2025-11-03', visitHour: 21, photoHashes: ['c10'], reviewerTotalReviews: 38, reviewerRestaurantDiversity: 30, visitCount: 27, isReceiptVerified: true },
      { id: 'v30', nickname: '신림9번', rating: 3.0, text: '주말 저녁엔 좀 정신없어요. 포장 기다리는데 순서 섞이는 경우 있음.', date: '2025-10-15', visitHour: 20, photoHashes: ['c11'], reviewerTotalReviews: 49, reviewerRestaurantDiversity: 44, visitCount: 1, isReceiptVerified: true },
    ],
  },
  {
    id: 'r4',
    name: '프리미엄 한우다이닝',
    category: '한식 · 한우',
    address: '서울 강남구 청담동',
    thumbnail: '🥩',
    reviews: [
      { id: 'v31', nickname: '강남미식가', rating: 5.0, text: '청담 한우 오마카세 끝판왕. 플레이팅 하나하나 예술. 인당 20만원이 아깝지 않음.', date: '2026-03-20', visitHour: 19, photoHashes: ['d1','d2'], reviewerTotalReviews: 3, reviewerRestaurantDiversity: 3, visitCount: 1, isReceiptVerified: false },
      { id: 'v32', nickname: '청담파인다이닝', rating: 5.0, text: '오마카세 성지! 셰프님 설명 감동적이고 고기 퀄리티 최상 👏👏', date: '2026-03-19', visitHour: 19, photoHashes: ['d1','d3'], reviewerTotalReviews: 2, reviewerRestaurantDiversity: 2, visitCount: 1, isReceiptVerified: false },
      { id: 'v33', nickname: '하이엔드먹방', rating: 5.0, text: '한우 오마카세 갑. 와인 페어링 추천해드림. 분위기 품격 ✨', date: '2026-03-18', visitHour: 20, photoHashes: ['d2','d4'], reviewerTotalReviews: 4, reviewerRestaurantDiversity: 4, visitCount: 1, isReceiptVerified: false },
      { id: 'v34', nickname: '서울파인다인', rating: 5.0, text: '기념일에 방문 완벽했어요 💍 서비스 정중하고 코스 구성 훌륭합니다.', date: '2026-03-17', visitHour: 20, photoHashes: ['d5'], reviewerTotalReviews: 6, reviewerRestaurantDiversity: 5, visitCount: 1, isReceiptVerified: false },
      { id: 'v35', nickname: '강남맛집러', rating: 5.0, text: '가격 있지만 그만한 값어치 충분. 데이트 코스 추천합니다 💝', date: '2026-03-16', visitHour: 19, photoHashes: ['d3','d6'], reviewerTotalReviews: 5, reviewerRestaurantDiversity: 4, visitCount: 1, isReceiptVerified: false },
      { id: 'v36', nickname: '한우전문가', rating: 1.5, text: '인당 18만원짜리라 기대했는데 숙성 부족. 1++ 홍보하는데 실제로는 1+ 느낌. 마케팅이 너무 과함.', date: '2026-02-07', visitHour: 19, photoHashes: ['d7'], reviewerTotalReviews: 178, reviewerRestaurantDiversity: 143, visitCount: 1, isReceiptVerified: true },
      { id: 'v37', nickname: '미식가의기록', rating: 2.0, text: '셰프 코스 구성 빈약함. 한우 품질은 나쁘지 않으나 이 가격대면 일본식 오마카세가 낫다.', date: '2026-01-27', visitHour: 20, photoHashes: ['d8'], reviewerTotalReviews: 245, reviewerRestaurantDiversity: 198, visitCount: 1, isReceiptVerified: true },
      { id: 'v38', nickname: '럭셔리라이프', rating: 5.0, text: '완벽한 디너 ✨ 와인 큐레이션 최고 🍷 분위기도 최상!', date: '2026-03-15', visitHour: 20, photoHashes: ['d1','d4'], reviewerTotalReviews: 4, reviewerRestaurantDiversity: 3, visitCount: 1, isReceiptVerified: false },
      { id: 'v39', nickname: '청담라이프', rating: 5.0, text: '청담 한우 오마카세 여기가 정답 💯 서비스 퀄리티 최고!!', date: '2026-03-14', visitHour: 19, photoHashes: ['d2','d5'], reviewerTotalReviews: 7, reviewerRestaurantDiversity: 6, visitCount: 1, isReceiptVerified: false },
      { id: 'v40', nickname: '육식주의자', rating: 2.5, text: '재방문 생각 없음. 가격 대비 만족도 낮아요. 마케팅만큼의 품질은 아닙니다.', date: '2025-12-22', visitHour: 19, photoHashes: ['d9'], reviewerTotalReviews: 132, reviewerRestaurantDiversity: 115, visitCount: 1, isReceiptVerified: true },
    ],
  },
  {
    id: 'r5',
    name: '동네돈까스',
    category: '일식 · 돈까스',
    address: '서울 마포구 망원동',
    thumbnail: '🍱',
    reviews: [
      { id: 'v41', nickname: '망원동주민', rating: 4.5, text: '동네에 이런 집 있다는 게 복이에요. 등심돈까스 두툼하고 소스 직접 만드시는 듯.', date: '2026-03-08', visitHour: 12, photoHashes: ['e1'], reviewerTotalReviews: 67, reviewerRestaurantDiversity: 55, visitCount: 7, isReceiptVerified: true },
      { id: 'v42', nickname: '돈까스탐구생활', rating: 4.0, text: '튀김옷 바삭 고기 부드러움. 된장국은 호불호 있을 듯.', date: '2026-02-25', visitHour: 13, photoHashes: ['e2'], reviewerTotalReviews: 145, reviewerRestaurantDiversity: 122, visitCount: 3, isReceiptVerified: true },
      { id: 'v43', nickname: '망리단길단골', rating: 4.5, text: '단골 된 지 2년. 여기 치즈돈까스 먹고 다른 데 못 감.', date: '2026-02-19', visitHour: 18, photoHashes: ['e3'], reviewerTotalReviews: 92, reviewerRestaurantDiversity: 74, visitCount: 15, isReceiptVerified: true },
      { id: 'v44', nickname: '점심뭐먹지', rating: 4.0, text: '점심 세트 가성비 좋아요. 회사 근처라 자주 와요.', date: '2026-02-05', visitHour: 12, photoHashes: ['e4'], reviewerTotalReviews: 58, reviewerRestaurantDiversity: 49, visitCount: 5, isReceiptVerified: true },
      { id: 'v45', nickname: '아이엄마', rating: 4.5, text: '아이랑 가기 좋아요. 의자 높이도 맞고 양도 나눠 먹기 적당.', date: '2026-01-21', visitHour: 13, photoHashes: ['e5'], reviewerTotalReviews: 41, reviewerRestaurantDiversity: 36, visitCount: 4, isReceiptVerified: true },
      { id: 'v46', nickname: '홍대직장인', rating: 3.5, text: '맛은 좋은데 테이블이 좁아요. 웨이팅 있을 땐 포장 추천.', date: '2026-01-09', visitHour: 19, photoHashes: ['e6'], reviewerTotalReviews: 73, reviewerRestaurantDiversity: 62, visitCount: 2, isReceiptVerified: true },
      { id: 'v47', nickname: '망원미식', rating: 4.5, text: '히레돈까스도 훌륭. 소스 두 가지 다 찍먹 추천.', date: '2025-12-27', visitHour: 18, photoHashes: ['e7','e8'], reviewerTotalReviews: 108, reviewerRestaurantDiversity: 88, visitCount: 6, isReceiptVerified: true },
      { id: 'v48', nickname: '혼밥레이서', rating: 4.0, text: '혼밥 OK. 바 자리 있어서 편해요.', date: '2025-12-10', visitHour: 14, photoHashes: ['e9'], reviewerTotalReviews: 165, reviewerRestaurantDiversity: 143, visitCount: 3, isReceiptVerified: true },
      { id: 'v49', nickname: '동네맛집지도', rating: 4.5, text: '가격 대비 퀄리티 좋아요. 망원 와서 여기 안 들르면 손해.', date: '2025-11-19', visitHour: 12, photoHashes: ['e10'], reviewerTotalReviews: 201, reviewerRestaurantDiversity: 167, visitCount: 8, isReceiptVerified: true },
      { id: 'v50', nickname: '주말점심', rating: 3.5, text: '주말에 가면 웨이팅 길어요. 평일 추천.', date: '2025-11-02', visitHour: 13, photoHashes: ['e11'], reviewerTotalReviews: 52, reviewerRestaurantDiversity: 45, visitCount: 2, isReceiptVerified: true },
    ],
  },
];
