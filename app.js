// 리뷰 데이터를 바탕으로 5개 지표를 계산한다.
// 실제 서비스에선 서버에서 돌아가지만, 여기서는 더미 데이터 기반의 간이 휴리스틱.

function average(xs) {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function variance(xs) {
  const m = average(xs);
  return average(xs.map((x) => (x - m) ** 2));
}

// 1) 리뷰 신뢰도 점수 (0~100)
// - 리뷰어의 리뷰 다양성 (특정 업종만 리뷰하면 감점)
// - 영수증 인증 비율
// - 본문 길이 / 템플릿스러움 (이모지 도배, 짧은 찬양조 감점)
// - 리뷰어 총 리뷰 수 (너무 적으면 체험단 계정 의심)
function reviewCredibility(reviews) {
  const scores = reviews.map((r) => {
    let s = 50;

    // 리뷰어 활동성
    if (r.reviewerTotalReviews >= 50) s += 12;
    else if (r.reviewerTotalReviews >= 20) s += 4;
    else if (r.reviewerTotalReviews < 10) s -= 18;

    // 리뷰어 다양성 (특정 업종만 작성하면 광고 의심)
    const diversityRatio = r.reviewerRestaurantDiversity / Math.max(r.reviewerTotalReviews, 1);
    if (diversityRatio >= 0.85) s += 10;
    else if (diversityRatio < 0.6) s -= 10;

    // 영수증 인증
    if (r.isReceiptVerified) s += 14;
    else s -= 12;

    // 본문 품질 — 이모지 과다 / 짧은 찬양 감점
    const emojiCount = (r.text.match(/[\p{Emoji_Presentation}\p{Extended_Pictographic}💯✨❤️💝💍🍷👏👍📸💕💐🥹🥰]/gu) || []).length;
    const textLen = r.text.replace(/\s/g, '').length;
    if (emojiCount >= 3 && textLen < 80) s -= 15;
    if (textLen < 30) s -= 10;
    if (textLen >= 60 && emojiCount <= 1) s += 6;

    // 극단 별점 + 짧은 글 = 광고 또는 테러 의심
    if ((r.rating >= 4.8 || r.rating <= 1.5) && textLen < 50) s -= 8;

    return Math.max(0, Math.min(100, s));
  });

  return Math.round(average(scores));
}

// 2) 단골 비율 — visitCount >= 2 인 리뷰어 비율
function regularRatio(reviews) {
  const repeat = reviews.filter((r) => r.visitCount >= 2).length;
  return Math.round((repeat / reviews.length) * 100);
}

// 3) 사진 진짜 여부 — 사진 해시의 유니크 비율
//    같은 해시가 여러 리뷰에서 반복 등장하면 바이럴 원본 이미지 재사용 가능성
function photoAuthenticity(reviews) {
  const all = reviews.flatMap((r) => r.photoHashes);
  if (all.length === 0) return 100;
  const counts = {};
  all.forEach((h) => (counts[h] = (counts[h] || 0) + 1));
  const duplicated = Object.values(counts).filter((c) => c >= 2).reduce((a, b) => a + b, 0);
  const uniqueRatio = 1 - duplicated / all.length;
  return Math.round(uniqueRatio * 100);
}

// 4) 방문 시간대 패턴 — 0~23시 히스토그램
function visitHourHistogram(reviews) {
  const bins = Array(24).fill(0);
  reviews.forEach((r) => { bins[r.visitHour] += 1; });
  return bins;
}

function describeVisitPattern(bins) {
  const peakCount = Math.max(...bins);
  const peakHour = bins.indexOf(peakCount);
  const total = bins.reduce((a, b) => a + b, 0);
  const peakShare = Math.round((peakCount / total) * 100);

  let label;
  if (peakHour >= 11 && peakHour <= 14) label = '점심 피크';
  else if (peakHour >= 17 && peakHour <= 20) label = '저녁 피크';
  else if (peakHour >= 21 || peakHour <= 4) label = '야식/심야 피크';
  else label = '애매한 시간대 피크';

  return { label, peakHour, peakShare };
}

// 5) 평점 분산 — 분산이 너무 낮으면 별점 밀어주기 의심, 너무 높으면 호불호 큰 가게
function ratingVariance(reviews) {
  const ratings = reviews.map((r) => r.rating);
  const v = variance(ratings);
  return { variance: v, mean: average(ratings) };
}

// 각 지표를 조합해 종합 판정
function verdict({ credibility, regular, photo, ratingV }) {
  // ratingV.variance 가 0.1 이하 + 평균 4.8+ = 평점 조작 의심 구간
  const tooUniformHigh = ratingV.variance < 0.12 && ratingV.mean >= 4.8;
  // ratingV.variance 가 1.5 이상 = 양극화
  const polarized = ratingV.variance > 1.5;

  const score = credibility * 0.45 + regular * 0.25 + photo * 0.20 + (polarized ? 0 : 10) + (tooUniformHigh ? -15 : 0);

  if (score >= 70 && !tooUniformHigh) return { tag: '진짜 맛집 가능성 높음', klass: 'good' };
  if (score >= 50) return { tag: '애매함 — 직접 가서 확인', klass: 'warn' };
  return { tag: '광고/조작 의심 주의', klass: 'bad' };
}

function classify(value, goodAt, warnAt) {
  if (value >= goodAt) return 'good';
  if (value >= warnAt) return 'warn';
  return 'bad';
}

function formatVariance(v) {
  return v.toFixed(2);
}

// 리뷰 개별 flag — UI 표시용
function reviewFlag(r) {
  const textLen = r.text.replace(/\s/g, '').length;
  const diversity = r.reviewerRestaurantDiversity / Math.max(r.reviewerTotalReviews, 1);
  if (!r.isReceiptVerified && r.reviewerTotalReviews < 10) return { label: '체험단 의심', ok: false };
  if (r.rating >= 4.8 && textLen < 50) return { label: '찬양 단문', ok: false };
  if (diversity < 0.6) return { label: '편향 리뷰어', ok: false };
  if (r.visitCount >= 5 && r.isReceiptVerified) return { label: '검증된 단골', ok: true };
  return null;
}

// --- 렌더링 -----------------------------------------------------------

const $result = document.getElementById('result');
const $input = document.getElementById('q');

function render(restaurant) {
  const { reviews } = restaurant;
  const credibility = reviewCredibility(reviews);
  const regular = regularRatio(reviews);
  const photo = photoAuthenticity(reviews);
  const hist = visitHourHistogram(reviews);
  const pattern = describeVisitPattern(hist);
  const ratingV = ratingVariance(reviews);

  const v = verdict({ credibility, regular, photo, ratingV });

  const credClass = classify(credibility, 70, 50);
  const regularClass = classify(regular, 40, 20);
  const photoClass = classify(photo, 85, 60);

  // 평점 분산 — 0.1이하 의심, 0.1~1.5 정상, 1.5+ 호불호
  let varianceClass, varianceNote;
  if (ratingV.variance < 0.12 && ratingV.mean >= 4.8) {
    varianceClass = 'bad';
    varianceNote = '별점이 거의 전부 만점에 몰려있어요. 광고/조작 가능성이 높습니다.';
  } else if (ratingV.variance > 1.5) {
    varianceClass = 'warn';
    varianceNote = '극단적으로 호불호가 갈려요. 방문 전 낮은 별점 리뷰도 꼭 확인하세요.';
  } else {
    varianceClass = 'good';
    varianceNote = '자연스러운 별점 분포입니다.';
  }

  const maxHour = Math.max(...hist);
  const histBars = hist
    .map((c, i) => `<span class="${c === maxHour && c > 0 ? 'peak' : ''}" style="height:${maxHour === 0 ? 0 : (c / maxHour) * 100}%" title="${i}시: ${c}건"></span>`)
    .join('');

  const reviewItems = reviews.map((r) => {
    const flag = reviewFlag(r);
    const flagHtml = flag ? `<span class="flag ${flag.ok ? 'ok' : ''}">${flag.label}</span>` : '';
    return `
      <div class="review">
        <div class="row1">
          <span class="nick">${r.nickname}</span>
          <span class="rate">★ ${r.rating.toFixed(1)}</span>
          <span>${r.date} · ${r.visitHour}시 방문</span>
          ${flagHtml}
        </div>
        <div>${r.text}</div>
      </div>`;
  }).join('');

  $result.innerHTML = `
    <section class="restaurant-card">
      <div class="emoji">${restaurant.thumbnail}</div>
      <div class="meta">
        <h2>${restaurant.name}</h2>
        <div class="sub">${restaurant.category}</div>
        <div class="addr">${restaurant.address}</div>
      </div>
      <div class="verdict ${v.klass}">${v.tag}</div>
    </section>

    <section class="metrics">
      <div class="metric">
        <div class="label">🛡️ 리뷰 신뢰도 점수</div>
        <div class="value ${credClass}">${credibility}<span style="font-size:14px; color:var(--muted); font-weight:500;"> / 100</span></div>
        <div class="bar ${credClass}"><span style="width:${credibility}%"></span></div>
        <div class="note">영수증 인증, 리뷰어 활동성/다양성, 본문 품질을 종합한 점수예요.</div>
      </div>

      <div class="metric">
        <div class="label">🔁 단골 비율 (재방문 추정)</div>
        <div class="value ${regularClass}">${regular}<span style="font-size:14px; color:var(--muted); font-weight:500;">%</span></div>
        <div class="bar ${regularClass}"><span style="width:${regular}%"></span></div>
        <div class="note">리뷰어 중 2회 이상 방문 기록이 있는 비율. 높을수록 진짜 맛집 가능성 ↑</div>
      </div>

      <div class="metric">
        <div class="label">📸 사진 진짜 여부</div>
        <div class="value ${photoClass}">${photo}<span style="font-size:14px; color:var(--muted); font-weight:500;">%</span></div>
        <div class="bar ${photoClass}"><span style="width:${photo}%"></span></div>
        <div class="note">사진 해시가 서로 얼마나 다른지. 낮으면 홍보용 원본 이미지를 돌려쓴 흔적이에요.</div>
      </div>

      <div class="metric">
        <div class="label">📊 평점 분산</div>
        <div class="value ${varianceClass}">${formatVariance(ratingV.variance)}<span style="font-size:14px; color:var(--muted); font-weight:500;"> (평균 ★${ratingV.mean.toFixed(2)})</span></div>
        <div class="bar ${varianceClass}"><span style="width:${Math.min(100, ratingV.variance * 50)}%"></span></div>
        <div class="note">${varianceNote}</div>
      </div>

      <div class="metric span-2">
        <div class="label">⏰ 방문 시간대 패턴 — ${pattern.label} (${pattern.peakHour}시 · ${pattern.peakShare}%)</div>
        <div class="hist">${histBars}</div>
        <div class="hist-labels"><span>0시</span><span>6시</span><span>12시</span><span>18시</span><span>23시</span></div>
        <div class="note">실제 식사 시간대에 몰려있으면 자연스러운 손님 구성. 오전이나 오후 애매한 시간대에 몰리면 체험단 단체 방문 의심.</div>
      </div>
    </section>

    <section class="reviews">
      <h3>리뷰 ${reviews.length}건 — 의심 리뷰엔 태그가 붙어있어요</h3>
      ${reviewItems}
    </section>
  `;
}

function search(q) {
  if (!q.trim()) return;
  const query = q.trim().toLowerCase();
  const match = RESTAURANTS.find((r) =>
    r.name.toLowerCase().includes(query) ||
    r.category.toLowerCase().includes(query) ||
    r.address.toLowerCase().includes(query),
  );
  if (!match) {
    $result.innerHTML = `<div class="empty">"${q}" 에 해당하는 가게를 찾지 못했어요.<br/>아래 추천 중에서 골라보세요.</div>`;
    return;
  }
  render(match);
}

// 이벤트 바인딩
document.getElementById('search-form').addEventListener('submit', (e) => {
  e.preventDefault();
  search($input.value);
});

document.querySelectorAll('.suggest .chip').forEach((c) => {
  c.addEventListener('click', () => {
    $input.value = c.dataset.q;
    search(c.dataset.q);
  });
});
